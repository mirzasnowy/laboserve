import { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export const useFirebaseImage = (gsUri: string | undefined) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gsUri) {
      setLoading(false);
      setImageUrl('/placeholder.svg'); // Default placeholder
      return;
    }

    const fetchImageUrl = async () => {
      try {
        setLoading(true);
        const imageRef = ref(storage, gsUri);
        const url = await getDownloadURL(imageRef);
        setImageUrl(url);
      } catch (err) {
        console.error("Error fetching image from GS URI:", err);
        setError("Gagal memuat gambar.");
        setImageUrl('/placeholder.svg'); // Fallback to placeholder
      } finally {
        setLoading(false);
      }
    };

    fetchImageUrl();
  }, [gsUri]);

  return { imageUrl, loading, error };
};
