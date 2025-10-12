import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { History, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AppLayout } from '@/components/layout/AppLayout';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const { firebaseUser } = useAuth();
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
    <AppLayout pageTitle="History Reservasi">
      <div className="space-y-6">
        <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Riwayat Reservasi
            </h1>
            <p className="text-gray-600 text-sm">Lihat semua riwayat reservasi laboratorium Anda.</p>
        </div>
        {loading ? (
            <div className="text-center py-12 text-gray-600">Loading...</div>
          ) : reservations.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lab</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Sesi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map(res => (
                        <TableRow key={res.id}>
                          <TableCell className="font-medium">{res.labName}</TableCell>
                          <TableCell>{new Date(res.date.seconds * 1000).toLocaleDateString()}</TableCell>
                          <TableCell>{res.timeSlot}</TableCell>
                          <TableCell>
                            <Badge variant={res.status === 'approved' ? 'default' : res.status === 'pending' ? 'secondary' : 'destructive'}>
                              {res.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">Details</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Detail Reservasi</AlertDialogTitle>
                                  <AlertDialogDescription asChild>
                                    <div className="space-y-2 pt-4 text-sm text-gray-700">
                                      <p><strong>Nama Lab:</strong> {res.labName}</p>
                                      <p><strong>Tanggal:</strong> {new Date(res.date.seconds * 1000).toLocaleDateString()}</p>
                                      <p><strong>Sesi:</strong> {res.timeSlot}</p>
                                      <p><strong>Status:</strong> <Badge variant={res.status === 'approved' ? 'default' : res.status === 'pending' ? 'secondary' : 'destructive'}>{res.status}</Badge></p>
                                      <p><strong>Tipe Aktivitas:</strong> {res.activityType}</p>
                                      <p><strong>Kategori:</strong> {res.category}</p>
                                      {res.courseName && <p><strong>Mata Kuliah:</strong> {res.courseName}</p>}
                                      {res.lecturerName && <p><strong>Nama Dosen:</strong> {res.lecturerName}</p>}
                                      <p><strong>Deskripsi:</strong> {res.description}</p>
                                      {res.supportingFileUrl && <p><strong>File Pendukung:</strong> <a href={res.supportingFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lihat File</a></p>}
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Tutup</AlertDialogCancel>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Belum Ada Riwayat</AlertTitle>
              <AlertDescription>
                Anda belum pernah melakukan reservasi. Mulai reservasi sekarang dari halaman Home.
              </AlertDescription>
            </Alert>
          )}
        </div>
    </AppLayout>
  );
};

export default HistoryReservationContent;
