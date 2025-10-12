import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Calendar, History, PanelLeft, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { NotificationBell } from '@/components/ui/NotificationBell';


interface Reservation {
  id: string;
  labName: string;
  date: any;
  timeSlot: string;
  status: 'pending' | 'approved' | 'rejected';
  activityType: string;
  category: string;
  courseName?: string;
  createdAt: any;
  description: string;
  labId: string;
  lecturerName?: string;
  supportingFileUrl?: string;
  updatedAt: any;
  userId: string;
  userName: string;
}

const HistoryReservationContent = () => {
  const { toggleSidebar } = useSidebar();
  const { firebaseUser, logout } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', firebaseUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedReservations = await Promise.all(snapshot.docs.map(async (reservationDoc) => {
        const reservationData = reservationDoc.data() as Omit<Reservation, 'id'>;
        let labName = 'Unknown Lab';
        if (reservationData.labId) {
          const labDocRef = doc(db, 'labs', reservationData.labId);
          const labDoc = await getDoc(labDocRef);
          if (labDoc.exists()) {
            labName = labDoc.data()?.name || 'Unknown Lab';
          }
        }
        return { id: reservationDoc.id, ...reservationData, labName } as Reservation;
      }));
      setReservations(fetchedReservations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

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
              <SidebarMenuButton tooltip="Jadwal" to="/jadwal">
                <Calendar className="w-5 h-5" />
                <span>Jadwal</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive tooltip="History Reservation">
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
              <h1 className="font-bold text-lg">History</h1>
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
              Reservation History
            </h1>
            <p className="text-gray-600 text-sm">Lihat riwayat reservasi laboratorium Anda</p>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading...</div>
          ) : reservations.length > 0 ? (
            <div className="overflow-x-auto">
              <Card className="border-0 shadow-elegant">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lab Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map(res => (
                    <TableRow key={res.id}>
                      <TableCell>{res.labName}</TableCell>
                      <TableCell>{new Date(res.date.seconds * 1000).toLocaleDateString()}</TableCell>
                      <TableCell>{res.timeSlot}</TableCell>
                      <TableCell>{res.category}</TableCell>
                      <TableCell>{res.activityType}</TableCell>
                      <TableCell>
                        <Badge variant={res.status === 'approved' ? 'default' : res.status === 'pending' ? 'secondary' : 'destructive'}>
                          {res.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">Details</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reservation Details</AlertDialogTitle>
                              <AlertDialogDescription>
                                <div className="space-y-2">
                                  <p><strong>Lab Name:</strong> {res.labName}</p>
                                  <p><strong>Date:</strong> {new Date(res.date.seconds * 1000).toLocaleDateString()}</p>
                                  <p><strong>Time Slot:</strong> {res.timeSlot}</p>
                                  <p><strong>Status:</strong> {res.status}</p>
                                  <p><strong>Activity Type:</strong> {res.activityType}</p>
                                  <p><strong>Category:</strong> {res.category}</p>
                                  {res.courseName && <p><strong>Course Name:</strong> {res.courseName}</p>}
                                  {res.lecturerName && <p><strong>Lecturer Name:</strong> {res.lecturerName}</p>}
                                  <p><strong>Description:</strong> {res.description}</p>
                                  {res.supportingFileUrl && <p><strong>Supporting File:</strong> <a href={res.supportingFileUrl} target="_blank" rel="noopener noreferrer">View File</a></p>}
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </Card>
            </div>
          ) : (
            <div className="glass shadow-elegant rounded-2xl p-8 text-center border-0">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mb-4">
                <History className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Reservasi</h3>
              <p className="text-gray-600">Anda belum memiliki riwayat reservasi.</p>
            </div>
          )}
        </main>
      </SidebarInset>

      {/* --- Bottom Navigation (Mobile) --- */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-500">
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/jadwal" className="flex flex-col items-center gap-1 text-gray-500">
          <Calendar className="w-6 h-6" />
          <span className="text-xs">Jadwal</span>
        </Link>
        <Link to="/history-reservation" className="flex flex-col items-center gap-1 text-blue-600">
          <History className="w-6 h-6" />
          <span className="text-xs font-semibold">History</span>
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

export function HistoryReservation() {
  return (
    <SidebarProvider>
      <HistoryReservationContent />
    </SidebarProvider>
  );
}