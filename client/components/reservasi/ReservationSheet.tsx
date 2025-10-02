import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ArrowLeft, Check, FilePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { db, storage } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useToast } from "@/components/ui/use-toast";

// Props definition
interface ReservationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userId: string;
  labId: string;
  labName: string;
}

const Stepper = ({ currentStep }: { currentStep: number }) => (
    <div className="flex items-center justify-center w-full my-6">
      <div className="flex items-center">
        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
            currentStep === 1 ? "border-blue-600 bg-blue-600" : "border-green-600 bg-green-600"
          )}>
             {currentStep === 1 ? <div className="w-2 h-2 bg-white rounded-full"></div> : <Check className="w-3 h-3 text-white" />}
          </div>
          <p className={cn(
            "text-xs mt-2 font-semibold",
            currentStep === 1 ? "text-blue-600" : "text-green-600"
          )}>Step 1</p>
        </div>
        <div className={cn(
          "flex-auto border-t-2 mx-4 w-20",
          currentStep === 1 ? "border-gray-300" : "border-green-600"
        )}></div>
        <div className="flex flex-col items-center text-center">
          <div className={cn(
            "w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center",
            currentStep === 2 ? "bg-blue-600" : "bg-white"
          )}>
              {currentStep === 2 && <div className="w-2 h-2 bg-white rounded-full"></div>}
          </div>
          <p className={cn(
            "text-xs mt-2",
            currentStep === 2 ? "font-semibold text-blue-600" : "text-gray-500"
          )}>Step 2</p>
        </div>
      </div>
    </div>
  );

export function ReservationSheet({ open, onOpenChange, userName, userId, labId, labName }: ReservationSheetProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [activityType, setActivityType] = React.useState<string>("akademik");
  const [category, setCategory] = React.useState<string>("");
  const [lecturerName, setLecturerName] = React.useState<string>("");
  const [courseName, setCourseName] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [supportingFile, setSupportingFile] = React.useState<File | null>(null);
  const [bookedSlots, setBookedSlots] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!date || !labId) {
      setBookedSlots([]);
      return;
    }

    // Define the start and end of the selected day to avoid timezone issues.
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, "reservations"),
      where("labId", "==", labId),
      where("date", ">=", startOfDay),
      where("date", "<=", endOfDay),
      where("status", "==", "approved") // Only block slots that are already approved
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slots = snapshot.docs.map(doc => doc.data().timeSlot);
      setBookedSlots(slots);
    });

    return () => unsubscribe();
  }, [date, labId]);

  const timeSlots = ["07.30 - 10.00", "10.00 - 12.30", "12.30 - 15.00", "15.00 - 18.00"];

  const resetForm = () => {
    setDate(undefined);
    setSelectedTime(null);
    setActivityType("akademik");
    setCategory("");
    setLecturerName("");
    setCourseName("");
    setDescription("");
    setSupportingFile(null);
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!date || !selectedTime || !category || !description || (category === "kelas-pengganti" && (!lecturerName || !courseName))) {
      toast({
        title: "Form Belum Lengkap",
        description: "Mohon isi semua field yang wajib diisi (*).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let supportingFileUrl: string | null = null;

      // 1. Upload file if it exists
      if (supportingFile) {
        const storageRef = ref(storage, `reservations/${userId}/${labId}_${Date.now()}_${supportingFile.name}`);
        const uploadResult = await uploadBytes(storageRef, supportingFile);
        supportingFileUrl = await getDownloadURL(uploadResult.ref);
      }

      // Normalize date to the start of the day before saving
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // 2. Create reservation document in Firestore
      const reservationData: any = {
        labId,
        labName,
        userId,
        userName,
        date: normalizedDate,
        timeSlot: selectedTime,
        activityType,
        category,
        description,
        supportingFileUrl,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (category === "kelas-pengganti") {
        reservationData.lecturerName = lecturerName;
        reservationData.courseName = courseName;
      }

      await addDoc(collection(db, "reservations"), reservationData);

      // Notify admins about the new booking
      await fetch("/api/notify-admin-new-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservation: reservationData }),
      });

      toast({
        title: "Reservasi Berhasil",
        description: "Permintaan reservasi Anda telah terkirim dan sedang menunggu persetujuan.",
      });

      resetForm();
      onOpenChange(false);

    } catch (error) {
      console.error("Error creating reservation:", error);
      toast({
        title: "Reservasi Gagal",
        description: "Terjadi kesalahan saat mengirim permintaan reservasi. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Basic validation (e.g., size)
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({
          title: "File terlalu besar",
          description: "Ukuran file pendukung tidak boleh lebih dari 1MB.",
          variant: "destructive",
        });
        return;
      }
      setSupportingFile(file);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-full md:max-w-md p-0 flex flex-col font-sans bg-white">
        <SheetHeader className="p-4 border-b">
           <div className="flex items-center justify-between relative h-8">
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </SheetClose>
                </div>
                <h2 className="text-base font-semibold text-blue-600 text-center w-full">Reservasi</h2>
           </div>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto p-6 space-y-5">
          <Stepper currentStep={currentStep} />
          
          {currentStep === 1 && (
            <>
              {/* Form fields for Step 1 */}
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-sm text-gray-800">Nama</Label>
                <Input id="name" value={userName} disabled className="bg-blue-100 border-none text-gray-800 font-medium rounded-lg h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="font-semibold text-sm text-gray-800">Tanggal*</Label>
                <div className="flex items-center gap-2">
                    <Input readOnly value={date ? date.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }) : "--/--/----"} className="flex-1 rounded-lg h-12" placeholder="--/--/----" />
                    <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className="w-12 h-12 p-0 flex items-center justify-center rounded-lg"
                        >
                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        />
                    </PopoverContent>
                    </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-sm text-gray-800">Jam*</Label>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map(time => {
                    const isBooked = bookedSlots.includes(time);
                    return (
                        <Button
                          key={time}
                          variant={"outline"}
                          className={cn(
                              "w-full rounded-lg py-2 h-11 text-sm", 
                              isBooked ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300" : 
                              selectedTime === time ? "bg-blue-600 text-white border-blue-600" : "text-gray-700 bg-white"
                          )}
                          onClick={() => !isBooked && setSelectedTime(time)}
                          disabled={isBooked}
                        >
                          {time}
                        </Button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-semibold text-sm text-gray-800">Kegiatan*</Label>
                <RadioGroup defaultValue="akademik" className="space-y-3" onValueChange={setActivityType}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="akademik" id="akademik" />
                    <Label htmlFor="akademik" className="font-normal text-sm text-gray-800">Akademik</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="non-akademik" id="non-akademik" />
                    <Label htmlFor="non-akademik" className="font-normal text-sm text-gray-800">Non Akademik</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-semibold text-sm text-gray-800">Kategori*</Label>
                <Select onValueChange={setCategory} value={category}>
                  <SelectTrigger className="w-full rounded-lg h-12">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kelas-pengganti">Kelas Pengganti</SelectItem>
                    <SelectItem value="praktikum">Praktikum</SelectItem>
                    <SelectItem value="acara-himpunan">Acara Himpunan</SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {category === "kelas-pengganti" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="lecturer-name" className="font-semibold text-sm text-gray-800">Nama Dosen*</Label>
                    <Input id="lecturer-name" placeholder="Masukkan nama dosen" className="rounded-lg h-12" value={lecturerName} onChange={(e) => setLecturerName(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-name" className="font-semibold text-sm text-gray-800">Nama Mata Kuliah*</Label>
                    <Input id="course-name" placeholder="Masukkan nama mata kuliah" className="rounded-lg h-12" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold text-sm text-gray-800">Deskripsi*</Label>
                <Textarea id="description" placeholder="Masukkan deskripsi kegiatan" className="min-h-[100px] rounded-lg" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-800">Upload File Pendukung</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-4">
                <FilePlus className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-gray-600">Choose a file or drag & drop it here</p>
                <p className="text-xs text-gray-500">JPEG, PNG, PDF formats, up to 1MB</p>
                <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
                <Label htmlFor="file-upload" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
                  Browse File
                </Label>
                {supportingFile && <p className="text-sm text-gray-700 mt-2">Selected file: {supportingFile.name}</p>}
              </div>
            </div>
          )}
        </div>
        <SheetFooter className="p-4 bg-white border-t">
          {currentStep === 1 && (
            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg rounded-full" onClick={() => setCurrentStep(2)}>
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 h-12 text-lg rounded-full" onClick={() => setCurrentStep(1)} disabled={isSubmitting}>
                Back
              </Button>
              <Button type="submit" className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-lg rounded-full" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reservasi"}
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}