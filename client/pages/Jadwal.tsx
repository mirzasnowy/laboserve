import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Home,
  Calendar,
  History,
  PanelLeft,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/ui/NotificationBell';

const JadwalContent = () => {
  const { toggleSidebar } = useSidebar();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      {/* --- Sidebar (Desktop) --- */}
      <Sidebar className="hidden md:flex flex-col bg-gradient-to-b from-white to-blue-50/30">
        <SidebarHeader className="p-4 border-b border-blue-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">LU</span>
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lab Unsika</h1>
              <p className="text-xs text-gray-500">Portal Reservasi</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Home" to="/dashboard">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive tooltip="Jadwal">
                <Calendar className="w-5 h-5" />
                <span>Jadwal</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="History Reservation" to="/history-reservation">
                <History className="w-5 h-5" />
                <span>History Reservation</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      {/* --- Main Content --- */}
      <SidebarInset className="flex-1 pb-20 md:pb-0">
        {/* Header (Mobile & Desktop) */}
        <header className="bg-white/80 backdrop-blur-xl md:bg-transparent p-4 shadow-sm md:shadow-none sticky top-0 z-10 border-b border-gray-100 md:border-0">
          <div className="flex justify-between items-center w-full">
            {/* Left side for mobile: Sidebar Trigger and Title */}
            <div className="flex items-center gap-2 md:hidden">
              <SidebarTrigger />
              <h1 className="font-bold text-lg">Jadwal</h1>
            </div>

            {/* Center for desktop: Empty space for consistency */}
            <div className="hidden md:block flex-1"></div>

            {/* Right side for both: Notifications and Profile Dropdown */}
            <div className="flex items-center gap-2">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4">
          <div className="mb-6 hidden md:block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Jadwal Laboratorium
            </h1>
            <p className="text-gray-600 text-sm">Lihat jadwal penggunaan laboratorium</p>
          </div>
          <div className="glass shadow-elegant rounded-2xl p-8 text-center border-0">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mb-4">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Halaman Jadwal</h2>
            <p className="text-gray-600">Fitur jadwal sedang dalam pengembangan.</p>
          </div>
        </main>
      </SidebarInset>

      {/* --- Bottom Navigation (Mobile) --- */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-500">
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/jadwal" className="flex flex-col items-center gap-1 text-blue-600">
          <Calendar className="w-6 h-6" />
          <span className="text-xs font-semibold">Jadwal</span>
        </Link>
        <Link to="/history-reservation" className="flex flex-col items-center gap-1 text-gray-500">
          <History className="w-6 h-6" />
          <span className="text-xs">History</span>
        </Link>
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center gap-1 text-gray-500"
        >
          <PanelLeft className="w-6 h-6" />
          <span className="text-xs">Menu</span>
        </button>
      </footer>
    </div>
  );
};

export default function Jadwal() {
  return (
    <SidebarProvider>
      <JadwalContent />
    </SidebarProvider>
  );
}
