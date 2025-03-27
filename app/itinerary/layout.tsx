"use client"
import React from 'react'
import { QueryClientProvider } from '@/components/QueryProvider';
import { NavBar } from "@/app/NavBar"


const AppLayout = ({ children }: Readonly<{
    children: React.ReactNode;
}>) => {

    return (
        <QueryClientProvider>
            <div className="relative z-10">
                <NavBar />
            </div>
            <div className='max-w-screen-xl mx-auto'>
                {children}
            </div>
        </QueryClientProvider>

    )
}

export default AppLayout