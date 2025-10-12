import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import { ReservationSheet } from "@/components/reservasi/ReservationSheet";
import { useLabDetail } from "@/hooks/useLabDetail";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertTriangle, User, Book, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirebaseImage } from "@/hooks/useFirebaseImage";

// This is a mock schedule. In a real app, this would also be fetched from Firestore.
const mockSchedule = {
  className: "Lab Dasar 1 - 7C",
  lecturer: "Ibu Amelia Triana, S.LB",
  course: "Rekayasa Perangkat Kasar",
  time: "Senin, 07.30 - 10.00",
  image: "/placeholder.svg",
};

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <span
      className={cn(
        "text-sm font-semibold",
        status === "Tersedia" && "text-green-600",
        status === "Tidak Tersedia" && "text-red-600",
        status === "Maintenance" && "text-yellow-600"
      )}
    >
      {status}
    </span>
  );
};

const LabDetailSkeleton = () => (
  // Responsive skeleton
  <div className="w-full bg-gray-50">
    <header className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm md:hidden">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-6 w-1/3" />
    </header>
    <main className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-10 w-1/3" />
          <div className="pt-4">
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full mt-2" />
            <Skeleton className="h-5 w-2/3 mt-2" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Card className="p-4 space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        </div>
      </div>
    </main>
  </div>
);

export default function LabDetail() {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { lab, loading, error } = useLabDetail(labId);
  const { imageUrl, loading: imageLoading } = useFirebaseImage(lab?.image);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  // The main layout is now handled by the Dashboard's SidebarProvider
  // This component just renders the content for the 'inset' area.

  if (loading || !profile) {
    return <LabDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-600">
          Gagal Memuat Data
        </h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => navigate(-1)}>Kembali</Button>
      </div>
    );
  }

  if (!lab) {
    return null; // Should be handled by the error state
  }

  return (
    <div className="relative min-h-screen w-full bg-gray-50 flex flex-col font-sans">
      {/* Header for Mobile */}
      <header className="bg-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-blue-600">{lab.name}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {imageLoading ? (
            <Skeleton className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-xl shadow-lg" />
          ) : (
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={lab.name}
              className="w-full h-48 md:h-64 lg:h-80 object-cover rounded-xl shadow-lg"
            />
          )}

          <div className="mt-6 flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">{lab.location}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {lab.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status Kelas</p>
              <StatusBadge status={lab.status} />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Specs */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Spesifikasi
              </h3>
              <ul className="text-gray-700 list-disc list-inside space-y-1 bg-white p-6 rounded-lg shadow-sm">
                {Object.entries(lab.specifications).map(([key, value]) => (
                  <li key={key} className="text-md">
                    {key}: <span className="font-semibold">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Schedule */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Jadwal Terdekat
              </h3>
              <Card className="flex items-center p-3 gap-3 overflow-hidden shadow-sm">
                <img
                  src={mockSchedule.image}
                  alt={mockSchedule.className}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-grow text-sm">
                  <p className="text-xs text-gray-500">
                    Lantai 3 - Gedung Fasilkom
                  </p>
                  <h4 className="font-bold text-gray-900">
                    {mockSchedule.className}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-gray-600">
                    <User className="w-3 h-3" />
                    <span>{mockSchedule.lecturer}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-gray-600">
                    <Book className="w-3 h-3" />
                    <span>{mockSchedule.course}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{mockSchedule.time}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Button - For Mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-4 border-t">
        <Button
          onClick={() => setIsSheetOpen(true)}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg rounded-full"
        >
          Reservasi
        </Button>
      </footer>

      {/* Reservasi Button for Desktop - could be placed differently, e.g., sticky on the side */}
      <div className="hidden md:block fixed bottom-8 right-8">
        <Button
          onClick={() => setIsSheetOpen(true)}
          className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-lg rounded-full shadow-lg"
        >
          Reservasi
        </Button>
      </div>
      <ReservationSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        userName={profile.displayName || ""}
        labId={labId || ""}
        userId={profile.uid}
        labName={lab.name}
      />
    </div>
  );
}

