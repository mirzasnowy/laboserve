import { useState, useEffect } from 'react';
import { doc, getDoc, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lab } from './useLabs'; // Assuming Lab interface is exported from useLabs

// We can extend the Lab interface if there are more details on the detail page
export interface LabDetail extends Lab {
  specifications: Record<string, number>;
  // Add other detailed fields as necessary, e.g., schedules
}

const formatLabDetail = (doc: DocumentSnapshot<DocumentData>): LabDetail | null => {
    if (!doc.exists()) {
        return null;
    }
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name || 'Unknown Lab',
        location: data.location || 'Unknown Location',
        status: data.status || 'Maintenance',
        image: data.image || '/placeholder.svg',
        specifications: data.specifications || {},
    };
};

export const useLabDetail = (labId: string | undefined) => {
  const [lab, setLab] = useState<LabDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!labId) {
      setLoading(false);
      setError("No lab ID provided.");
      return;
    }

    const fetchLabDetail = async () => {
      try {
        setLoading(true);
        const labDocRef = doc(db, 'labs', labId);
        const labSnapshot = await getDoc(labDocRef);
        const labData = formatLabDetail(labSnapshot);

        if (labData) {
            setLab(labData);
        } else {
            setError(`Tidak ada data untuk lab dengan ID: ${labId}`);
        }

      } catch (err) {
        console.error("Error fetching lab detail:", err);
        setError('Gagal memuat data detail laboratorium.');
      } finally {
        setLoading(false);
      }
    };

    fetchLabDetail();
  }, [labId]);

  return { lab, loading, error };
};
