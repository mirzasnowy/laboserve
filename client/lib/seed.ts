import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Data contoh untuk laboratorium
const labsData = [
  {
    id: 'lab-dasar-1',
    name: 'Lab Dasar 1',
    location: 'Lantai 3 - Gedung Fasilkom',
    status: 'Tersedia',
    image: '/placeholder.svg',
    specifications: {
        Komputer: 30,
        Infocus: 1,
        HDMI: 1,
    }
  },
  {
    id: 'lab-dasar-2',
    name: 'Lab Dasar 2',
    location: 'Lantai 3 - Gedung Fasilkom',
    status: 'Tidak Tersedia',
    image: '/placeholder.svg',
    specifications: {
        Komputer: 35,
        Infocus: 1,
        HDMI: 0,
    }
  },
  {
    id: 'lab-lanjut-1',
    name: 'Lab Lanjut 1',
    location: 'Lantai 3 - Gedung Fasilkom',
    status: 'Maintenance',
    image: '/placeholder.svg',
    specifications: {
        Komputer: 25,
        Infocus: 2,
        HDMI: 1,
    }
  },
  {
    id: 'lab-lanjut-2',
    name: 'Lab Lanjut 2',
    location: 'Lantai 3 - Gedung Fasilkom',
    status: 'Tersedia',
    image: '/placeholder.svg',
    specifications: {
        Komputer: 30,
        Infocus: 1,
        HDMI: 1,
    }
  },
];

/**
 * Fungsi untuk mengisi data awal ke Firestore.
 * Fungsi ini akan memeriksa apakah koleksi 'labs' sudah ada isinya.
 * Jika kosong, maka akan diisi dengan data dari `labsData`.
 */
export const seedDatabase = async () => {
  const labsCollectionRef = collection(db, 'labs');
  const snapshot = await getDocs(labsCollectionRef);

  if (!snapshot.empty) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  console.log('Seeding database...');
  const promises = labsData.map(async (lab) => {
    const { id, ...labData } = lab;
    const docRef = doc(db, 'labs', id);
    await setDoc(docRef, labData);
  });

  await Promise.all(promises);
  console.log('Database seeded successfully!');
};
