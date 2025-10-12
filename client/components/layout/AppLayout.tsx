import React from 'react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { User, PanelLeft, Home, Calendar, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AppHeader = ({ title }: { title: string }) => {
    const { logout } = useAuth();
    return (
        <header className="bg-white/80 backdrop-blur-xl md:bg-transparent p-4 shadow-sm md:shadow-none sticky top-0 z-10 border-b border-gray-100 md:border-0">
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-2 md:hidden">
                    <SidebarTrigger />
                    <h1 className="font-bold text-lg">{title}</h1>
                </div>
                <div className="hidden md:block flex-1"></div>
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <User className="w-5 h-5" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/settings">Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={logout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}

const AppBottomNav = () => {
    const { toggleSidebar } = useSidebar();
    const location = useLocation();

    const getLinkClass = (path: string) => {
        return cn("flex flex-col items-center gap-1", {
            'text-blue-600': location.pathname === path,
            'text-gray-500': location.pathname !== path
        });
    }

    return (
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                <Home className="w-6 h-6" />
                <span className="text-xs">Home</span>
            </Link>
            <Link to="/jadwal" className={getLinkClass('/jadwal')}>
                <Calendar className="w-6 h-6" />
                <span className="text-xs">Jadwal</span>
            </Link>
            <Link to="/history-reservation" className={getLinkClass('/history-reservation')}>
                <History className="w-6 h-6" />
                <span className="text-xs">History</span>
            </Link>
            <button
                onClick={toggleSidebar}
                className="flex flex-col items-center gap-1 text-gray-500"
            >
                <PanelLeft className="w-6 h-6" />
                <span className="text-xs">Menu</span>
            </button>
        </footer>
    )
}


export const AppLayout = ({ children, pageTitle, fullWidth = false }: { children: React.ReactNode, pageTitle: string, fullWidth?: boolean }) => {
  return (
    <SidebarProvider>
        <div className="min-h-screen bg-gray-100 font-sans flex">
            <AppSidebar />
            <SidebarInset className="flex-1 pb-20 md:pb-0">
                <AppHeader title={pageTitle} />
                <div className={cn({
                    "p-4 md:p-6 lg:p-8": !fullWidth,
                })}>
                    {!fullWidth ? (
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </SidebarInset>
            <AppBottomNav />
        </div>
    </SidebarProvider>
  );
};
