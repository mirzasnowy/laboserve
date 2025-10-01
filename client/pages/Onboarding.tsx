import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

// Step 1: Component for setting the password
const SetPasswordStep = () => {
  const { setPasswordForUser } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password harus minimal 8 karakter.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await setPasswordForUser(password);
      toast({ title: "Sukses", description: "Password berhasil dibuat." });
      // The profile will update, and the parent component will render the next step.
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Gagal membuat password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat Password</CardTitle>
        <CardDescription>
          Sebagai langkah keamanan tambahan, silakan buat password untuk akun
          Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Password Baru
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : "Simpan Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Step 2: Component for setting user details (NIDN or Class)
const SetDetailsStep = () => {
  const { profile, saveNIDN, saveClass } = useAuth();
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);

  const isStudent = profile?.type === "mahasiswa";
  const label = isStudent ? "Kelas" : "NIDN";
  const placeholder = isStudent ? "Contoh: TIF 22 A" : "Masukkan NIDN Anda";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    setLoading(true);
    try {
      if (isStudent) {
        await saveClass(detail);
      } else {
        await saveNIDN(detail);
      }
      toast({ title: "Sukses", description: "Profil berhasil diperbarui." });
      // The profile will update, and MainLayout will redirect to the dashboard.
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lengkapi Profil Anda</CardTitle>
        <CardDescription>
          Silakan isi informasi berikut untuk menyelesaikan pendaftaran.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <Input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={placeholder}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : "Lanjutkan ke Dasbor"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function Onboarding() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat profil...
      </div>
    );
  }

  const isPasswordSet = profile.passwordSet;
  const isDetailsSet =
    (profile.type === "dosen" && !!profile.nidn) ||
    (profile.type === "mahasiswa" && !!profile.kelas);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {!isPasswordSet ? (
          <SetPasswordStep />
        ) : !isDetailsSet ? (
          <SetDetailsStep />
        ) : (
          <p>Menyelesaikan...</p>
        )}
      </div>
    </div>
  );
}
