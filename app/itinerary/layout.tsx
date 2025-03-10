"use client"
import { useSession } from '@/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react'
import { QueryClientProvider } from '@/components/QueryProvider';
import { ModeToggle } from '@/components/toggle-mode';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


const AppLayout = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {

    // const { user, signOut } = useSession();
    // const router = useRouter()

    // const handleLogout = async () => {
    //     await signOut();
    //     router.replace("/signIn");
    // };
    return (
        <QueryClientProvider>
            <SidebarProvider>
                <AppSidebar />
                <div>
                    <SidebarTrigger />
                    {children}
                </div>
            </SidebarProvider>
        </QueryClientProvider>

    )
}

export default AppLayout