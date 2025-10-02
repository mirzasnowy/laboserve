import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface Reservation {
  id: string;
  userName: string;
  labId: string;
  date: { toDate: () => Date };
  timeSlot: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  supportingFileUrl?: string;
}

const isImage = (url: string) => /\.(jpeg|jpg|gif|png)$/i.test(url);

export function ReservationManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileToView, setFileToView] = useState<string | null>(null);

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

      const updatedReservation = reservations.find(res => res.id === id);
      if (updatedReservation) {
        await fetch("/api/notify-user-booking-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reservationId: updatedReservation.id,
            userId: updatedReservation.userId,
            status: status,
            labName: updatedReservation.labId, // Assuming labId is the labName for now
            date: updatedReservation.date, // Pass the original date object
            timeSlot: updatedReservation.timeSlot,
          }),
        });
        console.log(`Notification sent for user ${updatedReservation.userId} for booking ${updatedReservation.id}`);
      }

    } catch (error) {
      console.error("Error updating reservation status: ", error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Memuat data reservasi...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Semua Reservasi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pengguna</TableHead>
                <TableHead>Lab</TableHead>
                <TableHead>Tanggal & Waktu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lampiran</TableHead>
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
                    <TableCell>
                      {res.supportingFileUrl ? (
                        <Button variant="outline" size="sm" onClick={() => setFileToView(res.supportingFileUrl!)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat
                        </Button>
                      ) : (
                        <span>-</span>
                      )}
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
                  <TableCell colSpan={6} className="text-center">Tidak ada data reservasi.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!fileToView} onOpenChange={(isOpen) => !isOpen && setFileToView(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          {fileToView && (
            isImage(fileToView) ? (
              <img src={fileToView} alt="Lampiran" className="w-full h-full object-contain" />
            ) : (
              <iframe src={fileToView} className="w-full h-full" title="Lampiran PDF"></iframe>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
