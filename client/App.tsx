import "./global.css";
import { useEffect } from "react";
import { seedDatabase } from "./lib/seed";
import { updateLabImages } from "./lib/update-lab-images";
import { requestForToken } from "./lib/notifications";
import { onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  Navigate,
} from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import LabDetail from "./pages/LabDetail"; // Import the new page
import AdminDashboard from "./pages/AdminDashboard"; // Import the admin page
import HistoryReservation from "./pages/HistoryReservation";
import Jadwal from "./pages/Jadwal";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

// This component listens for auth errors and displays them as toasts.
const AuthErrorNotifier = () => {
  const { error, clearError } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Login Gagal",
        description: error,
        variant: "destructive",
      });
      clearError(); // Reset the error after showing it
    }
  }, [error, clearError, toast]);

  return null; // This component does not render anything.
};

const MainLayout = () => {
  const { profile, loading, firebaseUser } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (profile && firebaseUser) {
      requestForToken(firebaseUser.uid, profile.role);
    }
  }, [profile, firebaseUser]);

  useEffect(() => {
    if (!profile || !firebaseUser) return;

    // Set up foreground message listener with proper cleanup
    const unsubscribe = onMessage(messaging, (payload) => {
      toast({
        title: payload.notification?.title || 'Notifikasi Baru',
        description: payload.notification?.body || 'Anda memiliki notifikasi baru.',
      });
    });

    return () => {
      unsubscribe();
    };
  }, [profile, firebaseUser, toast]);

  // 1. While Firebase is initializing, show a global loader.
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  // 2. If auth is resolved and there is no user, they should only see the login page.
  if (!firebaseUser) {
    return location.pathname === '/' ? <Outlet /> : <Navigate to="/" replace />;
  }

  // 3. A user is logged in, but we're still fetching their profile from Firestore.
  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Memuat Profil...</div>;
  }

  // 4. User and profile are loaded. Handle routing based on role (Admin vs. User).
  if (isAdmin) {
    if (location.pathname !== '/admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Outlet />; // Render AdminDashboard
  }

  // 5. Handle regular user onboarding and routing.
  const isPasswordSetupNeeded = !profile.passwordSet;
  const isDetailsSetupNeeded =
    profile.passwordSet &&
    ((profile.type === "dosen" && !profile.nidn) ||
      (profile.type === "mahasiswa" && !profile.kelas));
  const isOnboardingNeeded = isPasswordSetupNeeded || isDetailsSetupNeeded;

  if (isOnboardingNeeded) {
    if (location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
    return <Outlet />; // Render the Onboarding page.
  }

  // Block admin route for non-admins
  if (location.pathname === '/admin') {
      return <Navigate to="/dashboard" replace />;
  }

  // 6. User is fully authenticated and onboarded. Allow dashboard and lab detail pages.
  if (
    location.pathname !== "/dashboard" &&
    !location.pathname.startsWith("/lab") &&
    location.pathname !== "/history-reservation" &&
    location.pathname !== "/jadwal" &&
    location.pathname !== "/profile" &&
    location.pathname !== "/settings"
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />; // Render the Dashboard or LabDetail page.
};

import { Workbox } from 'workbox-window';
import { showReloadPrompt } from './components/ui/ReloadPrompt';

const App = () => {
  useEffect(() => {
    // seedDatabase();
    // updateLabImages();

    if ('serviceWorker' in navigator) {
      const wb = new Workbox('/service-worker.js');

      const showPrompt = () => {
        showReloadPrompt(() => {
          wb.addEventListener('controlling', () => {
            window.location.reload();
          });
          wb.messageSW({ type: 'SKIP_WAITING' });
        });
      };

      wb.addEventListener('waiting', showPrompt);
      wb.register();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AuthErrorNotifier />
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/lab/:labId" element={<LabDetail />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/history-reservation" element={<HistoryReservation />} />
                <Route path="/jadwal" element={<Jadwal />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                {/* Add the new route */}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
