import fs from 'fs';
import path from 'path';

// --- VERIFIKASI DATA CSV ---
const CSV_FILE_PATH = path.join(process.cwd(), '..', 'prompt', 'jadwal_lab_filtered.csv');

console.log('=== VERIFIKASI DATA CSV ===');
console.log('Memastikan data dari CSV sesuai dengan kebutuhan...');

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

console.log('\n--- ANALISIS DATA JADWAL ---');

// Hitung total entri valid (bukan null)
let totalValidEntries = 0;
let nullEntries = 0;

for (let i = 0; i < scheduleData.length; i++) {
    const line = scheduleData[i].trim();
    if (!line) continue;

    const fields = line.split(';');

    if (fields.length < 6) {
        console.warn(`Line ${i + 1} has insufficient fields:`, fields);
        continue;
    }

    // Ambil data dari kolom-kolom
    const no = fields[0]?.trim();
    const day = fields[1]?.trim(); // Hari
    const timeSlot = fields[2]?.trim(); // Jam
    const lab1Data = fields[3]?.trim(); // Lab dasar 1
    const lab2Data = fields[4]?.trim(); // lab dasar2
    const lab3Data = fields[5]?.trim(); // lab lanjut 1
    const lab4Data = fields[6]?.trim(); // lab lanjut 2

    // Periksa setiap lab
    const labs = [
        { name: 'Lab dasar 1', data: lab1Data },
        { name: 'lab dasar2', data: lab2Data },
        { name: 'lab lanjut 1', data: lab3Data },
        { name: 'lab lanjut 2', data: lab4Data }
    ];

    for (const lab of labs) {
        if (lab.data && lab.data.trim() !== '' && lab.data.toLowerCase().trim() !== 'null') {
            totalValidEntries++;
            
            // Cek apakah ada informasi interval waktu khusus dalam nama mata kuliah
            let adjustedTimeSlot = timeSlot;
            let isSpecial = false;
            
            if (lab.data.includes('(12.30-14.10, tidak sampai 15.00)')) {
                adjustedTimeSlot = '12.30 - 14.10';
                isSpecial = true;
                console.log(`SPECIAL - ${day} ${timeSlot} -> ${adjustedTimeSlot} - ${lab.name}: ${lab.data} (akan dipecah slot waktunya)`);
            } else if (lab.data.includes('Metodologi Penelitian Sistem Informasi') && day === 'JUMAT') {
                // Cek apakah ini entri Jumat dengan waktu 13.00-14.40
                if (timeSlot === '12.30 - 15.00') {
                    adjustedTimeSlot = '13.00 - 14.40';
                    isSpecial = true;
                    console.log(`SPECIAL - ${day} ${timeSlot} -> ${adjustedTimeSlot} - ${lab.name}: ${lab.data} (akan dipecah slot waktunya)`);
                }
            } else {
                console.log(`VALID - ${day} ${timeSlot} - ${lab.name}: ${lab.data}`);
            }
            
            if (!isSpecial) {
                console.log(`VALID - ${day} ${timeSlot} - ${lab.name}: ${lab.data}`);
            }
        } else if (lab.data && lab.data.toLowerCase().trim() === 'null') {
            nullEntries++;
            console.log(`NULL - ${day} ${timeSlot} - ${lab.name}: ${lab.data} (akan diabaikan)`);
        }
    }
}

console.log(`\n--- REKAPITULASI ---`);
console.log(`Total entri valid: ${totalValidEntries}`);
console.log(`Total entri null (akan diabaikan): ${nullEntries}`);

console.log(`\n--- SPESIAL CASES YANG DIPERHATIKAN ---`);
console.log('1. Rabu 12.30 - 14.10 dan 14.10 - 15.30: Dua slot waktu berbeda, entri ke-7 dan ke-8');
console.log('2. Jumat 14.40 - 15.30: Bukan slot 15.00-17.30 biasa, entri ke-16');
console.log('3. Jumat 07.00-09.30: Bukan slot 07.30-10.00 biasa, entri ke-14');

// Tampilkan contoh data spesifik
console.log(`\n--- CONTOH DATA SPESIFIK ---`);
// Ambil contoh beberapa entri untuk verifikasi
const examples = [
    { index: 6, desc: "Rabu 12.30 - 14.10 (baris 7)" }, // Harusnya entri ke-7
    { index: 7, desc: "Rabu 14.10 - 15.30 (baris 8)" }, // Harusnya entri ke-8  
    { index: 13, desc: "Jumat 07.00-09.30 (baris 14)" }, // Harusnya entri ke-14
    { index: 15, desc: "Jumat 14.40 - 15.30 (baris 16)" } // Harusnya entri ke-16
];

for (const example of examples) {
    if (example.index < scheduleData.length) {
        const fields = scheduleData[example.index].split(';');
        console.log(`${example.desc}:`);
        console.log(`  Hari: ${fields[1]?.trim()}`);
        console.log(`  Waktu: ${fields[2]?.trim()}`);
        console.log(`  Lab dasar 1: ${fields[3]?.trim()}`);
        console.log(`  lab dasar2: ${fields[4]?.trim()}`);
        console.log(`  lab lanjut 1: ${fields[5]?.trim()}`);
        console.log(`  lab lanjut 2: ${fields[6]?.trim()}`);
        console.log('');
    }
}

console.log(`\n--- VERIFIKASI PENGELOLAAN DATA NULL ---`);
// Cari dan tampilkan semua entri null
for (let i = 0; i < scheduleData.length; i++) {
    const line = scheduleData[i].trim();
    if (!line) continue;

    const fields = line.split(';');
    const day = fields[1]?.trim();
    const timeSlot = fields[2]?.trim();
    const lab1Data = fields[3]?.trim();
    const lab2Data = fields[4]?.trim();
    const lab3Data = fields[5]?.trim();
    const lab4Data = fields[6]?.trim();

    if (lab1Data && lab1Data.toLowerCase().trim() === 'null') {
        console.log(`Null di Lab dasar 1: ${day} ${timeSlot}`);
    }
    if (lab2Data && lab2Data.toLowerCase().trim() === 'null') {
        console.log(`Null di lab dasar2: ${day} ${timeSlot}`);
    }
    if (lab3Data && lab3Data.toLowerCase().trim() === 'null') {
        console.log(`Null di lab lanjut 1: ${day} ${timeSlot}`);
    }
    if (lab4Data && lab4Data.toLowerCase().trim() === 'null') {
        console.log(`Null di lab lanjut 2: ${day} ${timeSlot}`);
    }
}

console.log('\nVerifikasi selesai. Data siap untuk diseed ke Firestore.');