import { useState } from 'react';
import { Calendar as CalendarIcon, Search, Filter, Info } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchedules, ScheduleItem } from '@/hooks/useSchedules';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];

const LABS = [
  { id: 'lab-dasar-1', name: 'Lab Dasar 1' },
  { id: 'lab-dasar-2', name: 'Lab Dasar 2' },
  { id: 'lab-lanjut-1', name: 'Lab Lanjut 1' },
  { id: 'lab-lanjut-2', name: 'Lab Lanjut 2' },
];

// Time slots dengan durasi untuk kalkulasi height
const TIME_SLOTS_CONFIG = {
  'SENIN': [
    { time: '07.30 - 10.00', duration: 150 },
    { time: '10.00 - 12.30', duration: 150 },
    { time: '12.30 - 15.00', duration: 150 },
    { time: '15.00 - 17.30', duration: 150 },
  ],
  'SELASA': [
    { time: '07.30 - 10.00', duration: 150 },
    { time: '10.00 - 12.30', duration: 150 },
    { time: '12.30 - 15.00', duration: 150 },
    { time: '15.00 - 17.30', duration: 150 },
  ],
  'RABU': [
    { time: '07.30 - 10.00', duration: 150 },
    { time: '10.00 - 12.30', duration: 150 },
    { time: '12.30 - 14.10', duration: 100 },
    { time: '14.10 - 15.00', duration: 50 },
    { time: '15.00 - 17.30', duration: 150 },
  ],
  'KAMIS': [
    { time: '07.30 - 10.00', duration: 150 },
    { time: '10.00 - 12.30', duration: 150 },
    { time: '12.30 - 15.00', duration: 150 },
    { time: '15.00 - 17.30', duration: 150 },
  ],
  'JUMAT': [
    { time: '07.00 - 09.30', duration: 150 },
    { time: '09.30 - 12.00', duration: 150 },
    { time: '13.00 - 14.40', duration: 100 },
    { time: '14.40 - 15.30', duration: 50 },
    { time: '15.30 - 18.00', duration: 150 },
  ],
};

const JadwalContent = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('SENIN');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProdi, setFilterProdi] = useState('ALL');
  
  const { schedules, loading } = useSchedules(selectedDate);

  // Parse class info untuk mendapatkan prodi
  const getProdiFromClass = (className: string): string => {
    if (className.startsWith('IF')) return 'IF';
    if (className.startsWith('SI')) return 'SI';
    return 'OTHER';
  };

  // Filter schedules berdasarkan search dan filter
  const filterSchedules = (items: ScheduleItem[]) => {
    return items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lecturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.className.toLowerCase().includes(searchTerm.toLowerCase());
      
      const prodi = getProdiFromClass(item.className);
      const matchesProdi = filterProdi === 'ALL' || prodi === filterProdi;
      
      return matchesSearch && matchesProdi;
    });
  };

  // Helper function to robustly parse time strings like "HH.mm" or "HH" into minutes.
  const parseTimeToMinutes = (time: string): number => {
    const [hoursStr, minutesStr] = time.split('.');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10) || 0;

    if (isNaN(hours)) {
      return NaN;
    }
    return hours * 60 + minutes;
  };

  // Helper function to parse a time range string like "HH.mm - HH.mm".
  const parseTimeRange = (timeSlot: string): { start: number; end: number } | null => {
    const normalized = timeSlot.replace(/\s/g, '');
    const parts = normalized.split('-');
    if (parts.length !== 2) return null;
    
    const start = parseTimeToMinutes(parts[0]);
    const end = parseTimeToMinutes(parts[1]);

    if (isNaN(start) || isNaN(end)) {
      return null;
    }

    return { start, end };
  };

  // Check if two time ranges overlap
  const timeRangesOverlap = (range1: { start: number; end: number }, range2: { start: number; end: number }): boolean => {
    // Two ranges overlap if one starts before the other ends
    // Range1: [start1, end1), Range2: [start2, end2)
    // Overlap if: start1 < end2 AND start2 < end1
    return range1.start < range2.end && range2.start < range1.end;
  };

  // Get schedule for a specific slot - NEW LOGIC: Show if overlaps
  const getScheduleForSlot = (day: string, timeSlot: string, labId: string) => {
    const slotRange = parseTimeRange(timeSlot);
    if (!slotRange) return [];

    return filterSchedules(schedules).filter(s => {
      // Basic filtering for day and lab
      if (s.day.toUpperCase() !== day || s.labId !== labId) {
        return false;
      }
      
      // Parse the schedule's time range
      const scheduleRange = parseTimeRange(s.timeSlot);
      if (!scheduleRange) return false;

      // NEW: Check if the schedule overlaps with current slot
      return timeRangesOverlap(scheduleRange, slotRange);
    });
  };

  // Render class card dengan styling yang lebih baik
  const renderClassCard = (item: ScheduleItem, duration: number) => {
    const prodi = getProdiFromClass(item.className);
    const bgColor = item.type === 'faculty' 
      ? (prodi === 'IF' ? 'bg-blue-500' : 'bg-green-500')
      : 'bg-orange-500';
    
    return (
      <button
        onClick={() => setSelectedSchedule(item)}
        className={`${bgColor} text-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all cursor-pointer w-full text-left`}
        style={{ minHeight: `${duration}px` }}
      >
        <div className="text-xs font-bold mb-1">{item.className}</div>
        <div className="text-xs font-medium mb-1 line-clamp-2">{item.subject}</div>
        <div className="text-xs opacity-90 truncate">({item.lecturer})</div>
        {/* Show actual time if different from slot */}
        <div className="text-xs opacity-75 mt-1 border-t border-white/20 pt-1">
          {item.timeSlot}
        </div>
      </button>
    );
  };

  // Render cell untuk schedule grid
  const renderScheduleCell = (day: string, timeSlot: string, labId: string, duration: number) => {
    const items = getScheduleForSlot(day, timeSlot, labId);
    
    if (items.length === 0) {
      return (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-2 flex items-center justify-center bg-white hover:bg-gray-50 cursor-pointer transition-all"
          style={{ minHeight: `${duration}px` }}
        >
          <span className="text-gray-400 text-xs font-medium">TERSEDIA</span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx}>
            {renderClassCard(item, duration)}
          </div>
        ))}
      </div>
    );
  };

  // Get time slots untuk hari tertentu
  const getTimeSlotsForDay = (day: string) => {
    return TIME_SLOTS_CONFIG[day as keyof typeof TIME_SLOTS_CONFIG] || TIME_SLOTS_CONFIG.SENIN;
  };

  return (
    <AppLayout pageTitle="Jadwal">
      <div className="space-y-6">
        {/* Header */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Jadwal Laboratorium Fakultas
            </h1>
            <p className="text-gray-600 mb-4">Sistem Reservasi & Penjadwalan Lab</p>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Informatika (IF) - Fakultas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Sistem Informasi (SI) - Fakultas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Reservasi Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded"></div>
                <span>Tersedia untuk Booking</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="weekly">Jadwal Mingguan</TabsTrigger>
            <TabsTrigger value="date">Pilih Tanggal</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-6 space-y-6">
            {/* Search and Filter Controls */}
            <Card className="shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      type="text"
                      placeholder="Cari kelas, dosen, atau mata kuliah..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Filter Prodi */}
                  <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-600" />
                    <Select value={filterProdi} onValueChange={setFilterProdi}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter Prodi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Semua Prodi</SelectItem>
                        <SelectItem value="IF">Informatika (IF)</SelectItem>
                        <SelectItem value="SI">Sistem Informasi (SI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Day Tabs */}
            <Card className="shadow-md">
              <CardContent className="p-2">
                <div className="flex gap-2 overflow-x-auto">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                        selectedDay === day
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Info Notice untuk hari khusus */}
            {(selectedDay === 'JUMAT' || selectedDay === 'RABU') && (
              <Card className="bg-yellow-50 border-l-4 border-yellow-400 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Info className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        {selectedDay === 'JUMAT' 
                          ? 'Perhatian untuk Hari Jumat'
                          : 'Perhatian untuk Hari Rabu'}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {selectedDay === 'JUMAT'
                          ? 'Jadwal hari Jumat memiliki interval waktu yang berbeda. Perhatikan jeda istirahat antara pukul 12.00-13.00.'
                          : 'Beberapa kelas memiliki durasi khusus. Jadwal yang berlanjut akan muncul di beberapa slot waktu.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <Skeleton className="h-96 w-full" />
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Jadwal {selectedDay}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="min-w-[1000px]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-800 text-white">
                          <th className="border border-gray-700 px-4 py-3 text-left sticky left-0 bg-gray-800 z-10 min-w-32">
                            Waktu
                          </th>
                          {LABS.map((lab) => (
                            <th key={lab.id} className="border border-gray-700 px-4 py-3 text-center min-w-64">
                              {lab.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {getTimeSlotsForDay(selectedDay).map((slot, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 font-medium text-sm bg-gray-50 sticky left-0 z-10 align-top">
                              <div className="whitespace-nowrap">{slot.time}</div>
                              <div className="text-xs text-gray-500 mt-1">{slot.duration} menit</div>
                            </td>
                            {LABS.map((lab) => (
                              <td key={lab.id} className="border border-gray-300 p-2 align-top">
                                {renderScheduleCell(selectedDay, slot.time, lab.id, slot.duration)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="date" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Pilih Tanggal</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>
                    {selectedDate
                      ? `Jadwal - ${selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                      : 'Pilih tanggal untuk melihat jadwal'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedDate ? (
                    <div className="text-center py-12 text-gray-500">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>Silakan pilih tanggal di kalender</p>
                    </div>
                  ) : loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : (
                    <ScrollArea className="h-96 pr-4">
                      <div className="space-y-4">
                        {LABS.map(lab => {
                          const daySchedules = filterSchedules(schedules).filter(s => s.labId === lab.id);
                          if (daySchedules.length === 0) return null;
                          
                          return (
                            <div key={lab.id} className="border rounded-lg p-4">
                              <h3 className="font-semibold mb-3">{lab.name}</h3>
                              <div className="space-y-2">
                                {Array.from(new Set(daySchedules.map(s => s.timeSlot))).sort().map(timeSlot => {
                                  const slotSchedules = daySchedules.filter(s => s.timeSlot === timeSlot);
                                  if (slotSchedules.length === 0) return null;
                                  
                                  return (
                                    <div key={timeSlot} className="space-y-1">
                                      <div className="text-sm font-medium text-gray-600">{timeSlot}</div>
                                      {slotSchedules.map((item, idx) => (
                                        <div key={idx}>
                                          {renderClassCard(item, 80)}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {LABS.every(lab => filterSchedules(schedules).filter(s => s.labId === lab.id).length === 0) && (
                          <div className="text-center py-8 text-gray-500">
                            {searchTerm || filterProdi !== 'ALL' 
                              ? 'Tidak ada jadwal yang sesuai dengan filter'
                              : 'Tidak ada jadwal untuk tanggal ini'}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={!!selectedSchedule} onOpenChange={() => setSelectedSchedule(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail Jadwal</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-3 pt-4">
                  {selectedSchedule && (
                    <>
                      <div>
                        <Badge variant={selectedSchedule.type === 'faculty' ? 'default' : 'secondary'}>
                          {selectedSchedule.type === 'faculty' ? 'Jadwal Fakultas' : 'Reservasi'}
                        </Badge>
                      </div>
                      <div>
                        <strong>Lab:</strong> {selectedSchedule.labName}
                      </div>
                      <div>
                        <strong>Hari:</strong> {selectedSchedule.day}
                      </div>
                      <div>
                        <strong>Waktu:</strong> {selectedSchedule.timeSlot}
                      </div>
                      <div>
                        <strong>Mata Kuliah/Kegiatan:</strong> {selectedSchedule.subject}
                      </div>
                      <div>
                        <strong>Kelas:</strong> {selectedSchedule.className}
                      </div>
                      <div>
                        <strong>Dosen/PIC:</strong> {selectedSchedule.lecturer}
                      </div>
                      {selectedSchedule.type === 'reservation' && (
                        <>
                          <div>
                            <strong>Tanggal Spesifik:</strong> {selectedSchedule.date.toLocaleDateString('id-ID')}
                          </div>
                          {selectedSchedule.category && (
                            <div>
                              <strong>Kategori:</strong> {selectedSchedule.category}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default JadwalContent;