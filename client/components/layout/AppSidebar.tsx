import React from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Calendar, History } from 'lucide-react';
import { DynamicLogo } from '@/components/ui/DynamicLogo';

export const AppSidebar = () => {
  return (
    <Sidebar className="hidden md:flex flex-col bg-gradient-to-b from-white to-blue-50/30">
      <SidebarHeader className="p-4 border-b border-blue-100/50">
        <div className="flex items-center gap-3">
          <DynamicLogo />
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lab Unsika
            </h1>
            <p className="text-xs text-gray-500">Portal Reservasi</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Home" to="/dashboard">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Jadwal" to="/jadwal">
              <Calendar className="w-5 h-5" />
              <span>Jadwal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="History Reservation" to="/history-reservation">
              <History className="w-5 h-5" />
              <span>History Reservation</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
