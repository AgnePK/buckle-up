"use client"

import { useEffect, useState } from 'react';
import { TripType, UserType } from '@/types/types';
// FIREBASE //
import { db } from '@/firebaseConfig'
import { ref, onValue, off, set, push, child } from "firebase/database";
import { useSession } from '@/AuthContext';

import { CalendarDays, CheckCircle, Filter, Plus, Search, PlaneTakeoff, PlaneLanding } from "lucide-react"
import { LayoutGrid, List } from "lucide-react"

// React native Reusables
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image"
import roadtrip from "@/public/illustrations/roadtrip.png"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

import { landscapes } from '@/utils/landscapeImages';
import { Input } from '@/components/ui/input';
export default function Itinerary() {
    // to create a unique id for users use this: 
    // const UID = push(child(ref(database), "user")).key;

    const [trip, setTrip] = useState<TripType[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isLoading } = useSession();
    const router = useRouter();

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const searchParams = useSearchParams();

    // Check for success param in the URL (this will be used if redirected from create page)
    useEffect(() => {
        const success = searchParams.get('success');
        const tripName = searchParams.get('tripName');

        if (success === 'true' && tripName) {
            setSuccessMessage(`Your trip "${tripName}" has been created successfully!`);
            setShowSuccessAlert(true);

            // Hide the alert after 5 seconds
            const timer = setTimeout(() => {
                setShowSuccessAlert(false);
            }, 5000);

            // Clean URL parameters without refreshing the page
            window.history.replaceState({}, '', '/itinerary');

            return () => clearTimeout(timer);
        }
    }, [searchParams]);


    useEffect(() => {
        if (!isLoading && !user) {
            console.log("No authenticated user detected, redirecting to sign in");
            router.push('/signIn');
        }
    }, [user, isLoading, router]);


    // Get all landscape images from your imported images
    const landscapeImages = landscapes
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        // Set up the interval to change images every 30 seconds
        const intervalId = setInterval(() => {
            setCurrentImageIndex(prevIndex =>
                prevIndex === landscapeImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 30000);

        // Clean up the interval when component unmounts
        return () => clearInterval(intervalId);
    }, [landscapeImages.length]);

    // READ USER trips
    useEffect(() => {
        if (isLoading) {
            console.log("Auth is still loading, waiting...");
            return; // Wait for auth to initialise
        }

        if (!user?.uid) {
            setLoading(false);
            console.log("No user UID available, cannot fetch trips");
            return; // No user, no data to fetch
        }

        console.log("Fetching trips for user:", user.uid);
        const tripsRef = ref(db, `User/${user.uid}/trips`);

        const handleData = (snapshot: any) => {
            try {
                const data = snapshot.val();
                console.log("Firebase Data received:", data);

                if (data) {
                    const tripsList = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    }));
                    console.log("Processed trips:", tripsList.length);
                    setTrip(tripsList);
                } else {
                    console.log("No trips found for user");
                    setTrip([]);
                }
            } catch (error) {
                console.error("Error processing Firebase data:", error);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = onValue(tripsRef, handleData, (error) => {
            console.error("Firebase read failed:", error);
            setLoading(false);
        });

        // Cleanup listener on unmount or when dependencies change
        return () => {
            console.log("Cleaning up trips listener");
            off(tripsRef);
        };
    }, [user, isLoading]);
    if (isLoading || loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <p>Loading...</p>
            </div>
        );
    }
    if (!user) {
        return (
            <div className="flex justify-center items-center p-8">
                <p>Please sign in to view your trips</p>
            </div>
        );
    }
    // No trips yet
    if (trip.length === 0) {
        return (
            <div className="flex justify-center items-center p-8">
                <Card className="w-full max-w-md text-center p-6">
                    <CardHeader>
                        <CardTitle>No Trips Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You haven't created any trips yet.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div className='flex flex-col mx-6'>
                {showSuccessAlert && (
                    <Alert className="mx-auto mb-4 border-green-500 bg-green-50 w-1/3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>
                            {successMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {/* HERO GOES HERE */}
                <div className="w-screen h-[80vh] relative -mt-[128px] -ms-[24px] " >
                    <Image
                        src={landscapeImages[currentImageIndex]}
                        alt="Landscape hero image"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="flex items-center w-1/2 absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent">
                        <div className="flex flex-col gap-6 text-white p-6 pt-24 w-full max-w-7xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold">Begin your journey <br /> across Ireland</h2>
                            <p className="text-sm md:text-base mt-2">Plan your next trip to The Emerald Isle. Build your itineraries, organise your trips, discover new places, browse through the local bnbs.</p>
                            <div className='md:flex-row '>
                                <Button variant={"outline"} className='bg-transparent m-2 w-40'>
                                    Discover
                                </Button>
                                <Button
                                    variant={"default"}
                                    onClick={() => router.push("/itinerary/create")}
                                    className=' w-40 m-2'
                                >
                                    <Plus />
                                    New Itinerary
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col md:flex-row justify-around items-center mb-6 content-center'>
                    <div className='m-12 '>
                        <h1 className='text-2xl'>Welcome Back,</h1>
                        <div className='flex flex-col gap-8'>
                            <span className='text-5xl'> {user.displayName}</span>
                            <p>Please find your itineraries below</p>
                            {/* <Button variant={"default"} onClick={() => router.push("/itinerary/create")} className='w-38'>
                                <Plus />
                                New Itinerary
                            </Button> */}
                        </div>
                    </div>
                    <Image
                        alt="illustration of a road trip"
                        src={roadtrip}
                        width={350}

                        style={{
                            maxWidth: "100%",
                            height: "auto",
                        }}
                    />
                </div>
                <div className='flex justify-between mb-6 items-center'>
                    <Input
                        type="text"
                        placeholder="Search itneraries..."
                        value={""}
                        className="p-2 border border-gray-300  w-5/6"
                        readOnly
                    />
                    <div className='flex gap-6 mx-6'>
                        <List />
                        <LayoutGrid />
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-2'>
                    {trip.slice(0).reverse().map((item, index) => {

                        // Format dates from "YYYY-MM-DD" to "Month DD"
                        const formatDate = (dateString: string) => {
                            if (!dateString) return "";

                            const date = new Date(dateString);

                            // Check if date is valid
                            if (isNaN(date.getTime())) return dateString;

                            // Format the date
                            return date.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric'
                            });
                        };

                        const startDate = formatDate(item.start_date);
                        const endDate = formatDate(item.end_date);
                        return (
                            <>
                                <Card key={item.id} className='bg-transpatent border-none shadow-none flex flex-col md:flex-row w-full'>
                                    <Link
                                        href={`/itinerary/${item.id}`}
                                        className='w-full md:w-1/4'
                                    >
                                        <CardHeader>
                                            <CardTitle className='text-lg'>
                                                {item.title ?
                                                    (item.title.length > 25 ? `${item.title.substring(0, 25)}...` : item.title)
                                                    : 'Untitled Trip'}
                                            </CardTitle>
                                        </CardHeader>
                                    </Link>
                                    <CardContent className='flex items-center gap-3 w-full md:w-1/4'>
                                        <CalendarDays className='w-6 h-6 text-primary' />
                                        <div>
                                            <p> {startDate} to {endDate} </p>
                                        </div>
                                    </CardContent>
                                    <CardContent className='w-full md:w-1/4'>
                                        {item.flight && (item.flight.departure || item.flight.landing) ? (
                                            <div className="flex items-center gap-4">
                                                <PlaneTakeoff className='text-primary' />
                                                {item.flight.departure}
                                                <PlaneLanding className='text-primary' />
                                                {item.flight.landing}
                                            </div>
                                        ) : (
                                            <div className="text-gray-600">
                                                {item.notes ?
                                                    (item.notes.length > 30 ? `${item.notes.substring(0, 30)}...` : item.notes)
                                                    : 'No notes'}
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className='w-full md:w-1/4'>
                                        <Button variant="default" className='md:ms-auto' onClick={()=>{router.push(`/itinerary/${item.id}`)}}>
                                            View Itinerary
                                        </Button>
                                    </CardFooter>
                                </Card>
                                <Separator className='bg-gray-200' />
                            </>
                        )
                    })}
                </div>
            </div>
        </>
    );
}