import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// --- KONFIGURASI --- 
const CSV_FILE_PATH = path.join(process.cwd(), 'prompt', 'jadwal_lab_filtered.csv');

// Initialize Firebase Admin SDK without explicit credentials to use application default
// This should use the credentials from gcloud auth login
console.log('Initializing Firebase Admin SDK...');
try {
  admin.initializeApp({
    projectId: 'laboserve-94e91'
  });
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

const db = getFirestore();

// Fungsi untuk mem-parse nama mata kuliah dan dosen dari format CSV
const parseSubjectAndLecturer = (cellData: string) => {
    if (!cellData || cellData.trim() === '' || cellData.toLowerCase().trim() === 'null') {
        return { className: '', lecturer: '', subject: '' };
    }

    // Format: "IF - 1A (Oman Komarudin) PENGENALAN PEMROGRAMAN"
    // or "SI - 5A (H. Bagja Nugraha) Perencanaan Strategi Sistem Informasi"
    // Perbaiki typo "COUD COMPUTING" menjadi "CLOUD COMPUTING"
    let cleanData = cellData.replace(/COUD COMPUTING/g, 'CLOUD COMPUTING');
    
    const regex = /(.+?)\s*\((.+?)\)\s*(.+)/;
    const match = cleanData.trim().match(regex);
    
    if (match) {
        const className = match[1].trim();  // IF - 1A
        const lecturer = match[2].trim();   // Oman Komarudin
        const subject = match[3].trim();    // PENGENALAN PEMROGRAMAN
        
        return { className, lecturer, subject };
    } else {
        // Jika format tidak sesuai, kembalikan data sebagai subject
        return { className: '', lecturer: '', subject: cleanData.trim() };
    }
};

// Mapping nama lab dari CSV ke ID lab di Firestore
const labNameToIdMap: Record<string, string> = {
    'Lab dasar 1': 'lab-dasar-1',
    'lab dasar2': 'lab-dasar-2', 
    'lab lanjut 1': 'lab-lanjut-1',
    'lab lanjut 2': 'lab-lanjut-2',
};

// Fungsi untuk mengambil nama lab dari ID
const getLabNameFromId = (labId: string) => {
    const entries = Object.entries(labNameToIdMap);
    for (const [name, id] of entries) {
        if (id === labId) {
            // Convert to proper format for display
            return name.charAt(0).toUpperCase() + name.slice(1).replace('2', ' 2').replace('1', ' 1');
        }
    }
    return labId;
};

const seedSchedules = async () => {
    console.log('Reading CSV file...');
    
    try {
        // Baca file CSV
        const csvData = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
        const lines = csvData.split('\n');
        
        console.log(`CSV contains ${lines.length} lines`);
        
        // Ambil header
        const headers = lines[0].split(';');
        console.log('Headers:', headers);
        
        // Ambil data jadwal (skip header)
        const scheduleData = lines.slice(1).filter(line => line.trim() !== '');
        console.log(`Processing ${scheduleData.length} schedule entries...`);
        
        // Hapus dulu semua jadwal fakultas yang lama
        console.log('Deleting existing faculty schedules...');
        const existingSchedules = await db.collection('faculty_schedules').get();
        const deleteBatch = db.batch();
        existingSchedules.docs.forEach(doc => {
            deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();
        console.log(`Deleted ${existingSchedules.size} existing faculty schedules.`);
        
        // Buat batch untuk insert data baru
        const batch = db.batch();
        let entryCount = 0;
        
        for (let i = 0; i < scheduleData.length; i++) {
            const line = scheduleData[i].trim();
            if (!line) continue;
            
            const fields = line.split(';');
            
            if (fields.length < 6) {
                console.warn(`Line ${i + 1} has insufficient fields:`, fields);
                continue;
            }
            
            // Ambil data dari kolom-kolom
            const no = fields[0]?.trim(); // No
            const day = fields[1]?.trim(); // Hari
            const timeSlot = fields[2]?.trim(); // Jam
            const lab1Data = fields[3]?.trim(); // Lab dasar 1
            const lab2Data = fields[4]?.trim(); // lab dasar2
            const lab3Data = fields[5]?.trim(); // lab lanjut 1
            const lab4Data = fields[6]?.trim(); // lab lanjut 2
            
            // Process each lab column
            const labs = [
                { name: 'Lab dasar 1', data: lab1Data },
                { name: 'lab dasar2', data: lab2Data },
                { name: 'lab lanjut 1', data: lab3Data },
                { name: 'lab lanjut 2', data: lab4Data }
            ];
            
            for (const lab of labs) {
                if (lab.data && lab.data.trim() !== '' && lab.data.toLowerCase().trim() !== 'null') {
                    const { className, lecturer, subject } = parseSubjectAndLecturer(lab.data);
                    
                    // Ambil ID lab dari mapping
                    const labId = labNameToIdMap[lab.name];
                    if (!labId) {
                        console.warn(`Unknown lab: ${lab.name}`);
                        continue;
                    }
                    
                    // Periksa dan sesuaikan interval waktu khusus
                    let adjustedTimeSlot = timeSlot;
                    
                    // Jika ini mata kuliah "Budaya Bangsa" di Rabu 12.30-15.00, ubah menjadi 12.30-14.10
                    if (day === 'RABU' && timeSlot === '12.30 - 15.00' && subject.includes('Budaya Bangsa')) {
                        adjustedTimeSlot = '12.30 - 14.10';
                    }
                    
                    // Buat dokumen jadwal
                    const scheduleRef = db.collection('faculty_schedules').doc();
                    batch.set(scheduleRef, {
                        day: day,
                        timeSlot: adjustedTimeSlot,
                        originalTimeSlot: timeSlot, // Simpan juga waktu asli untuk referensi
                        labId: labId,
                        labName: getLabNameFromId(labId),
                        subject: subject,
                        lecturer: lecturer,
                        className: className,
                        type: 'faculty',
                        facultyId: 'FTI', // Default faculty ID - bisa diupdate sesuai kebutuhan
                        facultyName: 'Fakultas Teknologi Informasi', // Default faculty name
                        semester: '2024/2025', // Default semester
                        academicYear: '2024/2025', // Default academic year
                        createdAt: Timestamp.fromDate(new Date()),
                        updatedAt: Timestamp.fromDate(new Date())
                    });
                    
                    entryCount++;
                }
            }
        }
        
        // Commit batch
        await batch.commit();
        console.log(`Successfully seeded ${entryCount} schedule entries to Firestore.`);
        
        // Verify by reading some entries back
        console.log('\nVerifying the data...');
        const verifySnapshot = await db.collection('faculty_schedules').limit(20).get();
        console.log(`Verified ${verifySnapshot.size} entries in the database.`);
        
        verifySnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- ${data.day} ${data.timeSlot} - ${data.labName}: ${data.className} (${data.lecturer}) - ${data.subject}`);
        });
        
        console.log('\nSeeding completed successfully!');
        
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
};

// Jalankan fungsi seeding
seedSchedules().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});