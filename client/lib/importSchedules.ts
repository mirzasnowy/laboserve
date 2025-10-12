import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ScheduleEntry {
  no: string;
  day: string;
  time: string;
  labDasar1: string;
  labDasar2: string;
  labLanjut1: string;
  labLanjut2: string;
}

interface ParsedSchedule {
  day: string;
  timeSlot: string;
  labId: string;
  labName: string;
  subject: string;
  lecturer: string;
  className: string;
}

const labNameToId: Record<string, string> = {
  'Lab Dasar 1': 'lab-dasar-1',
  'Lab Dasar 2': 'lab-dasar-2',
  'Lab Lanjut 1': 'lab-lanjut-1',
  'Lab Lanjut 2': 'lab-lanjut-2',
};

/**
 * Parse schedule entry text like "IF - 1A (Oman Komarudin) PENGENALAN PEMROGRAMAN"
 */
function parseScheduleText(text: string): { subject: string; lecturer: string; className: string } | null {
  if (!text || text.trim() === '') return null;
  
  const match = text.match(/^(.+?)\s+\(([^)]+)\)\s+(.+)$/);
  if (match) {
    return {
      className: match[1].trim(),
      lecturer: match[2].trim(),
      subject: match[3].trim(),
    };
  }
  
  // Fallback parsing
  return {
    className: '',
    lecturer: '',
    subject: text.trim(),
  };
}

/**
 * Parse CSV data and convert to schedule entries
 */
export function parseScheduleCSV(csvText: string): ParsedSchedule[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const schedules: ParsedSchedule[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(';');
    
    if (parts.length < 7) continue;
    
    const day = parts[1]?.trim();
    const time = parts[2]?.trim();
    const labs = [
      { name: 'Lab Dasar 1', text: parts[3]?.trim() },
      { name: 'Lab Dasar 2', text: parts[4]?.trim() },
      { name: 'Lab Lanjut 1', text: parts[5]?.trim() },
      { name: 'Lab Lanjut 2', text: parts[6]?.trim() },
    ];
    
    for (const lab of labs) {
      const parsed = parseScheduleText(lab.text);
      if (parsed) {
        schedules.push({
          day,
          timeSlot: time,
          labId: labNameToId[lab.name] || '',
          labName: lab.name,
          subject: parsed.subject,
          lecturer: parsed.lecturer,
          className: parsed.className,
        });
      }
    }
  }
  
  return schedules;
}

/**
 * Import schedules to Firestore faculty_schedules collection
 */
export async function importSchedulesToFirestore(schedules: ParsedSchedule[]) {
  const schedulesRef = collection(db, 'faculty_schedules');
  
  // Check if already imported
  const existingSnapshot = await getDocs(schedulesRef);
  if (!existingSnapshot.empty) {
    console.log('Faculty schedules already imported');
    return;
  }
  
  console.log('Importing faculty schedules...');
  const promises = schedules.map(schedule => 
    addDoc(schedulesRef, {
      ...schedule,
      academicYear: '2024/2025',
      semester: 'Ganjil',
      facultyId: 'fasilkom',
      facultyName: 'Fakultas Ilmu Komputer',
    })
  );
  
  await Promise.all(promises);
  console.log(`Imported ${schedules.length} schedule entries`);
}
