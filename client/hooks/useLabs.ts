import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Lab {
  id: string;
  name: string;
  location: string;
  status: "Tersedia" | "Tidak Tersedia" | "Maintenance";
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

export const useLabs = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setLoading(true);
        const labsCollection = collection(db, "labs");
        const labSnapshot = await getDocs(labsCollection);
        const labsList = labSnapshot.docs.map(formatLab);
        setLabs(labsList);
      } catch (err) {
        console.error("Error fetching labs:", err);
        setError("Gagal memuat data laboratorium.");
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  return { labs, loading, error };
};
