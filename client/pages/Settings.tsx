import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { updatePassword } from "firebase/auth";

export default function Settings() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async () => {
    if (!firebaseUser) return;
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword.length < 6) {
        toast({
            title: 'Error',
            description: 'Password should be at least 6 characters.',
            variant: 'destructive',
        });
        return;
    }

    setIsSaving(true);

    try {
      await updatePassword(firebaseUser, newPassword);
      toast({
        title: 'Success',
        description: 'Password updated successfully.',
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Error updating password: ", error);
      toast({
        title: 'Error',
        description: 'Failed to update password. You may need to log in again to perform this operation.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout pageTitle="Settings">
      <div className="space-y-6">
        <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Pengaturan Akun
            </h1>
            <p className="text-gray-600 text-sm">Kelola pengaturan akun Anda.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Ubah Password</CardTitle>
            <CardDescription>Pastikan Anda menggunakan password yang kuat.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <Button onClick={handlePasswordChange} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                  Ubah Password
              </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
