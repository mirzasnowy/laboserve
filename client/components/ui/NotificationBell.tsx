
import React, { useEffect, useState, useRef } from 'react';
import { Bell, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Reservation {
  id: string;
  labId: string;
  labName?: string; // Assuming we might fetch this later
  status: 'pending' | 'approved' | 'rejected';
  date: Timestamp;
  createdAt: Timestamp;
}

const statusIcons = {
  approved: <CheckCircle className="w-4 h-4 text-green-500" />,
  rejected: <XCircle className="w-4 h-4 text-red-500" />,
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
};

const statusMessages = {
    approved: 'Reservasi Anda telah disetujui.',
    rejected: 'Reservasi Anda ditolak.',
    pending: 'Reservasi Anda sedang ditinjau.'
}

export function NotificationBell() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Reservation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const previousNotifications = useRef<Reservation[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;

    const q = query(
      collection(db, 'reservations'),
      where('userId', '==', firebaseUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      
      // Check for status changes and show toast
      if (previousNotifications.current.length > 0) {
        newNotifications.forEach(newNotif => {
          const oldNotif = previousNotifications.current.find(n => n.id === newNotif.id);
          if (oldNotif && oldNotif.status !== newNotif.status) {
            if (newNotif.status === 'approved' || newNotif.status === 'rejected') {
              toast({
                title: `Status Reservasi Diperbarui`,
                description: `Reservasi untuk lab pada ${newNotif.date.toDate().toLocaleDateString()} telah ${newNotif.status === 'approved' ? 'disetujui' : 'ditolak'}.`,
              });
            }
          }
        });
      }
      
      setNotifications(newNotifications);
      // Simple unread logic: consider all as unread for now
      setUnreadCount(newNotifications.length); 
      previousNotifications.current = newNotifications;
    });

    return () => unsubscribe();
  }, [firebaseUser, toast]);

  return (
    <DropdownMenu onOpenChange={() => setUnreadCount(0)}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <DropdownMenuItem key={notif.id} asChild>
              <Link to={`/lab/${notif.labId}`} className="flex items-start gap-3 p-2">
                <div className="mt-1">
                    {statusIcons[notif.status]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Status: <span className={cn(
                        'font-bold',
                        notif.status === 'approved' && 'text-green-600',
                        notif.status === 'rejected' && 'text-red-600',
                        notif.status === 'pending' && 'text-yellow-600',
                    )}>{notif.status.charAt(0).toUpperCase() + notif.status.slice(1)}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {statusMessages[notif.status]}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notif.date.toDate().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-4 text-sm text-center text-gray-500">Tidak ada notifikasi.</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
