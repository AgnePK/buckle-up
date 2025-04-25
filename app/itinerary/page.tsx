"use client"

import { useEffect, useState, Suspense } from 'react';
import { TripType, UserType } from '@/types/types';
// FIREBASE //
import { db } from '@/firebaseConfig'
import { ref, onValue, off, set, push, child } from "firebase/database";
import { useSession } from '@/AuthContext';

import { CalendarDays, CheckCircle, Filter, Plus, Search, PlaneTakeoff, PlaneLanding, PenLine } from "lucide-react"
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
import landscape3 from "@/public/illustrations/landscape3.png"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { landscapes } from '@/utils/landscapeImages';
import { Input } from '@/components/ui/input';
export default function Itinerary() {
    // to create a unique id for users use this: 
    // const UID = push(child(ref(database), "user")).key;

    const [trip, setTrip] = useState<TripType[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isLoading } = useSession();
    const router = useRouter();

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Separate success alert component
    function SuccessAlert() {
        const searchParams = useSearchParams();
        const [showSuccessAlert, setShowSuccessAlert] = useState(false);
        const [successMessage, setSuccessMessage] = useState("");

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

        if (!showSuccessAlert) return null;

        return (
            <Alert className="fixed bottom-5 right-5 max-w-sm border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                    {successMessage}
                </AlertDescription>
            </Alert>
        );
    }

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
            <div className="flex flex-col items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
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

    return (
        <>
            <div className='flex flex-col mx-6 '>
                {/* <Suspense fallback={null}> */}
                <SuccessAlert />
                {/* </Suspense> */}

                {/* HERO GOES HERE */}
                <div className="relative h-[80vh] w-full -mt-[128px]">
                    <div className="absolute inset-0 -mx-[24px] overflow-hidden">
                        <Image
                            src={landscapeImages[currentImageIndex]}
                            alt="Landscape hero image"
                            fill
                            priority
                            className="object-cover"
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/100 via-black/80 to-transparent"></div>
                    </div>
                    <div className="relative flex items-center h-full w-2/3">
                        <div className="flex flex-col gap-6 text-white p-6 pt-24 w-full max-w-7xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold">Begin your journey <br /> across Ireland</h2>
                            <p className="text-sm md:text-base mt-2 md:w-3/5">Plan your next trip to The Emerald Isle. Build your itineraries, organise your trips, discover new places, browse through the local bnbs.</p>
                            <div className=" md:flex-row">
                                <Button
                                    variant={"default"}
                                    onClick={() => router.push("/itinerary/create")}
                                    className="w-40 my-2"
                                >
                                    Create Itinerary
                                    <Plus />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col md:flex-row justify-around items-center mb-6 content-center'>
                    <div className='md:w-2/3  mt-8'>
                        <div className='md:flex md:flex-row-reverse items-center justify-between gap-4  p-2 mb-8'>
                            <Image src={roadtrip} alt={''} width={350} />
                            <div className='flex flex-col gap-8'>
                                <div>
                                    <h1 className='text-4xl text-primary'>Welcome Back,</h1>
                                    <span className='text-5xl text-primary'> {user.displayName}</span>
                                </div>

                                <p className='text-lg'>Your Irish adventures await. Here are the itineraries you've created—ready to explore, edit, or share with your travel companions.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
                <div className='mx-8 flex justify-between mb-6 items-center '>
                    <h2 className='text-2xl'>My Itineraries</h2>
                    <div className='md:flex items-center justify-end md:w-1/3'>

                        <div className='flex gap-4 ms-4 md:me-2'>
                            <Button
                                variant={viewMode === 'list' ? "default" : "ghost"}
                                size="icon"
                                onClick={() => setViewMode('list')}
                                className="h-8 w-8 p-0"
                            >
                                <List size={42} />
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? "default" : "ghost"}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                                className="h-8 w-8 p-0"
                            >
                                <LayoutGrid />
                            </Button>
                        </div>


                    </div>
                </div>
                {trip.length === 0 ? (
                    <div className="bg-card rounded-md p-6 text-center">
                        <Card className="w-full max-w-xl mx-auto text-center p-6 border-none shadow-none bg-transparent">
                            <CardHeader>
                                <CardTitle>No Trips Found</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4">You haven't created any trips yet.</p>
                                <Button
                                    variant="default"
                                    onClick={() => router.push("/itinerary/create")}
                                    className="mx-auto"
                                >
                                    <Plus className="mr-2" />
                                    Create Your First Itinerary
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : viewMode === 'list' ? (
                    // List view (your existing view)
                    <div className='grid grid-cols-1 gap-2 bg-card rounded-md p-2 mb-6 '>
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
                                <div key={item.id}>
                                    <Card key={item.id} className=' -my-[8px] border-none bg-transparent shadow-none hover:shadow-sm transition-shadow rounded-none flex flex-col md:flex-row w-full'>
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
                                                <p> {startDate} - {endDate} </p>
                                            </div>
                                        </CardContent>
                                        <CardContent className='w-full md:w-1/4'>
                                            {item.flight && (item.flight.departure || item.flight.landing) ? (
                                                <div className="flex items-center gap-10">
                                                    <div className='flex gap-2'>
                                                        <PlaneTakeoff className='text-primary' />
                                                        {item.flight.departure}
                                                    </div>
                                                    <div className='flex gap-2'>
                                                        <PlaneLanding className='text-primary' />
                                                        {item.flight.landing}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-600">
                                                    {item.notes ?
                                                        (item.notes.length > 30 ? `${item.notes.substring(0, 30)}...` : item.notes)
                                                        : <i>No notes</i>}
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter className='w-full md:w-1/4 justify-end gap-2'>
                                            <Button variant="default" className='md:ms-auto' onClick={() => { router.push(`/itinerary/${item.id}`) }}>
                                                View Itinerary
                                            </Button>
                                            <Button variant="ghost" className=""
                                                onClick={() => { router.push(`/itinerary/${item.id}/edit`) }}>
                                                <PenLine className="text-slate-600" size={20} />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                    <Separator className='bg-gray-300' />
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    // Grid view (card style)
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6'>
                        {trip.slice(0).reverse().map((item) => {
                            const formatDate = (dateString: string) => {
                                if (!dateString) return "";
                                const date = new Date(dateString);
                                if (isNaN(date.getTime())) return dateString;
                                return date.toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric'
                                });
                            };

                            const startDate = formatDate(item.start_date);
                            const endDate = formatDate(item.end_date);

                            return (
                                <Card key={item.id} className="hover:shadow-md transition-shadow ">
                                    <Link
                                        href={`/itinerary/${item.id}`}
                                        className=''
                                    >
                                        <CardHeader>
                                            <CardTitle className='text-lg'>
                                                {item.title ?
                                                    (item.title.length > 25 ? `${item.title.substring(0, 25)}...` : item.title)
                                                    : 'Untitled Trip'}
                                            </CardTitle>
                                        </CardHeader>
                                    </Link>
                                    <CardContent className='flex items-center gap-3 '>
                                        <CalendarDays className='w-6 h-6 text-primary' />
                                        <div>
                                            <p> {startDate} - {endDate} </p>
                                        </div>
                                    </CardContent>
                                    <CardContent className=''>
                                        {item.flight && (item.flight.departure || item.flight.landing) ? (
                                            <div className="flex items-center gap-10">
                                                <div className='flex gap-2'>
                                                    <PlaneTakeoff className='text-primary' />
                                                    {item.flight.departure}
                                                </div>
                                                <div className='flex gap-2'>
                                                    <PlaneLanding className='text-primary' />
                                                    {item.flight.landing}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-600">
                                                {item.notes ?
                                                    (item.notes.length > 30 ? `${item.notes.substring(0, 30)}...` : item.notes)
                                                    : <i>No notes</i>}
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className='gap-2 justify-between'>
                                        <Button variant="default" className='' onClick={() => { router.push(`/itinerary/${item.id}`) }}>
                                            View Itinerary
                                        </Button>
                                        <Button variant="ghost" className=""
                                            onClick={() => { router.push(`/itinerary/${item.id}/edit`) }}>
                                            <PenLine className="text-slate-600" size={20} />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}