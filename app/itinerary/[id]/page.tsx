"use client"

import React, { useEffect, useRef, useState } from 'react'
import { db } from '@/firebaseConfig';
import { ref, onValue, off, remove } from 'firebase/database';
import { useSession } from '@/AuthContext';
import generatePDF from '@/components/generateToPDF';

import { TripType } from '@/types/types'
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, Download, PenLine, Trash2, Plane, Navigation, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

import ItineraryMapView from '@/Maps/itineraryMapView';

import Image from 'next/image';
// import journey from "@/public/illustrations/journey.png"
// AI chatbot

import { ChatProvider } from '@/gemeni/ChatContext';
import { ChatButton } from '@/gemeni/ChatComponent';
import OpenInGoogleMaps from '@/Maps/OpenInGoogleMaps';
import { Separator } from '@/components/ui/separator';

const ViewItinerary = () => {
    const params = useParams();
    const id = params.id as string;

    const [trip, setTrip] = useState<TripType | null>(null);
    const [loading, setLoading] = useState(true);

    const { user, isLoading } = useSession();
    const router = useRouter();
    // PDF


    useEffect(() => {
        if (!isLoading && !user) {
            console.log("No authenticated user detected, redirecting to sign in");
            router.push('/signIn');
        }
    }, [user, isLoading, router]);


    // READ USER trips
    useEffect(() => {
        if (isLoading || !user?.uid) {
            console.log("Auth is still loading or no user, waiting...");
            return; // Wait for auth to initialise
        }

        const readData = ref(db, `User/${user.uid}/trips/${id}`);
        console.log("url: ", readData);

        const handleData = (snapshot: any) => {
            try {
                const data = snapshot.val();
                setLoading(false);

                if (data) {
                    setTrip(data as TripType);
                } else {
                    console.log("No trip found");
                    setTrip(null);
                }
            } catch (error) {
                console.error("Error processing Firebase data:", error);
                setLoading(false);
                setTrip(null);
            }
        };

        // Set up the listener correctly
        onValue(readData, handleData, (error) => {
            console.error("Firebase read failed:", error);
            setLoading(false);
        });

        // Cleanup function
        return () => off(readData);
    }, [id, user, isLoading]);


    if (!trip) {
        return (
            <div className="flex flex-col items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p>Loading...</p>
            </div>

        );
    }

    // handle Delete
    const handleDelete = (id: string) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this itinerary?");
        if (isConfirmed) {
            confirmDelete(id);
        }
    };

    const confirmDelete = async (id: string) => {
        try {
            await remove(ref(db, `User/${user?.uid}/trips/${id}`));
            alert("The itinerary has been deleted.");
            // Navigate back or refresh the list
            router.push("/itinerary");
        } catch (error) {
            console.error("Error deleting itinerary:", error);
            alert("Failed to delete the itinerary. Please try again.");
        }
    };

    const hasLocations = Object.values(trip.days || {}).some(day => {
        return ['morning', 'afternoon', 'evening'].some(period => {
            const stops = day[period as keyof typeof day];
            return stops && Array.isArray(stops) && stops.some(stop => stop.location);
        });
    });

    const hasFlightInfo = trip.flight && (
        trip.flight.flight_number?.trim() ||
        trip.flight.departure?.trim() ||
        trip.flight.landing?.trim()
    );

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

    const startDate = formatDate(trip.start_date);
    const endDate = formatDate(trip.end_date);
    return (
        <ChatProvider>
            <div className="px-4 md:px-0 md:flex flex-row-reverse w-full">

                <div className="md:w-1/2">
                    <div className=' md:sticky top-0'>
                        <ItineraryMapView trip={trip} />
                        {hasLocations && (
                            <div className="my-6 ms-6 relative md:-mt-[70px] flex justify-start">
                                <OpenInGoogleMaps trip={trip} />
                            </div>
                        )}

                    </div>

                </div>

                <div id='itinerary-container' className="px-6 md:w-1/2 overflow-y-auto ">
                    <div className=''>
                        <div className='flex flex-col gap-8'>

                            <div className=" md:flex justify-between ">
                                <h1 className='text-4xl font-bold'>
                                    {trip.title || 'Untitled Trip'}
                                </h1>
                                <div className='flex gap-4 mt-4 md:mt-0 justify-end'>
                                    <Button variant="outline" className="flex items-center gap-2"
                                        onClick={() => { router.push(`/itinerary/${id}/edit`) }}>
                                        <PenLine className="text-slate-500" size={20} />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(id)}
                                    >
                                        <Trash2 />
                                    </Button>

                                </div>
                            </div>

                            <div className="flex gap-4">
                                <CalendarDays className='text-primary' />
                                <p className="">{startDate} to {endDate}</p>
                                {/* <div className=' w-1/2 '>
                                    <Image src={journey} alt={''} />
                                </div> */}
                            </div>
                            <Separator className='bg-gray-300' />
                            {/* Display Flight Details */}
                            {hasFlightInfo && (
                                <div className="flex flex-col gap-4">
                                    <span className="text-xl font-semibold mb-2">Flight Information</span>
                                    <div className='mb-4'>
                                        {trip.flight.flight_number && (
                                            <p className="justify-self-center mb-4">{trip.flight.flight_number}</p>
                                        )}
                                        <div className='flex justify-around '>
                                            <div className='flex flex-col gap-2'>
                                                {trip.flight.departure && (
                                                    <p className="text-4xl">{trip.flight.departure}</p>
                                                )}
                                                <p className='text-gray-600 mx-auto'>departure</p>
                                            </div>
                                            <div className='flex items-center gap-2 text-primary'>
                                                <span>- - - - - -</span>
                                                <Plane size={40} style={{ transform: 'rotate(45deg)' }} />
                                                <span>- - - - - -</span>

                                            </div>
                                            <div className='flex flex-col gap-2'>
                                                {trip.flight.landing && (
                                                    <p className="text-4xl">{trip.flight.landing}</p>
                                                )}
                                                <p className='text-gray-600 mx-auto'>landing</p>
                                            </div>

                                        </div>
                                    </div>
                                    <Separator className='bg-gray-300' />

                                </div>

                            )}

                            {/*Display Notes */}
                            {trip.notes && (
                                <div className="pb-8">
                                    <h2 className="text-xl font-semibold mb-4">Notes</h2>
                                    <p className="whitespace-pre-wrap">{trip.notes}</p>
                                </div>
                            )}

                        </div>


                    </div>
                    {/* Display Trip Days */}
                    {trip.days && Object.keys(trip.days).length > 0 && (
                        <div className="bg-muted/40  md:-mx-[24px] p-6 ">
                            <h2 className="text-xl font-semibold mb-4">Itinerary Plan</h2>

                            {Object.entries(trip.days).map(([dayNumber, dayData]) => (
                                <div key={dayNumber} className="mb-6 p-4">
                                    <h3 className="text-lg font-medium mb-3">Day {dayNumber}</h3>

                                    {/* Render Stops for Morning, Afternoon, and Evening with timeline */}
                                    {['morning', 'afternoon', 'evening'].map((timeOfDay) => {
                                        const stops = (dayData as any)[timeOfDay];
                                        if (!stops || stops.length === 0) return null; // Skip empty data

                                        return (
                                            <div key={timeOfDay} className="mb-4 ms-4">
                                                <h4 className="capitalize font-medium text-slate-700 mb-2">
                                                    {timeOfDay}
                                                </h4>

                                                {/* Timeline for this period */}
                                                <ol className="relative border-s border-gray-300 dark:border-gray-700 ml-4">
                                                    {stops.map((stop: any, index: number) => (
                                                        <li key={index} className={index !== stops.length - 1 ? "mb-6 ms-4" : "ms-4"}>
                                                            <div className="absolute w-3 h-3 bg-primary rounded-full mt-1.5 -start-1.5 border border-white"></div>

                                                            {/* Time as the timeline marker */}
                                                            <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                                                                {stop.time || "No time set"}
                                                            </time>

                                                            {/* Stop name as the title */}
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {stop.name}
                                                            </h3>

                                                            {/* Show address if available */}
                                                            {stop.address && (
                                                                <p className="text-sm italic text-gray-400 text-align">
                                                                    <a
                                                                        href={`https://www.google.com/maps?q=${stop.address}`}
                                                                        target="_blank"
                                                                        // this is to protect my site from bring linked in booking.com
                                                                        rel="noopener noreferrer"
                                                                        className='flex gap-2 text-emerald-500'
                                                                    >
                                                                        <Map size={12} className='mt-1' />

                                                                        {stop.address}
                                                                    </a>
                                                                </p>
                                                            )}

                                                            {/* Notes as the description */}
                                                            {stop.notes && (
                                                                <p className="text-base font-normal text-gray-500 m-4">
                                                                    {stop.notes}
                                                                </p>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                            <div className="mt-6">

                                <Button
                                    onClick={() => generatePDF()}
                                    className="flex items-center gap-2"
                                    variant="default"
                                >
                                    <Download size={16} />
                                    Save as PDF
                                </Button>
                            </div>
                        </div>
                    )}



                </div>
            </div>
            <ChatButton trip={trip} />
        </ChatProvider>

    )
}

export default ViewItinerary