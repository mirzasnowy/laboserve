import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Script untuk update gambar lab yang sudah ada di Firestore
 * Jalankan script ini sekali untuk update semua image URL
 */
export const updateLabImages = async () => {
  // Check if already updated
  const hasUpdated = localStorage.getItem('lab-images-updated');
  if (hasUpdated === 'true') {
    console.log('Lab images already updated. Skipping.');
    return;
  }
  const labImages = [
    {
      id: "lab-dasar-1",
      image: "https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-dasar-1?alt=media",
    },
    {
      id: "lab-dasar-2",
      image: "https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-dasar-2?alt=media",
    },
    {
      id: "lab-lanjut-1",
      image: "https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-lanjut-1?alt=media",
    },
    {
      id: "lab-lanjut-2",
      image: "https://firebasestorage.googleapis.com/v0/b/laboserve-94e91.firebasestorage.app/o/labs%2Flab-lanjut-2?alt=media",
    },
  ];

  console.log("Updating lab images...");
  
  try {
    const updatePromises = labImages.map(async (lab) => {
      const docRef = doc(db, "labs", lab.id);
      await updateDoc(docRef, { image: lab.image });
      console.log(`Updated ${lab.id}`);
    });
    
    await Promise.all(updatePromises);
    console.log("All lab images updated successfully!");
    localStorage.setItem('lab-images-updated', 'true');
  } catch (error) {
    console.error("Error updating lab images:", error);
  }
};