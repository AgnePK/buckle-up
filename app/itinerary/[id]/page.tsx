"use client"

import React, { useEffect, useRef, useState } from 'react'
import { db } from '@/firebaseConfig';
import { ref, onValue, off, remove } from 'firebase/database';
import { useSession } from '@/AuthContext';
import generatePDF from '@/components/generateToPDF';

import { TripType } from '@/types/types'
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Download, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

import ItineraryMapView from '@/Maps/itineraryMapView';

import Image from 'next/image';
import journey from "@/public/illustrations/journey.png"
// AI chatbot

import { ChatProvider } from '@/gemeni/ChatContext';
import { ChatButton } from '@/gemeni/ChatComponent';
import OpenInGoogleMaps from '@/Maps/OpenInGoogleMaps';

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
            <div className="flex justify-center items-center p-8">
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

    return (
        <ChatProvider>
            <div className="mx-auto px-4">

                <ItineraryMapView trip={trip} />



                {hasLocations && (
                    <div className="my-6 flex justify-start">
                        <OpenInGoogleMaps trip={trip} />
                    </div>
                )}

                <div id='itinerary-container' className="grid gap-6 p-6">
                    <div className='md:flex md:flex-row'>
                        <div className='md:w-1/2'>
                            <h1 className='text-4xl font-bold'>
                                {trip.title || 'Untitled Trip'}
                            </h1>
                            <div className="flex gap-4">
                                <p className="font-medium">Start Date: <span className="font-normal">{trip.start_date}</span></p>
                                <p className="font-medium">End Date: <span className="font-normal">{trip.end_date}</span></p>
                            </div>

                            {/* Display Flight Details */}
                            {hasFlightInfo && (
                                <div className="border-t pt-4">
                                    <h2 className="text-xl font-semibold mb-2">Flight Details</h2>
                                    {trip.flight.flight_number && (
                                        <p className="mb-1">Flight Number: {trip.flight.flight_number}</p>
                                    )}
                                    {trip.flight.departure && (
                                        <p className="mb-1">Departure: {trip.flight.departure}</p>
                                    )}
                                    {trip.flight.landing && (
                                        <p className="mb-1">Landing: {trip.flight.landing}</p>
                                    )}
                                </div>
                            )}

                            {/*Display Notes */}
                            {trip.notes && (
                                <div className="border-t pt-4">
                                    <h2 className="text-xl font-semibold mb-2">Notes</h2>
                                    <p className="whitespace-pre-wrap">{trip.notes}</p>
                                </div>
                            )}

                            <h2 className="text-xl font-semibold mb-4">Itinerary Plan</h2>
                        </div>
                        <div className='md:w-1/2 '>
                            <div className='flex justify-end'>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex items-center gap-2"
                                        onClick={() => { router.push(`/itinerary/${id}/edit`) }}>
                                        <PenLine className="text-slate-500" size={20} /> Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                            <Image src={journey} alt={''} />
                        </div>

                    </div>
                    {/* Display Trip Days */}
                    {trip.days && Object.keys(trip.days).length > 0 && (
                        <div className="pt-4">

                            {Object.entries(trip.days).map(([dayNumber, dayData]) => (
                                <div key={dayNumber} className="mb-6 bg-slate-50 p-4 rounded-md">
                                    <h3 className="text-lg font-medium mb-3">Day {dayNumber}</h3>

                                    {/* Render Stops for Morning, Afternoon, and Evening with timeline */}
                                    {['morning', 'afternoon', 'evening'].map((timeOfDay) => {
                                        const stops = (dayData as any)[timeOfDay];
                                        if (!stops || stops.length === 0) return null; // Skip empty data

                                        return (
                                            <div key={timeOfDay} className="mb-4">
                                                <h4 className="capitalize font-medium text-slate-700 mb-2">
                                                    {timeOfDay}
                                                </h4>

                                                {/* Timeline for this period */}
                                                <ol className="relative border-s border-gray-200 dark:border-gray-700 ml-4">
                                                    {stops.map((stop: any, index: number) => (
                                                        <li key={index} className={index !== stops.length - 1 ? "mb-6 ms-4" : "ms-4"}>
                                                            <div className="absolute w-3 h-3 bg-emerald-500 rounded-full mt-1.5 -start-1.5 border border-white"></div>

                                                            {/* Time as the timeline marker */}
                                                            <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                                                                {stop.time || "No time set"}
                                                            </time>

                                                            {/* Stop name as the title */}
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {stop.name}
                                                            </h3>

                                                            {/* Notes as the description */}
                                                            {stop.notes && (
                                                                <p className="text-base font-normal text-gray-500">
                                                                    {stop.notes}
                                                                </p>
                                                            )}

                                                            {/* Show address if available */}
                                                            {stop.address && (
                                                                <p className="mt-2 text-sm italic text-gray-400">
                                                                    Address: {stop.address}
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
                        </div>
                    )}
                    <div className="mt-6 border-t pt-4">

                        <Button
                            onClick={() => generatePDF()}
                            className="flex items-center gap-2 mt-2"
                            variant="outline"
                        >
                            <Download size={16} />
                            Save as PDF
                        </Button>
                    </div>

                </div>
                <ChatButton trip={trip} />
            </div>
        </ChatProvider>

    )
}

export default ViewItinerary