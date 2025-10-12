import { collection, doc, setDoc, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseScheduleCSV, importSchedulesToFirestore } from './importSchedules';

// Data contoh untuk laboratorium
const labsData = [
  {
    id: "lab-dasar-1",
    name: "Lab Dasar 1",
    location: "Lantai 3 - Gedung Fasilkom",
    status: "Tersedia",
    image: "https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-dasar-1?alt=media",
    specifications: {
      Komputer: 30,
      Infocus: 1,
      HDMI: 1,
    },
  },
  {
    id: "lab-dasar-2",
    name: "Lab Dasar 2",
    location: "Lantai 3 - Gedung Fasilkom",
    status: "Tidak Tersedia",
    image: "https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-dasar-2?alt=media",
    specifications: {
      Komputer: 35,
      Infocus: 1,
      HDMI: 0,
    },
  },
  {
    id: "lab-lanjut-1",
    name: "Lab Lanjut 1",
    location: "Lantai 3 - Gedung Fasilkom",
    status: "Maintenance",
    image: "https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-lanjut-1?alt=media",
    specifications: {
      Komputer: 25,
      Infocus: 2,
      HDMI: 1,
    },
  },
  {
    id: "lab-lanjut-2",
    name: "Lab Lanjut 2",
    location: "Lantai 3 - Gedung Fasilkom",
    status: "Tersedia",
    image: "https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-lanjut-2?alt=media",
    specifications: {
      Komputer: 30,
      Infocus: 1,
      HDMI: 1,
    },
  },
];

const scheduleData = [
  { day: "Senin", time: "07.30 - 08.20", room: "LAB DASAR 1", subject: "JARINGAN KOMPUTER", class: "IF - 3E (Agung Susilo Yudha Irawan)" },
  { day: "Senin", time: "07.30 - 08.20", room: "LAB DASAR 2", subject: "Pemrograman Animasi dan Multimedia", class: "SI - 7C (Adhi Rizal)" },
  { day: "Senin", time: "07.30 - 08.20", room: "LAB LANJUT 1", subject: "BLOCKCHAIN", class: "IF - 5D (Aji Primajaya)" },
  { day: "Senin", time: "07.30 - 08.20", room: "LAB LANJUT 2", subject: "INTERNET OF THINGS", class: "IF - 7C (Susilawati)" },
  { day: "Selasa", time: "07.30 - 08.20", room: "LAB DASAR 1", subject: "PENGENALAN PEMROGRAMAN", class: "IF - 1B (Oman Komarudin)" },
  { day: "Selasa", time: "07.30 - 08.20", room: "LAB DASAR 2", subject: "Pemrograman Perangkat Bergerak", class: "SI - 5C (H. Bagja Nugraha)" },
  { day: "Selasa", time: "07.30 - 08.20", room: "LAB LANJUT 1", subject: "DATA MINING", class: "IF - 5C (Betha Nurina Sari)" },
  { day: "Selasa", time: "07.30 - 08.20", room: "LAB LANJUT 2", subject: "Riset Operasi", class: "SI - 5B (Ahmad Khusaeri)" },
  { day: "Rabu", time: "07.30 - 08.20", room: "LAB DASAR 1", subject: "PEMROGRAMAN BERBASIS MOBILE", class: "IF - 5B (Purwantoro)" },
  { day: "Rabu", time: "07.30 - 08.20", room: "LAB DASAR 2", subject: "Algoritma dan Dasar Pemrograman", class: "SI - 1C (Taufik Ridwan)" },
  { day: "Rabu", time: "07.30 - 08.20", room: "LAB LANJUT 1", subject: "FRAMEWORK PEMROGRAMAN WEB", class: "IF - 5C (Dadang Yusup)" },
  { day: "Rabu", time: "07.30 - 08.20", room: "LAB LANJUT 2", subject: "Sistem Enterprise Resource Planning", class: "SI - 5C (Oman Komarudin)" },
  { day: "Kamis", time: "07.30 - 08.20", room: "LAB DASAR 1", subject: "PEMROGRAMAN BERBASIS MOBILE", class: "IF - 5C (Purwantoro)" },
  { day: "Kamis", time: "07.30 - 08.20", room: "LAB DASAR 2", subject: "PEMROGRAMAN BERBASIS MOBILE", class: "IF - 5F (Irfan Sriyono Putro)" },
  { day: "Kamis", time: "07.30 - 08.20", room: "LAB LANJUT 1", subject: "Analisis dan Perancangan Sistem Informasi", class: "SI - 3D (Siska)" },
  { day: "Kamis", time: "07.30 - 08.20", room: "LAB LANJUT 2", subject: "Jaringan Komputer", class: "IF - 3C (Arip Solehudin)" },
  { day: "Jumat", time: "07.00 - 07.50", room: "LAB DASAR 1", subject: "FRAMEWORK PEMROGRAMAN WEB", class: "IF - 5D (Kamal Prihandani)" },
  { day: "Jumat", time: "07.00 - 07.50", room: "LAB DASAR 2", subject: "PEMROGRAMAN BERORIENTASI OBJEK", class: "IF - 3B (Yuyun Umaidah)" },
  { day: "Jumat", time: "07.00 - 07.50", room: "LAB LANJUT 1", subject: "Cloud Computing", class: "IF - 5B (Irfan Sriyono Putro)" },
  { day: "Jumat", time: "07.00 - 07.50", room: "LAB LANJUT 2", subject: "ETIKA PROFESI", class: "IF - 5F (Aries Suharso)" }
];

// CSV data from faculty
const csvScheduleData = `No;Hari;Jam;Lab dasar 1;lab dasar2;lab lanjut 1;lab lanjut 2
1;SENIN;07.30 - 10.00;IF - 1A (Oman Komarudin) PENGENALAN PEMROGRAMAN;IF - 3E (Agung Susilo Yudha Irawan) JARINGAN KOMPUTER;SI - 7C (Adhi Rizal) Pemrograman Animasi dan Multimedia;IF - 5D (Aji Primajaya) BLOCKCHAIN
4;SENIN;10.00 - 12.30;SI - 5A (Kamal Prihandani) Pemrograman Perangkat Bergerak;SI - 3A (Billy Ibrahim Hasbi) Pemrograman Berorientasi Objek;IF - 3B (Betha Nurina Sari) BASIS DATA;IF - 5C (Adhi Rizal) BLOCKCHAIN
7;SENIN;12.30 - 15.00;IF - 3D (Arip Solehudin) JARINGAN KOMPUTER;SI - 3C (Billy Ibrahim Hasbi) Pemrograman Berorientasi Objek;SI - 7PIL (Betha Nurina Sari) Text Mining;IF - 5E (Aji Primajaya) BLOCKCHAIN
10;SENIN;15.00 - 17.30;IF - 3F (Agung Susilo Yudha Irawan) JARINGAN KOMPUTER;SI - 7B (Apriade Voutama) Pemrograman Animasi dan Multimedia;IF - 7PIL A (Rini Mayasari) REKAYASA DAN MANAJEMEN KEBUTUHAN;SI - 1B (Aziz Ma'sum) Transformasi Digital
1;SELASA;07.30 - 10.00;IF - 1B (Oman Komarudin) PENGENALAN PEMROGRAMAN;SI - 5C (H. Bagja Nugraha) Pemrograman Perangkat Bergerak;IF - 5C (Betha Nurina Sari) DATA MINING;IF - 5A (Ratna Mufidah) DATA MINING
4;SELASA;10.00 - 12.30;IF - 3E (Asep Jamaludin) BASIS DATA;IF - 5F (Dadang Yusup) FRAMEWORK PEMROGRAMAN WEB;IF - 5D (Betha Nurina Sari) DATA MINING;IF - 5E (Kamal Prihandani) FRAMEWORK PEMROGRAMAN WEB
7;SELASA;12.30 - 15.00;IF - 1C (Intan Purnamasari) PENGENALAN PEMROGRAMAN;IF - 3A (Arip Solehudin) JARINGAN KOMPUTER;SI - 3D (Billy Ibrahim Hasbi) Pemrograman Berorientasi Objek;SI - 1B (Taufik Ridwan) Algoritma dan Dasar Pemrograman
10;SELASA;15.00 - 17.30;IF - 3C (Asep Jamaludin) BASIS DATA;SI - 5B (Purwantoro) Pemrograman Perangkat Bergerak;IF - 5B (Dadang Yusup) FRAMEWORK PEMROGRAMAN WEB;SI - 1A (Taufik Ridwan) Algoritma dan Dasar Pemrograman
1;RABU;07.30 - 10.00;IF - 5B (Purwantoro) PEMROGRAMAN BERBASIS MOBILE;SI - 1C (Taufik Ridwan) Algoritma dan Dasar Pemrograman;IF - 5C (Dadang Yusup) FRAMEWORK PEMROGRAMAN WEB;SI - 5C (Oman Komarudin) Sistem Enterprise Resource Planning
4;RABU;10.00 - 12.30;IF - 3F (Ratna Mufidah) PEMROGRAMAN BERORIENTASI OBJEK;IF - 5E (Betha Nurina Sari) DATA MINING;IF - 5C (Agung Susilo Yuda Irawan) CLOUD COMPUTING;SI - 3B (Billy Ibrahim Hasbi) Pemrograman Berorientasi Objek
7;RABU;12.30 - 15.00;IF - 3B (Arip Solehudin) JARINGAN KOMPUTER;IF - 5D (Purwantoro) PEMROGRAMAN BERBASIS MOBILE;SI - 1C (Abubakar) Budaya Bangsa (12.30-14.10, tidak sampai 15.00);IF - 5F (Sofi Defiyanti) DATA MINING
10;RABU;15.00 - 17.30;;SI - 3A (Taufik Ridwan) Algoritma & Struktur Data;IF - 5E (Purwantoro) PEMROGRAMAN BERBASIS MOBILE;SI - 3C (Ahmad Khusaeri) Algoritma & Struktur Data
1;KAMIS;07.30 - 10.00;IF - 3C (Arip Solehudin) JARINGAN KOMPUTER;SI - 5B (H. Bagja Nugraha) Perencanaan Strategi Sistem Informasi;IF - 5C (Purwantoro) PEMROGRAMAN BERBASIS MOBILE;IF - 5F (Irfan Sriyono Putro) PEMROGRAMAN BERBASIS MOBILE
4;KAMIS;10.00 - 12.30;IF - 3E (Ratna Mufidah) PEMROGRAMAN BERORIENTASI OBJEK;SI - 3B (Taufik Ridwan) Algoritma & Struktur Data;IF - 3D (Asep Jamaludin) BASIS DATA;IF - 7B (Irfan Sriyono Putro) INTERNET OF THINGS
7;KAMIS;12.30 - 15.00;SI - 7C (Hannie) Hukum Paten & Merk;SI - 7PIL (Billy Ibrahim Hasbi) Teknologi Open-Source dan Terbaru;IF - 7PIL (Agung Susilo Yuda Irawan) PENJAMINAN MUTU PERANGKAT LUNAK (SQA);IF - 5A (Purwantoro) PEMROGRAMAN BERBASIS MOBILE
10;KAMIS;15.00 - 17.30;IF - 3D (Ratna Mufidah) PEMROGRAMAN BERORIENTASI OBJEK;IF - 5B (Jajam Haerul Jaman) Data Mining;SI - 7PIL (Hannie) IT in Financial Market;
1;JUMAT;07.00- 09.30;IF - 5B (Irfan Sriyono Putro) CLOUD COMPUTING;IF - 7PIL B (Rini Mayasari) REKAYASA DAN MANAJEMEN KEBUTUHAN;IF - 5D (Kamal Prihandani) FRAMEWORK PEMROGRAMAN WEB;IF - 3B (Yuyun Umaidah) PEMROGRAMAN BERORIENTASI OBJEK
4;JUMAT;09.30- 12.00;IF - 3C (Yuyun Umaidah) Pemrograman Berorientasi Objek;SI - 5A (H. Bagja Nugraha) Perencanaan Strategi Sistem Informasi;IF - 5A (Adhi Rizal) BLOCKCHAIN;IF - 5F (Aji Primajaya) BLOCKCHAIN
7;JUMAT;13.00- 15.30;SI - 5A (Apriade Voutama) Metodologi Penelitian Sistem Informasi (ini dia dari 13.00-14.40, yang lain benar);SI - 3D (Ahmad Khusaeri) Algoritma & Struktur Data;IF - 5B (Adhi Rizal) BLOCKCHAIN;IF - 3F (Yuyun Umaidah) BASIS DATA
10;JUMAT;15.30- 18.00;SI - 1A (Aziz Ma'sum) Transformasi Digital;IF - 5 G CLOUD (Arip Solehudin) COUD COMPUTING;SI - 7B (Nono Heryana) Kapita Selekta Ilmu Komputer;SI - 5C (H. Bagja Nugraha) Perencanaan Strategi Sistem Informasi
`;

/**
 * Fungsi untuk mengisi data awal ke Firestore.
 * Fungsi ini akan memeriksa apakah koleksi 'labs' sudah ada isinya.
 * Jika kosong, maka akan diisi dengan data dari `labsData`.
 */
export const seedDatabase = async () => {
  const labsCollectionRef = collection(db, "labs");
  const labsSnapshot = await getDocs(labsCollectionRef);

  if (labsSnapshot.empty) {
    console.log("Seeding labs...");
    const labPromises = labsData.map(async (lab) => {
      const { id, ...labData } = lab;
      const docRef = doc(db, "labs", id);
      await setDoc(docRef, labData);
    });
    await Promise.all(labPromises);
    console.log("Labs seeded successfully!");
  } else {
    console.log("Labs already seeded. Skipping.");
  }

  const schedulesCollectionRef = collection(db, "schedules");
  const schedulesSnapshot = await getDocs(schedulesCollectionRef);

  if (schedulesSnapshot.empty) {
    console.log("Seeding schedules...");
    const schedulePromises = scheduleData.map(async (schedule) => {
      await addDoc(schedulesCollectionRef, schedule);
    });
    await Promise.all(schedulePromises);
    console.log("Schedules seeded successfully!");
  } else {
    console.log("Schedules already seeded. Skipping.");
  }

  // Import faculty schedules from CSV
  const facultySchedulesRef = collection(db, 'faculty_schedules');
  const facultySchedulesSnapshot = await getDocs(facultySchedulesRef);
  
  if (facultySchedulesSnapshot.empty) {
    console.log('Importing faculty schedules from CSV...');
    const parsedSchedules = parseScheduleCSV(csvScheduleData);
    await importSchedulesToFirestore(parsedSchedules);
    console.log('Faculty schedules imported successfully!');
  } else {
    console.log('Faculty schedules already imported. Skipping.');
  }
};