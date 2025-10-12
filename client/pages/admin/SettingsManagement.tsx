import React, { useEffect, useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebaseImage } from '@/hooks/useFirebaseImage';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface AppSettings {
  logoUrl?: string;
}

export function SettingsManagement() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const { imageUrl: currentLogoUrl, loading: logoLoading } = useFirebaseImage(settings?.logoUrl);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const settingsDocRef = doc(db, 'settings', 'general');
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      } else {
        setSettings({}); // No settings found, start with empty object
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!newLogoFile) return;

    setIsSaving(true);

    const logoPath = 'app/logo.png';
    const logoRef = ref(storage, logoPath);
    await uploadBytes(logoRef, newLogoFile);

    const logoUri = `gs://${logoRef.bucket}/${logoRef.fullPath}`;

    const settingsDocRef = doc(db, 'settings', 'general');
    await setDoc(settingsDocRef, { logoUrl: logoUri }, { merge: true });

    setSettings({ ...settings, logoUrl: logoUri });
    setNewLogoFile(null);
    setIsSaving(false);
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Aplikasi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Logo Aplikasi Saat Ini</Label>
          <div className="w-24 h-24 border rounded-md flex items-center justify-center">
            {logoLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <img src={currentLogoUrl || '/placeholder.svg'} alt="Current App Logo" className="object-contain w-full h-full" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo-upload">Upload Logo Baru</Label>
          <Input id="logo-upload" type="file" accept="image/*" onChange={(e) => e.target.files && setNewLogoFile(e.target.files[0])} />
          {newLogoFile && <p className="text-sm text-gray-500">File dipilih: {newLogoFile.name}</p>}
        </div>

        <Button onClick={handleSave} disabled={isSaving || !newLogoFile}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
          Simpan Logo
        </Button>
      </CardContent>
    </Card>
  );
}
