"use client"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react'
import { QueryClientProvider } from '@/components/QueryProvider';
import { ModeToggle } from '@/components/toggle-mode';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/app-sidebar"


const AppLayout = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {

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