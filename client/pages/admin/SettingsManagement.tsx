import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';

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

const LABS = [
  { id: 'lab-dasar-1', name: 'Lab Dasar 1' },
  { id: 'lab-dasar-2', name: 'Lab Dasar 2' },
  { id: 'lab-lanjut-1', name: 'Lab Lanjut 1' },
  { id: 'lab-lanjut-2', name: 'Lab Lanjut 2' },
];

const TIME_SLOTS = [
  '07.30 - 10.00',
  '10.00 - 12.30',
  '12.30 - 15.00',
  '15.00 - 17.30',
];

export default function SettingsManagement() {
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedLab, setSelectedLab] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [overrideType, setOverrideType] = useState<'cancel' | 'reschedule'>('cancel');
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [newTimeSlot, setNewTimeSlot] = useState('');

  useEffect(() => {
    fetchOverrides();
  }, []);

  const fetchOverrides = async () => {
    try {
      const overridesRef = collection(db, 'schedule_overrides');
      const snapshot = await getDocs(overridesRef);
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          date: d.date.toDate(),
          newDate: d.newDate?.toDate(),
        } as ScheduleOverride;
      });
      setOverrides(data);
    } catch (error) {
      console.error('Error fetching overrides:', error);
    }
  };

  const handleAddOverride = async () => {
    if (!selectedDate || !selectedLab || !selectedTimeSlot || !reason) {
      toast({
        title: 'Error',
        description: 'Mohon lengkapi semua field',
        variant: 'destructive',
      });
      return;
    }

    if (overrideType === 'reschedule' && (!newDate || !newTimeSlot)) {
      toast({
        title: 'Error',
        description: 'Mohon pilih tanggal dan waktu baru untuk reschedule',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const labName = LABS.find(l => l.id === selectedLab)?.name || '';
      const overridesRef = collection(db, 'schedule_overrides');
      
      await addDoc(overridesRef, {
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        labId: selectedLab,
        labName,
        reason,
        type: overrideType,
        newDate: overrideType === 'reschedule' ? newDate : null,
        newTimeSlot: overrideType === 'reschedule' ? newTimeSlot : null,
        createdAt: new Date(),
      });

      toast({
        title: 'Sukses',
        description: 'Override jadwal berhasil ditambahkan',
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedLab('');
      setSelectedTimeSlot('');
      setReason('');
      setOverrideType('cancel');
      setNewDate(undefined);
      setNewTimeSlot('');
      setShowAddDialog(false);
      
      fetchOverrides();
    } catch (error) {
      console.error('Error adding override:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan override',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOverride = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'schedule_overrides', id));
      toast({
        title: 'Sukses',
        description: 'Override berhasil dihapus',
      });
      fetchOverrides();
    } catch (error) {
      console.error('Error deleting override:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus override',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pengaturan Jadwal</h2>
          <p className="text-gray-600 text-sm">Kelola pembatalan dan reschedule jadwal fakultas</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Override
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Override Jadwal</DialogTitle>
              <DialogDescription>
                Batalkan atau reschedule jadwal fakultas untuk tanggal tertentu
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipe Override</Label>
                <Select value={overrideType} onValueChange={(v) => setOverrideType(v as 'cancel' | 'reschedule')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cancel">Batalkan Jadwal</SelectItem>
                    <SelectItem value="reschedule">Reschedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lab</Label>
                <Select value={selectedLab} onValueChange={setSelectedLab}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lab" />
                  </SelectTrigger>
                  <SelectContent>
                    {LABS.map(lab => (
                      <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tanggal yang Dibatalkan/Diubah</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label>Waktu yang Dibatalkan/Diubah</Label>
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(slot => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {overrideType === 'reschedule' && (
                <>
                  <div className="space-y-2">
                    <Label>Tanggal Baru</Label>
                    <Calendar
                      mode="single"
                      selected={newDate}
                      onSelect={setNewDate}
                      className="rounded-md border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Waktu Baru</Label>
                    <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih waktu baru" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(slot => (
                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Alasan</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Dosen berhalangan, Acara fakultas, dll"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Batal</Button>
              <Button onClick={handleAddOverride} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Override Jadwal</CardTitle>
          <CardDescription>
            Override yang aktif akan mempengaruhi tampilan jadwal di halaman Jadwal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overrides.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada override jadwal
            </div>
          ) : (
            <div className="space-y-3">
              {overrides.map(override => (
                <div key={override.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={override.type === 'cancel' ? 'destructive' : 'default'}>
                        {override.type === 'cancel' ? 'Dibatalkan' : 'Reschedule'}
                      </Badge>
                      <span className="font-semibold">{override.labName}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>
                        <strong>Tanggal Asli:</strong> {override.date.toLocaleDateString('id-ID')} - {override.timeSlot}
                      </div>
                      {override.type === 'reschedule' && override.newDate && (
                        <div>
                          <strong>Dipindah ke:</strong> {override.newDate.toLocaleDateString('id-ID')} - {override.newTimeSlot}
                        </div>
                      )}
                      <div>
                        <strong>Alasan:</strong> {override.reason}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteOverride(override.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
