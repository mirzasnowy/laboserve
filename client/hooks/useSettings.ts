import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AppSettings {
  logoUrl?: string;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'general');

    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      } else {
        setSettings({}); // No settings found
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching settings: ", error);
      setSettings({}); // On error, use empty settings
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading };
};
