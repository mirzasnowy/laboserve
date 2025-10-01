import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export type AppUser = {
  uid: string;
  email: string;
  displayName: string | null;
  role: "user";
  type: "mahasiswa" | "dosen";
  npm: string | null;
  nidn: string | null;
  kelas: string | null;
  passwordSet?: boolean;
};

function parseUserType(email: string): Pick<AppUser, "type" | "npm"> {
  const domain = email.split("@")[1] ?? "";
  const local = email.split("@")[0] ?? "";
  const isStudent =
    /student\.unsika\.ac\.id$/i.test(domain) && /^\d+$/.test(local);
  if (isStudent) return { type: "mahasiswa", npm: local };
  return { type: "dosen", npm: null };
}

async function ensureUserDoc(user: User): Promise<AppUser> {
  const ref = doc(collection(db, "users"), user.uid);
  const snap = await getDoc(ref);
  const base = parseUserType(user.email || "");
  const profile: AppUser = {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName,
    role: "user",
    type: base.type,
    npm: base.npm,
    nidn: null,
    kelas: null,
    passwordSet: false,
  };
  if (!snap.exists()) {
    await setDoc(ref, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return profile;
  }
  const data = snap.data() as AppUser;
  return { ...profile, ...data };
}

export type AuthContextType = {
  firebaseUser: User | null;
  profile: AppUser | null;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setPasswordForUser: (password: string) => Promise<void>;
  saveNIDN: (nidn: string) => Promise<void>;
  saveClass: (kelas: string) => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setFirebaseUser(user);
        if (user?.email) {
          const emailDomain = user.email.split("@")[1];
          if (!/^(student\.)?unsika\.ac\.id$/i.test(emailDomain || "")) {
            setError(
              "Email yang Anda gunakan tidak terdaftar. Silakan gunakan email @unsika.ac.id atau @student.unsika.ac.id.",
            );
            await signOut(auth);
            setProfile(null);
            return;
          }
          const doc = await ensureUserDoc(user);
          setProfile(doc);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error during auth state change:", err);
        setError("Terjadi kesalahan saat memuat data pengguna.");
        setProfile(null);
        setFirebaseUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    // Clear previous errors on new login attempt
    setError(null);
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Login error:", err.code);
      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Email atau kata sandi yang Anda masukan salah.");
          break;
        case "auth/invalid-email":
          setError("Format email yang Anda masukan tidak valid.");
          break;
        default:
          setError(
            "Terjadi kesalahan yang tidak diketahui saat mencoba masuk.",
          );
          break;
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const clearError = () => {
    setError(null);
  };

  const setPasswordForUser = async (password: string) => {
    if (!auth.currentUser || !auth.currentUser.email)
      throw new Error("No user");
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password,
    );
    await linkWithCredential(auth.currentUser, credential);
    const ref = doc(db, "users", auth.currentUser.uid);
    await updateDoc(ref, { passwordSet: true, updatedAt: serverTimestamp() });
    setProfile((p) => (p ? { ...p, passwordSet: true } : p));
  };

  const saveNIDN = async (nidn: string) => {
    if (!auth.currentUser) throw new Error("No user");
    const ref = doc(db, "users", auth.currentUser.uid);
    await updateDoc(ref, { nidn, updatedAt: serverTimestamp() });
    setProfile((p) => (p ? { ...p, nidn } : p));
  };

  const saveClass = async (kelas: string) => {
    if (!auth.currentUser) throw new Error("No user");
    const ref = doc(db, "users", auth.currentUser.uid);
    await updateDoc(ref, { kelas, updatedAt: serverTimestamp() });
    setProfile((p) => (p ? { ...p, kelas } : p));
  };

  const value = useMemo<AuthContextType>(
    () => ({
      firebaseUser,
      profile,
      loading,
      error,
      loginWithGoogle,
      loginWithEmail,
      logout,
      setPasswordForUser,
      saveNIDN,
      saveClass,
      clearError,
    }),
    [firebaseUser, profile, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
