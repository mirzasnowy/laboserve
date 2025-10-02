import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Home,
  Calendar,
  FileText,
  Search,
  PanelLeft,
  AlertTriangle,
  User,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/sidebar";
import { useAuth } from '@/hooks/useAuth';
import { useLabs, Lab } from "@/hooks/useLabs";
import { NotificationBell } from '@/components/ui/NotificationBell';

const StatusBadge = ({ status }: { status: Lab['status'] }) => {
  return (
    <span
      className={cn(
        "text-xs font-semibold",
        status === "Tersedia" && "text-green-600",
        (status === "Tidak Tersedia" || status === "Penuh Hari Ini") && "text-red-600",
        status === "Maintenance" && "text-yellow-600",
      )}
    >
      {status}
    </span>
  );
};

const LabCard = ({ lab }: { lab: Lab }) => {
  const isBookable = lab.status === "Tersedia";

  return (
    <Card className={cn(
        "flex items-center p-4 space-x-4 overflow-hidden w-full",
        !isBookable && "bg-gray-50"
      )}>
      <img
        src={lab.image}
        alt={lab.name}
        className={cn("w-20 h-20 md:w-24 md:h-24 object-cover rounded-md", !isBookable && "grayscale")}
      />
      <div className="flex-grow">
        <p className="text-xs text-gray-500">{lab.location}</p>
        <h3 className="text-base md:text-lg font-bold text-gray-900">
          {lab.name}
        </h3>
        <p className="text-sm text-gray-600 mt-1">Status Kelas :</p>
        <StatusBadge status={lab.status} />
      </div>
      <Button
        asChild
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 self-end"
        disabled={!isBookable}
      >
        <Link to={`/lab/${lab.id}`} aria-disabled={!isBookable} onClick={(e) => !isBookable && e.preventDefault()}>
            Cek Kelas
        </Link>
      </Button>
    </Card>
  )
};

const LabCardSkeleton = () => (
  <Card className="flex items-center p-4 space-x-4 overflow-hidden w-full">
    <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-md" />
    <div className="flex-grow space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
    <Skeleton className="h-9 w-24 rounded-md" />
  </Card>
);

const DashboardContent = () => {
  const { toggleSidebar } = useSidebar();
  const { labs, loading, error } = useLabs();
  const { logout } = useAuth();

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 4 }).map((_, i) => (
        <LabCardSkeleton key={i} />
      ));
    }

    if (error) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center text-center py-10">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-600">
            Gagal Memuat Data
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      );
    }

    if (labs.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center text-center py-10">
          <h3 className="text-lg font-semibold">Tidak Ada Laboratorium</h3>
          <p className="text-gray-600">
            Belum ada data laboratorium yang tersedia.
          </p>
        </div>
      );
    }

    return labs.map((lab) => <LabCard key={lab.id} lab={lab} />);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      {/* --- Sidebar (Desktop) --- */}
      <Sidebar className="hidden md:flex flex-col">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
            <h1 className="font-bold text-lg">Lab Unsika</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive tooltip="Home">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Jadwal">
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
        <header className="bg-white md:bg-transparent p-4 shadow-sm md:shadow-none sticky top-0 z-10">
          <div className="flex justify-between items-center w-full">
            {/* Left side for mobile: Sidebar Trigger and Title */}
            <div className="flex items-center gap-2 md:hidden">
              <SidebarTrigger />
              <h1 className="font-bold text-lg">Pilih Laboratorium</h1>
            </div>

            {/* Center for desktop: Search bar */}
            <div className="relative w-full max-w-xs hidden md:block">
              <Input
                type="text"
                placeholder="Cari Ruangan"
                className="bg-white rounded-full pl-10 h-10 shadow-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

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
          <h1 className="text-2xl font-bold text-gray-800 mb-4 hidden md:block">
            Pilih Laboratorium
          </h1>
          {/* Search for Mobile */}
          <div className="relative mb-4 md:hidden">
            <Input
              type="text"
              placeholder="Cari Ruangan"
              className="bg-white rounded-full pl-10 h-12 shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Labs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {renderContent()}
          </div>
        </main>
      </SidebarInset>

      {/* --- Bottom Navigation (Mobile) --- */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center gap-1 text-gray-500"
        >
          <PanelLeft className="w-6 h-6" />
          <span className="text-xs">Menu</span>
        </button>
        <div className="flex flex-col items-center gap-1 text-blue-600">
          <Home className="w-6 h-6" />
          <span className="text-xs font-semibold">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-500">
          <Calendar className="w-6 h-6" />
          <span className="text-xs">Jadwal</span>
        </div>
      </footer>
    </div>
  );
};

export default function Dashboard() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}
