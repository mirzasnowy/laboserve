
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';
import { ReservationManagement } from './admin/ReservationManagement';
import { LabManagement } from './admin/LabManagement';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center w-full p-4">
            <h1 className="font-bold text-lg">Admin Dashboard</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      <main className="p-4 sm:p-8">
        <Tabs defaultValue="reservations">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reservations">Manajemen Reservasi</TabsTrigger>
            <TabsTrigger value="labs">Manajemen Laboratorium</TabsTrigger>
          </TabsList>
          <TabsContent value="reservations">
            <ReservationManagement />
          </TabsContent>
          <TabsContent value="labs">
            <LabManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
