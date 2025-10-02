import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Reservation {
  id: string;
  labName: string;
  date: any;
  timeSlot: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function HistoryReservation() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      setReservations(fetchedReservations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button asChild variant="ghost" size="icon">
          <Link to="/dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Reservation History</h1>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : reservations.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lab Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map(res => (
                <TableRow key={res.id}>
                  <TableCell>{res.labName}</TableCell>
                  <TableCell>{new Date(res.date.seconds * 1000).toLocaleDateString()}</TableCell>
                  <TableCell>{res.timeSlot}</TableCell>
                  <TableCell>
                    <Badge variant={res.status === 'approved' ? 'default' : res.status === 'pending' ? 'secondary' : 'destructive'}>
                      {res.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <p>No reservations found.</p>
      )}
    </div>
  );
}