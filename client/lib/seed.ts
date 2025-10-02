import { collection, doc, setDoc, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Data contoh untuk laboratorium
const labsData = [
  {
    id: "lab-dasar-1",
    name: "Lab Dasar 1",
    location: "Lantai 3 - Gedung Fasilkom",
    status: "Tersedia",
    image: "/placeholder.svg",
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
    image: "/placeholder.svg",
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
    image: "/placeholder.svg",
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
    image: "/placeholder.svg",
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
};