import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Lab {
  id: string;
  name: string;
  location: string;
  status: "Tersedia" | "Tidak Tersedia" | "Maintenance" | "Penuh Hari Ini";
  image: string;
}

const formatLab = (doc: QueryDocumentSnapshot<DocumentData>): Lab => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || "Unknown Lab",
    location: data.location || "Unknown Location",
    status: data.status || "Maintenance",
    image: data.image || "/placeholder.svg",
  };
};

const TOTAL_SLOTS = 4;

export const useLabs = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabsAndAvailability = async () => {
      try {
        setLoading(true);
        // 1. Fetch all labs
        const labsCollection = collection(db, "labs");
        const labSnapshot = await getDocs(labsCollection);
        const labsList = labSnapshot.docs.map(formatLab);

        // 2. Check for fully booked labs for today
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        const reservationsQuery = query(
          collection(db, "reservations"),
          where("date", ">=", startOfToday),
          where("date", "<=", endOfToday),
          where("status", "==", "approved")
        );

        const reservationSnapshot = await getDocs(reservationsQuery);
        const approvedReservations = reservationSnapshot.docs.map(doc => doc.data());

        // Create a map of labId to its approved slot count for today
        const todaysBookedCounts = approvedReservations.reduce((acc, res) => {
          acc[res.labId] = (acc[res.labId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // 3. Update lab status if fully booked
        const updatedLabsList = labsList.map(lab => {
          if (lab.status === 'Tersedia' && (todaysBookedCounts[lab.id] || 0) >= TOTAL_SLOTS) {
            return { ...lab, status: 'Penuh Hari Ini' as const };
          }
          return lab;
        });

        setLabs(updatedLabsList);

      } catch (err) {
        console.error("Error fetching labs:", err);
        setError("Gagal memuat data laboratorium.");
      } finally {
        setLoading(false);
      }
    };

    fetchLabsAndAvailability();
  }, []);

  return { labs, loading, error };
};
