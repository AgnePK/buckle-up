"use client";
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import planner from "@/public/illustrations/planner.png"
import { useSession } from '@/AuthContext';

export default function Home() {
  const router = useRouter()
  const { user, redirectBasedOnAuth } = useSession()

  useEffect(() => {
    if (user) {
      redirectBasedOnAuth("/itinerary");
    }
  }, [user, redirectBasedOnAuth]);


  return (
    <div className="grid place-content-center min-h-screen">
      <main className="flex flex-row content-center items-center ">
        <div>
          <Image
            alt="illustration of a notebook and airplane"
            src={planner}
            width={500}
            sizes="100vw"
            className=""
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>


        <div className='flex flex-col gap-8 p-18'>
          <h1 className="text-6xl text-primary font-extrabold ">Buckle Up</h1>
          <div className='w-80 flex flex-col gap-6 '>
            <p className='text-m font-bold'>Welcome to Buckle Up.</p>
            <p className='text-m '>Let's begin you journey across Eire. Plan your Itinerary and explore different activities and BnB's across Ireland</p>
            <p className='text-m '>Please continue by signing up or logging in if you have an account already</p>
          </div>
          <div className="flex gap-4 items-center">
            <Button className='w-38' variant="outline" size="lg" onClick={() => { router.push("/signUp") }}>
              Sign up
            </Button>
            <Button className=' w-38' variant="default" size="lg" onClick={() => { router.push("/signIn") }}>
              Log in
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
