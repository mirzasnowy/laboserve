import { useState } from 'react';
import { CalendarIcon, Search, Filter, Info, ChevronRight } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];

const LABS = [
  { id: 'lab-dasar-1', name: 'Lab Dasar 1', shortName: 'LD 1' },
  { id: 'lab-dasar-2', name: 'Lab Dasar 2', shortName: 'LD 2' },
  { id: 'lab-lanjut-1', name: 'Lab Lanjut 1', shortName: 'LL 1' },
  { id: 'lab-lanjut-2', name: 'Lab Lanjut 2', shortName: 'LL 2' },
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
  const isMobile = useIsMobile();
  
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
    return range1.start < range2.end && range2.start < range1.end;
  };

  // Get schedule for a specific slot - Show if overlaps
  const getScheduleForSlot = (day: string, timeSlot: string, labId: string) => {
    const slotRange = parseTimeRange(timeSlot);
    if (!slotRange) return [];

    return filterSchedules(schedules).filter(s => {
      if (s.day.toUpperCase() !== day || s.labId !== labId) {
        return false;
      }
      
      const scheduleRange = parseTimeRange(s.timeSlot);
      if (!scheduleRange) return false;

      return timeRangesOverlap(scheduleRange, slotRange);
    });
  };

  // Render class card untuk mobile
  const renderMobileClassCard = (item: ScheduleItem) => {
    const prodi = getProdiFromClass(item.className);
    const bgColor = item.type === 'faculty' 
      ? (prodi === 'IF' ? 'bg-blue-500' : 'bg-green-500')
      : 'bg-orange-500';
    
    const lab = LABS.find(l => l.id === item.labId);
    
    return (
      <button
        onClick={() => setSelectedSchedule(item)}
        className={`${bgColor} text-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer w-full text-left`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold mb-1">{item.className}</div>
            <div className="text-xs font-medium mb-1 line-clamp-2">{item.subject}</div>
            <div className="text-xs opacity-90">{item.lecturer}</div>
          </div>
          <Badge variant="secondary" className="text-xs ml-2 shrink-0 bg-white/20 text-white border-white/30">
            {lab?.shortName || 'Lab'}
          </Badge>
        </div>
        {item.timeSlot && (
          <div className="text-xs opacity-75 mt-2 pt-2 border-t border-white/20">
            {item.timeSlot}
          </div>
        )}
      </button>
    );
  };

  // Render class card untuk desktop dengan styling yang lebih baik
  const renderDesktopClassCard = (item: ScheduleItem, duration: number) => {
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
        <div className="text-xs opacity-75 mt-1 border-t border-white/20 pt-1">
          {item.timeSlot}
        </div>
      </button>
    );
  };

  // Render cell untuk schedule grid desktop
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
            {renderDesktopClassCard(item, duration)}
          </div>
        ))}
      </div>
    );
  };

  // Get time slots untuk hari tertentu
  const getTimeSlotsForDay = (day: string) => {
    return TIME_SLOTS_CONFIG[day as keyof typeof TIME_SLOTS_CONFIG] || TIME_SLOTS_CONFIG.SENIN;
  };

  // Render Mobile Weekly View - Improved
  const renderMobileWeeklyView = () => (
    <div className="space-y-3">
      {getTimeSlotsForDay(selectedDay).map((slot, idx) => {
        const allSchedulesForSlot = LABS.flatMap(lab =>
          getScheduleForSlot(selectedDay, slot.time, lab.id)
        );
        
        return (
          <Card key={idx} className="shadow-sm overflow-hidden">
            <CardHeader className="py-2 px-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{slot.time}</CardTitle>
                <span className="text-xs text-gray-500">{slot.duration} menit</span>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {allSchedulesForSlot.length > 0 ? (
                allSchedulesForSlot.map((item, itemIdx) => (
                  <div key={itemIdx}>
                    {renderMobileClassCard(item)}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-xs text-gray-500 font-medium">Semua lab tersedia</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Render Desktop Weekly View
  const renderDesktopWeeklyView = () => (
    <Card className="shadow-md overflow-hidden">
      <CardHeader>
        <CardTitle>Jadwal {selectedDay}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[600px]">
          <table className="w-full border-collapse min-w-[1000px]">
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
  );

  return (
    <AppLayout pageTitle="Jadwal">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <Card className="shadow-md">
          <CardContent className="p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Jadwal Laboratorium
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">Sistem Reservasi & Penjadwalan Lab</p>
            
            {/* Legend - Mobile Optimized */}
            <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm">
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded"></div>
                <span className="hidden sm:inline">Informatika (IF)</span>
                <span className="sm:hidden">IF</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded"></div>
                <span className="hidden sm:inline">Sistem Informasi (SI)</span>
                <span className="sm:hidden">SI</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-orange-500 rounded"></div>
                <span>Reservasi</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-dashed border-gray-300 rounded"></div>
                <span>Tersedia</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="weekly" className="text-xs md:text-sm">Jadwal Mingguan</TabsTrigger>
            <TabsTrigger value="date" className="text-xs md:text-sm">Pilih Tanggal</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-4 md:mt-6 space-y-3 md:space-y-6">
            {/* Search and Filter Controls */}
            <Card className="shadow-md">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder={isMobile ? "Cari..." : "Cari kelas, dosen, atau mata kuliah..."}
                      className="pl-9 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Filter Prodi */}
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-600" />
                    <Select value={filterProdi} onValueChange={setFilterProdi}>
                      <SelectTrigger className="w-full md:w-48 text-sm">
                        <SelectValue placeholder="Filter Prodi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Semua Prodi</SelectItem>
                        <SelectItem value="IF">Informatika</SelectItem>
                        <SelectItem value="SI">Sistem Informasi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Day Tabs */}
            <Card className="shadow-md">
              <CardContent className="p-2">
                <ScrollArea className="w-full">
                  <div className="flex gap-2">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-3 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-xs md:text-base ${
                          selectedDay === day
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Info Notice untuk hari khusus */}
            {(selectedDay === 'JUMAT' || selectedDay === 'RABU') && (
              <Card className="bg-yellow-50 border-l-4 border-yellow-400 shadow-md">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start">
                    <Info className="text-yellow-600 mr-2 md:mr-3 flex-shrink-0 mt-0.5" size={isMobile ? 16 : 20} />
                    <div>
                      <p className="text-xs md:text-sm text-yellow-800 font-medium">
                        {selectedDay === 'JUMAT' 
                          ? 'Perhatian Hari Jumat'
                          : 'Perhatian Hari Rabu'}
                      </p>
                      <p className="text-xs md:text-sm text-yellow-700 mt-1">
                        {selectedDay === 'JUMAT'
                          ? 'Jadwal berbeda dengan jeda istirahat 12.00-13.00.'
                          : 'Beberapa kelas memiliki durasi khusus.'}
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
            ) : isMobile ? (
              renderMobileWeeklyView()
            ) : (
              renderDesktopWeeklyView()
            )}
          </TabsContent>

          <TabsContent value="date" className="mt-4 md:mt-6">
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-6'}`}>
              {/* Calendar Card */}
              <Card className="shadow-md">
                <CardHeader className="p-3 md:p-4">
                  <CardTitle className="text-base md:text-lg">Pilih Tanggal</CardTitle>
                </CardHeader>
                <CardContent className={isMobile ? "p-2" : "p-4"}>
                  <div className={isMobile ? "transform scale-90 origin-top" : ""}>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border mx-auto"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Display Card */}
              <Card className="shadow-md">
                <CardHeader className="p-3 md:p-4">
                  <CardTitle className="text-base md:text-lg">
                    {selectedDate
                      ? `Jadwal ${selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}`
                      : 'Pilih tanggal'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-4">
                  {!selectedDate ? (
                    <div className="text-center py-8 md:py-12 text-gray-500">
                      <CalendarIcon className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-300 mb-3 md:mb-4" />
                      <p className="text-sm md:text-base">Silakan pilih tanggal di kalender</p>
                    </div>
                  ) : loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 md:h-20 w-full" />
                      <Skeleton className="h-16 md:h-20 w-full" />
                      <Skeleton className="h-16 md:h-20 w-full" />
                    </div>
                  ) : (
                    <ScrollArea className={isMobile ? "h-80" : "h-96"}>
                      <div className="space-y-4 pr-2">
                        {LABS.map(lab => {
                          const daySchedules = filterSchedules(schedules).filter(s => s.labId === lab.id);
                          if (daySchedules.length === 0) return null;
                          
                          return (
                            <div key={lab.id} className="border rounded-lg p-3 md:p-4">
                              <h3 className="font-semibold mb-3 text-sm md:text-base">{lab.name}</h3>
                              <div className="space-y-2">
                                {Array.from(new Set(daySchedules.map(s => s.timeSlot))).sort().map(timeSlot => {
                                  const slotSchedules = daySchedules.filter(s => s.timeSlot === timeSlot);
                                  if (slotSchedules.length === 0) return null;
                                  
                                  return (
                                    <div key={timeSlot} className="space-y-2">
                                      <div className="text-xs md:text-sm font-medium text-gray-600">{timeSlot}</div>
                                      {slotSchedules.map((item, idx) => (
                                        <div key={idx}>
                                          {isMobile ? renderMobileClassCard(item) : renderDesktopClassCard(item, 80)}
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
                          <div className="text-center py-6 md:py-8 text-gray-500">
                            <p className="text-sm md:text-base">
                              {searchTerm || filterProdi !== 'ALL' 
                                ? 'Tidak ada jadwal yang sesuai dengan filter'
                                : 'Tidak ada jadwal untuk tanggal ini'}
                            </p>
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
          <DialogContent className={isMobile ? "max-w-[90vw]" : ""}>
            <DialogHeader>
              <DialogTitle className="text-base md:text-lg">Detail Jadwal</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-2 md:space-y-3 pt-3 md:pt-4 text-xs md:text-sm">
                  {selectedSchedule && (
                    <>
                      <div>
                        <Badge variant={selectedSchedule.type === 'faculty' ? 'default' : 'secondary'} className="text-xs">
                          {selectedSchedule.type === 'faculty' ? 'Jadwal Fakultas' : 'Reservasi'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div><strong>Lab:</strong> {selectedSchedule.labName}</div>
                        <div><strong>Hari:</strong> {selectedSchedule.day}</div>
                        <div><strong>Waktu:</strong> {selectedSchedule.timeSlot}</div>
                        <div><strong>Mata Kuliah:</strong> {selectedSchedule.subject}</div>
                        <div><strong>Kelas:</strong> {selectedSchedule.className}</div>
                        <div><strong>Dosen/PIC:</strong> {selectedSchedule.lecturer}</div>
                        {selectedSchedule.type === 'reservation' && (
                          <>
                            <div><strong>Tanggal:</strong> {selectedSchedule.date.toLocaleDateString('id-ID')}</div>
                            {selectedSchedule.category && (
                              <div><strong>Kategori:</strong> {selectedSchedule.category}</div>
                            )}
                          </>
                        )}
                      </div>
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