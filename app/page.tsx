"use client";
import React from 'react'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import planner from "@/public/illustrations/planner.png"

export default function Home() {
  const router = useRouter()

  return (
    <div className="grid place-content-center min-h-screen">
      <main className="flex flex-row content-center items-center ">
        <div className=''>
          <Image
            alt="illustration of a notebook and airplane"
            src={planner}
            width={500}
            height={400}
            sizes="100vw"
            className=""
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>

        <div className='p-18'>
          <p className="text-6xl text-primary font-extrabold ">Buckle Up</p>
          <div className='w-80 flex flex-col gap-6 '>
            <p className='text-m font-bold'>Welcome to Buckle Up.</p>
            <p className='text-m '>Let's begin you journey across Eire. Plan your Itinerary and explore different activities and BnB's across Ireland</p>
            <p className='text-m '>Please continue by signing up or logging in if you have an account already</p>
          </div>
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <Button className='px-12' variant="secondary" size="lg" asChild>
              <Link href="/signUp">Sign Up</Link>
            </Button>
            <Button className=' px-12' variant="default" size="lg" asChild>
              <Link href="/signIn">Login</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}
