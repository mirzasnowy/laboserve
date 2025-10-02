import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"


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

export function HistoryReservation() {
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
      ) : (
        <p>No reservations found.</p>
      )}
    </div>
  );
}