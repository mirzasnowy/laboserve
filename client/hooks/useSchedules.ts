import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FacultySchedule {
  id: string;
  day: string;
  timeSlot: string;
  originalTimeSlot?: string; // Optional: waktu asli jika ada modifikasi
  labId: string;
  labName: string;
  subject: string;
  lecturer: string;
  className: string;
  type: 'faculty';
}

export interface ReservationSchedule {
  id: string;
  day: string;
  timeSlot: string;
  labId: string;
  labName: string;
  subject: string;
  lecturer: string;
  className: string;
  date: Date;
  userName: string;
  category: string;
  type: 'reservation';
}

export type ScheduleItem = FacultySchedule | ReservationSchedule;

const dayMap: Record<string, number> = {
  'MINGGU': 0,
  'SENIN': 1,
  'SELASA': 2,
  'RABU': 3,
  'KAMIS': 4,
  'JUMAT': 5,
  'SABTU': 6,
};

function getDayOfWeek(date: Date): string {
  const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  return days[date.getDay()];
}

interface ScheduleOverride {
  id: string;
  date: Date;
  timeSlot: string;
  labId: string;
  labName: string;
  reason: string;
  type: 'cancel' | 'reschedule';
  newTimeSlot?: string;
  newDate?: Date;
}

export function useSchedules(selectedDate?: Date) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        
        // Fetch schedule overrides
        const overridesRef = collection(db, 'schedule_overrides');
        const overridesSnapshot = await getDocs(overridesRef);
        const overrides: ScheduleOverride[] = overridesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            newDate: data.newDate?.toDate(),
          } as ScheduleOverride;
        });
        
        // Fetch faculty schedules
        const facultySchedulesRef = collection(db, 'faculty_schedules');
        const facultySnapshot = await getDocs(facultySchedulesRef);
        let facultySchedules: FacultySchedule[] = facultySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'faculty',
        } as FacultySchedule));
        
        // Filter out cancelled schedules based on overrides
        facultySchedules = facultySchedules.filter(schedule => {
          const cancelledOverride = overrides.find(override => {
            if (override.type !== 'cancel') return false;
            if (override.labId !== schedule.labId) return false;
            if (override.timeSlot !== schedule.timeSlot) return false;
            
            // For specific date view
            if (selectedDate) {
              return override.date.toDateString() === selectedDate.toDateString() &&
                     getDayOfWeek(override.date) === schedule.day;
            }
            
            // For weekly view, check if override is in current week
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay() + 1);
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            return override.date >= startOfWeek && override.date <= endOfWeek &&
                   getDayOfWeek(override.date) === schedule.day;
          });
          return !cancelledOverride;
        });
        
        // Fetch approved reservations
        let reservationSchedules: ReservationSchedule[] = [];
        
        if (selectedDate) {
          // If date is selected, get reservations for that specific date
          const startOfDay = new Date(selectedDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(selectedDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          const reservationsQuery = query(
            collection(db, 'reservations'),
            where('status', '==', 'approved'),
            where('date', '>=', startOfDay),
            where('date', '<=', endOfDay)
          );
          
          const reservationsSnapshot = await getDocs(reservationsQuery);
          reservationSchedules = reservationsSnapshot.docs.map(doc => {
            const data = doc.data();
            const resDate = data.date.toDate();
            return {
              id: doc.id,
              day: getDayOfWeek(resDate),
              timeSlot: data.timeSlot,
              labId: data.labId,
              labName: data.labName,
              subject: data.courseName || data.description || 'Reservasi',
              lecturer: data.lecturerName || data.userName,
              className: data.category,
              date: resDate,
              userName: data.userName,
              category: data.category,
              type: 'reservation',
            } as ReservationSchedule;
          });
        } else {
          // Get all approved reservations for current week
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
          startOfWeek.setHours(0, 0, 0, 0);
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
          endOfWeek.setHours(23, 59, 59, 999);
          
          const reservationsQuery = query(
            collection(db, 'reservations'),
            where('status', '==', 'approved'),
            where('date', '>=', startOfWeek),
            where('date', '<=', endOfWeek)
          );
          
          const reservationsSnapshot = await getDocs(reservationsQuery);
          reservationSchedules = reservationsSnapshot.docs.map(doc => {
            const data = doc.data();
            const resDate = data.date.toDate();
            return {
              id: doc.id,
              day: getDayOfWeek(resDate),
              timeSlot: data.timeSlot,
              labId: data.labId,
              labName: data.labName,
              subject: data.courseName || data.description || 'Reservasi',
              lecturer: data.lecturerName || data.userName,
              className: data.category,
              date: resDate,
              userName: data.userName,
              category: data.category,
              type: 'reservation',
            } as ReservationSchedule;
          });
        }
        
        // Add rescheduled items as reservations
        const rescheduledItems: ReservationSchedule[] = [];
        if (selectedDate) {
          const rescheduledOverrides = overrides.filter(o => 
            o.type === 'reschedule' && 
            o.newDate &&
            o.newDate.toDateString() === selectedDate.toDateString()
          );
          
          for (const override of rescheduledOverrides) {
            if (override.newDate && override.newTimeSlot) {
              rescheduledItems.push({
                id: `rescheduled-${override.id}`,
                day: getDayOfWeek(override.newDate),
                timeSlot: override.newTimeSlot,
                labId: override.labId,
                labName: override.labName || '',
                subject: 'Jadwal Dipindahkan',
                lecturer: '',
                className: '',
                date: override.newDate,
                userName: 'Admin',
                category: 'Reschedule',
                type: 'reservation',
              });
            }
          }
        }
        
        // Combine all schedules
        setSchedules([...facultySchedules, ...reservationSchedules, ...rescheduledItems]);
        setError(null);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError('Gagal memuat jadwal');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [selectedDate]);

  return { schedules, loading, error };
}
