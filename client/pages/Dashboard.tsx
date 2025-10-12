import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useLabs, Lab } from "@/hooks/useLabs";
import { useFirebaseImage } from '@/hooks/useFirebaseImage';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

const StatusBadge = ({ status }: { status: Lab['status'] }) => {
  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-semibold text-white inline-block",
        status === "Tersedia" && "gradient-success",
        (status === "Tidak Tersedia" || status === "Penuh Hari Ini") && "gradient-danger",
        status === "Maintenance" && "gradient-warning",
      )}
    >
      {status}
    </span>
  );
};

const LabCard = ({ lab }: { lab: Lab }) => {
  const { imageUrl, loading: imageLoading } = useFirebaseImage(lab.image);
  const isBookable = lab.status === "Tersedia";

  return (
    <Card className={cn(
        "flex items-center p-5 space-x-4 overflow-hidden w-full border-0 shadow-elegant card-hover",
        !isBookable && "bg-gray-50/50"
      )}>
      <div className="relative">
        {imageLoading ? (
          <Skeleton className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl" />
        ) : (
          <img
            src={imageUrl || '/placeholder.svg'}
            alt={lab.name}
            className={cn(
              "w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl",
              !isBookable && "grayscale opacity-60"
            )}
          />
        )}
        {isBookable && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-1">{lab.location}</p>
        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 truncate">
          {lab.name}
        </h3>
        <StatusBadge status={lab.status} />
      </div>
      <Button
        asChild
        size="sm"
        className={cn(
          "shrink-0 self-end rounded-xl font-semibold transition-smooth",
          isBookable
            ? "gradient-primary shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        )}
        disabled={!isBookable}
      >
        <Link to={`/lab/${lab.id}`} aria-disabled={!isBookable} onClick={(e) => !isBookable && e.preventDefault()}>
            Lihat Detail
        </Link>
      </Button>
    </Card>
  )
};

const LabCardSkeleton = () => (
  <Card className="flex items-center p-4 space-x-4 overflow-hidden w-full">
    <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-md" />
    <div className="flex-grow space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
    <Skeleton className="h-9 w-24 rounded-md" />
  </Card>
);

const DashboardContent = () => {
  const { labs, loading, error } = useLabs();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLabs = labs.filter((lab) =>
    lab.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 4 }).map((_, i) => (
        <LabCardSkeleton key={i} />
      ));
    }

    if (error) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center text-center py-10">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-600">
            Gagal Memuat Data
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      );
    }

    if (labs.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center text-center py-10">
          <h3 className="text-lg font-semibold">Tidak Ada Laboratorium</h3>
          <p className="text-gray-600">
            Belum ada data laboratorium yang tersedia.
          </p>
        </div>
      );
    }

    return filteredLabs.map((lab) => <LabCard key={lab.id} lab={lab} />);
  };

  return (
    <AppLayout pageTitle="Pilih Laboratorium">
        <div className="mb-6 hidden md:block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Pilih Laboratorium
            </h1>
            <p className="text-gray-600 text-sm">Temukan dan pesan laboratorium sesuai kebutuhan Anda</p>
        </div>
        {/* Search for Mobile */}
        <div className="relative mb-6 md:hidden">
            <Input
              type="text"
              placeholder="Cari Ruangan..."
              className="glass border-0 rounded-2xl pl-12 h-14 shadow-elegant text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500/70" />
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {renderContent()}
        </div>
    </AppLayout>
  );
};

export default DashboardContent;

