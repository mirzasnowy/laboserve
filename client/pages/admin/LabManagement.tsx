import React, { useEffect, useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';

// Updated Lab interface
interface Lab {
  id: string;
  name: string;
  location: string;
  status: 'Tersedia' | 'Tidak Tersedia' | 'Maintenance';
  image: string;
  specifications: Record<string, number | string>;
}

// Form component for Add/Edit Lab
const LabForm = ({ lab, onSave, closeDialog }: { lab?: Lab | null, onSave: (data: Partial<Lab>) => Promise<void>, closeDialog: () => void }) => {
  const [name, setName] = useState(lab?.name || '');
  const [location, setLocation] = useState(lab?.location || '');
  const [status, setStatus] = useState<Lab['status']>(lab?.status || 'Tersedia');
  const [specItems, setSpecItems] = useState(Object.entries(lab?.specifications || {}).map(([key, value]) => ({ key, value: String(value) })));
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newItems = [...specItems];
    newItems[index][field] = value;
    setSpecItems(newItems);
  };

  const addSpecField = () => {
    setSpecItems([...specItems, { key: '', value: '' }]);
  };

  const removeSpecField = (index: number) => {
    const newItems = specItems.filter((_, i) => i !== index);
    setSpecItems(newItems);
  };

  const handleSubmit = async () => {
    if (!name || !location) return; // Basic validation

    const specifications = specItems.reduce((acc, item) => {
      if (item.key) { // Only add if key is not empty
        // Try to convert value to a number if it's a numeric string, otherwise keep as string
        acc[item.key] = !isNaN(Number(item.value)) && item.value.trim() !== '' ? Number(item.value) : item.value;
      }
      return acc;
    }, {} as Record<string, string | number>);

    setIsSaving(true);
    
    let imageUrl = lab?.image;
    if (newImageFile) {
      const imagePath = `labs/${lab?.id || Date.now()}/${newImageFile.name}`;
      const imageRef = ref(storage, imagePath);
      await uploadBytes(imageRef, newImageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    await onSave({ name, location, status, specifications, image: imageUrl });
    setIsSaving(false);
    closeDialog();
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{lab ? 'Edit Laboratorium' : 'Tambah Laboratorium Baru'}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Nama</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location" className="text-right">Lokasi</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">Status</Label>
          <Select onValueChange={(value) => setStatus(value as Lab['status'])} value={status}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tersedia">Tersedia</SelectItem>
              <SelectItem value="Tidak Tersedia">Tidak Tersedia</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Dynamic Specifications Editor */}
        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right pt-2">Spesifikasi</Label>
          <div className="col-span-3 space-y-2">
            {specItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input placeholder="Fasilitas (e.g. Komputer)" value={item.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} />
                <Input placeholder="Jumlah" value={item.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} />
                <Button variant="destructive" size="icon" onClick={() => removeSpecField(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addSpecField} className="mt-2">
              <PlusCircle className="w-4 h-4 mr-2" />
              Tambah Fasilitas
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">Gambar Baru</Label>
            <Input id="image" type="file" onChange={(e) => e.target.files && setNewImageFile(e.target.files[0])} className="col-span-3" accept="image/*" />
        </div>
        {lab?.image && (
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Gambar Saat Ini</Label>
                <div className="col-span-3">
                    <img src={lab.image} alt="Current lab" className="w-24 h-24 object-cover rounded-md border" />
                </div>
            </div>
        )}
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">Batal</Button>
        </DialogClose>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
          Simpan
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export function LabManagement() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'labs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLabs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lab));
      setLabs(fetchedLabs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (data: Partial<Lab>) => {
    if (selectedLab) { // Update existing lab
      const labRef = doc(db, 'labs', selectedLab.id);
      await updateDoc(labRef, data);
    } else { // Create new lab
      const { id, ...newData } = data; // Exclude id if it exists
      await addDoc(collection(db, 'labs'), { ...newData, image: newData.image || '/placeholder.svg' });
    }
  };

  const handleDelete = async (labId: string) => {
    setIsDeleting(labId);
    if (window.confirm('Apakah Anda yakin ingin menghapus lab ini?')) {
        try {
            const labRef = doc(db, 'labs', labId);
            await deleteDoc(labRef);
        } catch (error) {
            console.error("Error deleting lab: ", error);
        }
    }
    setIsDeleting(null);
  };

  if (loading) {
    return <div className="p-4 text-center">Memuat data laboratorium...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Semua Laboratorium</CardTitle>
          <Button onClick={() => { setSelectedLab(null); setIsDialogOpen(true); }}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Tambah Lab
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Lab</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labs.map((lab) => (
                <TableRow key={lab.id}>
                  <TableCell className="font-medium">{lab.name}</TableCell>
                  <TableCell>{lab.location}</TableCell>
                  <TableCell>
                    <Badge className={cn({
                        'bg-green-600': lab.status === 'Tersedia',
                        'bg-red-600': lab.status === 'Tidak Tersedia',
                        'bg-orange-500': lab.status === 'Maintenance',
                    })}>{lab.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => { setSelectedLab(lab); setIsDialogOpen(true); }}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(lab.id)} disabled={isDeleting === lab.id}>
                        {isDeleting === lab.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {isDialogOpen && <LabForm lab={selectedLab} onSave={handleSave} closeDialog={() => setIsDialogOpen(false)} />} 
      </Dialog>
    </>
  );
}
