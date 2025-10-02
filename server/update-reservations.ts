import { collection, getDocs, doc, writeBatch, getDoc } from "firebase/firestore";
import { db } from "../client/lib/firebase";

const updateReservations = async () => {
  const reservationsRef = collection(db, "reservations");
  const labsRef = collection(db, "labs");
  const reservationsSnapshot = await getDocs(reservationsRef);

  if (reservationsSnapshot.empty) {
    console.log("No reservations found to update.");
    return;
  }

  const batch = writeBatch(db);
  let count = 0;

  for (const reservationDoc of reservationsSnapshot.docs) {
    const reservationData = reservationDoc.data();

    // Skip if labName already exists
    if (reservationData.labName) {
      continue;
    }

    const labId = reservationData.labId;
    if (!labId) {
      console.log(`Reservation ${reservationDoc.id} is missing labId.`);
      continue;
    }

    const labDocRef = doc(labsRef, labId);
    const labDoc = await getDoc(labDocRef);

    if (labDoc.exists()) {
      const labData = labDoc.data();
      const labName = labData.name;

      if (labName) {
        const reservationRef = doc(reservationsRef, reservationDoc.id);
        batch.update(reservationRef, { labName });
        count++;
        console.log(`Updating reservation ${reservationDoc.id} with labName: ${labName}`);
      } else {
        console.log(`Lab ${labId} is missing the 'name' field.`);
      }
    } else {
      console.log(`Lab with ID ${labId} not found for reservation ${reservationDoc.id}.`);
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`${count} reservations updated successfully.`);
  } else {
    console.log("No reservations needed an update.");
  }
};

updateReservations().catch(console.error);
