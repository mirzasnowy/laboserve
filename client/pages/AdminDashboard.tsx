
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';

interface Reservation {
  id: string;
  userName: string;
  labId: string;
  date: { toDate: () => Date };
  timeSlot: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
}

const AdminDashboard: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      setReservations(fetchedReservations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const reservationRef = doc(db, 'reservations', id);
    try {
      await updateDoc(reservationRef, { status, updatedAt: new Date() });
    } catch (error) {
      console.error("Error updating reservation status: ", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat data reservasi...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center w-full p-4">
            <h1 className="font-bold text-lg">Admin Dashboard</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      <main className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Reservasi Laboratorium</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pengguna</TableHead>
                  <TableHead>Laboratorium</TableHead>
                  <TableHead>Tanggal & Waktu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.length > 0 ? (
                  reservations.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell>{res.userName}</TableCell>
                      <TableCell>{res.labId}</TableCell>
                      <TableCell>
                        {res.date.toDate().toLocaleDateString('id-ID')} {res.timeSlot}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn({
                            'bg-yellow-500': res.status === 'pending',
                            'bg-green-600': res.status === 'approved',
                            'bg-red-600': res.status === 'rejected',
                          })}
                        >
                          {res.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        {res.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(res.id, 'approved')}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(res.id, 'rejected')}>
                              Reject
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Tidak ada data reservasi.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
