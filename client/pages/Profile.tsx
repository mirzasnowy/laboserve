import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function Profile() {
  const { profile, loading: authLoading, firebaseUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [kelas, setKelas] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setKelas(profile.kelas || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!firebaseUser) return;
    setIsSaving(true);

    const userDocRef = doc(db, 'users', firebaseUser.uid);

    try {
      const dataToUpdate: any = {
        displayName,
        updatedAt: serverTimestamp(),
      };

      if (profile?.type === 'mahasiswa') {
        dataToUpdate.kelas = kelas;
      }

      await updateDoc(userDocRef, dataToUpdate);

      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !profile) {
    return (
      <AppLayout pageTitle="Profile">
        <div>Loading profile...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Profile">
      <div className="space-y-6">
        <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Profil Saya
            </h1>
            <p className="text-gray-600 text-sm">Lihat dan perbarui informasi personal Anda.</p>
        </div>
        <Card>
            <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nama Tampilan</Label>
                    <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} disabled />
                  </div>

                  {profile.type === 'mahasiswa' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="npm">NPM</Label>
                        <Input id="npm" value={profile.npm || 'Not set'} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kelas">Kelas</Label>
                        <Input id="kelas" value={kelas} onChange={(e) => setKelas(e.target.value)} />
                      </div>
                    </>
                  )}

                  {profile.type === 'dosen' && (
                    <div className="space-y-2">
                      <Label htmlFor="nidn">NIDN</Label>
                      <Input id="nidn" value={profile.nidn || 'Not set'} disabled />
                    </div>
                  )}
                </div>
                <Button className="mt-6" onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Perubahan
                </Button>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
