import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  History, 
  Info, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Clock3,
  FileText,
  User,
  BookOpen,
  Tag,
  Activity,
  ExternalLink,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppLayout } from '@/components/layout/AppLayout';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock3 className="h-5 w-5 text-yellow-500" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    approved: 'default' as const,
    pending: 'secondary' as const,
    rejected: 'destructive' as const
  };
  
  const labels = {
    approved: 'Disetujui',
    pending: 'Menunggu',
    rejected: 'Ditolak'
  };
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {labels[status as keyof typeof labels] || status}
    </Badge>
  );
};

const ReservationDetailDialog = ({ reservation, children }: { reservation: Reservation; children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={isMobile ? "max-w-[95vw] max-h-[90vh] overflow-y-auto" : "max-w-2xl"}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Detail Reservasi
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {/* Status Card */}
          <Card className={`border-l-4 ${
            reservation.status === 'approved' ? 'border-green-500 bg-green-50' : 
            reservation.status === 'rejected' ? 'border-red-500 bg-red-50' : 
            'border-yellow-500 bg-yellow-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon status={reservation.status} />
                  <div>
                    <p className="text-sm text-gray-600">Status Reservasi</p>
                    <p className="font-semibold capitalize">{reservation.status}</p>
                  </div>
                </div>
                <StatusBadge status={reservation.status} />
              </div>
            </CardContent>
          </Card>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CalendarDays className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-semibold">
                      {new Date(reservation.date.seconds * 1000).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sesi Waktu</p>
                    <p className="font-semibold">{reservation.timeSlot}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lab Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Laboratorium</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Lab:</span>
                <span className="text-sm font-medium">{reservation.labName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Aktivitas:</span>
                <span className="text-sm font-medium">{reservation.activityType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Kategori:</span>
                <span className="text-sm font-medium">{reservation.category}</span>
              </div>
            </CardContent>
          </Card>

          {/* Academic Info if exists */}
          {(reservation.courseName || reservation.lecturerName) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informasi Akademik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reservation.courseName && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Mata Kuliah:</span>
                    <span className="text-sm font-medium">{reservation.courseName}</span>
                  </div>
                )}
                {reservation.lecturerName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Dosen:</span>
                    <span className="text-sm font-medium">{reservation.lecturerName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Deskripsi Kegiatan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">
                {reservation.description || 'Tidak ada deskripsi'}
              </p>
            </CardContent>
          </Card>

          {/* Supporting File */}
          {reservation.supportingFileUrl && (
            <Card>
              <CardContent className="p-4">
                <a 
                  href={reservation.supportingFileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">File Pendukung</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </a>
              </CardContent>
            </Card>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 text-center pt-2">
            Dibuat pada: {new Date(reservation.createdAt.seconds * 1000).toLocaleString('id-ID')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const HistoryReservationContent = () => {
  const { firebaseUser } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const isMobile = useIsMobile();

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

  // Filter logic
  const filteredReservations = reservations.filter(res => {
    const matchesSearch = searchTerm === '' || 
      res.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.activityType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || res.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Group by status
  const groupedReservations = {
    pending: filteredReservations.filter(r => r.status === 'pending'),
    approved: filteredReservations.filter(r => r.status === 'approved'),
    rejected: filteredReservations.filter(r => r.status === 'rejected')
  };

  // Stats
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    approved: reservations.filter(r => r.status === 'approved').length,
    rejected: reservations.filter(r => r.status === 'rejected').length
  };

  const renderDesktopView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content - 2 cols */}
      <div className="lg:col-span-2 space-y-6">
        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Cari reservasi..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reservations List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Semua ({filteredReservations.length})</TabsTrigger>
            <TabsTrigger value="pending">Menunggu ({groupedReservations.pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Disetujui ({groupedReservations.approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Ditolak ({groupedReservations.rejected.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {filteredReservations.map(res => (
                  <ReservationDetailDialog key={res.id} reservation={res}>
                    <Card className="cursor-pointer hover:shadow-lg transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{res.labName}</h3>
                                <p className="text-sm text-gray-600 mt-1">{res.activityType}</p>
                              </div>
                              <StatusBadge status={res.status} />
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <CalendarDays className="h-4 w-4" />
                                <span>{new Date(res.date.seconds * 1000).toLocaleDateString('id-ID')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{res.timeSlot}</span>
                              </div>
                              {res.courseName && (
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  <span>{res.courseName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </ReservationDetailDialog>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {groupedReservations.pending.length > 0 ? (
                  groupedReservations.pending.map(res => (
                    <ReservationDetailDialog key={res.id} reservation={res}>
                      <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-yellow-500">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                              <h3 className="font-semibold text-lg">{res.labName}</h3>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <CalendarDays className="h-4 w-4" />
                                  <span>{new Date(res.date.seconds * 1000).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{res.timeSlot}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </ReservationDetailDialog>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Clock3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Tidak ada reservasi yang menunggu persetujuan</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {groupedReservations.approved.length > 0 ? (
                  groupedReservations.approved.map(res => (
                    <ReservationDetailDialog key={res.id} reservation={res}>
                      <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-green-500">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                              <h3 className="font-semibold text-lg">{res.labName}</h3>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <CalendarDays className="h-4 w-4" />
                                  <span>{new Date(res.date.seconds * 1000).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{res.timeSlot}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </ReservationDetailDialog>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Tidak ada reservasi yang disetujui</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {groupedReservations.rejected.length > 0 ? (
                  groupedReservations.rejected.map(res => (
                    <ReservationDetailDialog key={res.id} reservation={res}>
                      <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-red-500">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                              <h3 className="font-semibold text-lg">{res.labName}</h3>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <CalendarDays className="h-4 w-4" />
                                  <span>{new Date(res.date.seconds * 1000).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{res.timeSlot}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </ReservationDetailDialog>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Tidak ada reservasi yang ditolak</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar - 1 col */}
      <div className="space-y-6">
        {/* Stats Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ringkasan Reservasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <History className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Reservasi</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Menunggu</span>
                </div>
                <span className="font-semibold">{stats.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Disetujui</span>
                </div>
                <span className="font-semibold">{stats.approved}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Ditolak</span>
                </div>
                <span className="font-semibold">{stats.rejected}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p>Reservasi yang pending akan diproses maksimal 2x24 jam</p>
            </div>
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p>Pastikan dokumen pendukung lengkap untuk mempercepat persetujuan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMobileView = () => (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-gray-600">Menunggu</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-gray-600">Disetujui</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Cari reservasi..."
                className="pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <div className="space-y-3">
        {filteredReservations.map(res => (
          <ReservationDetailDialog key={res.id} reservation={res}>
            <Card className={`cursor-pointer active:scale-[0.98] transition-all border-l-4 ${
              res.status === 'approved' ? 'border-green-500' :
              res.status === 'rejected' ? 'border-red-500' :
              'border-yellow-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-base">{res.labName}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">{res.activityType}</p>
                      </div>
                      <StatusBadge status={res.status} />
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        <span>{new Date(res.date.seconds * 1000).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{res.timeSlot}</span>
                      </div>
                      {res.courseName && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{res.courseName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ReservationDetailDialog>
        ))}
      </div>

      {/* Empty State */}
      {filteredReservations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Tidak ada reservasi ditemukan</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

return (
    <AppLayout pageTitle="Riwayat Reservasi" fullWidth={isMobile}>
      <div className={`w-full space-y-6 ${isMobile ? 'px-4' : ''}`}>
        <div className="mb-6">
          {!isMobile && (
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Riwayat Reservasi
            </h1>
          )}
          <p className="text-sm text-gray-600">Lihat semua riwayat reservasi laboratorium Anda.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : reservations.length > 0 ? (
          isMobile ? renderMobileView() : renderDesktopView()
        ) : (
          <Alert>
            <History className="h-4 w-4" />
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