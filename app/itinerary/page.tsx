"use client"

import { useEffect, useState } from 'react';
import { TripType, UserType } from '@/types/types';
// FIREBASE //
import { db } from '@/firebaseConfig'
import { ref, onValue, off, set, push, child } from "firebase/database";
import { useSession } from '@/AuthContext';

import { CalendarDays } from "lucide-react"

// React native Reusables
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Itinerary() {
    // to create a unique id for users use this: 
    // const UID = push(child(ref(database), "user")).key;

    const [trip, setTrip] = useState<TripType[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isLoading } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            console.log("No authenticated user detected, redirecting to sign in");
            router.push('/signIn');
        }
    }, [user, isLoading, router]);

    // READ USER trips
    useEffect(() => {
        if (isLoading) {
            console.log("Auth is still loading, waiting...");
            return; // Wait for auth to initialize
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
            <div className='flex flex-col ms-6'>
                <div className='flex mb-6'>
                    <h1 className='text-3xl'>Welcome Back, {user.displayName}</h1>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    {trip.map((item, index) => (
                        <Card key={item.id} className='w-full max-w-sm'>
                            <Link
                                href={`/itinerary/${item.id}`}
                            >
                                <CardHeader>
                                    <CardTitle>{item.title || 'Untitled Trip'}</CardTitle>
                                </CardHeader>
                            </Link>
                            <CardContent className='flex items-center gap-3'>
                                <CalendarDays className='w-6 h-6 text-emerald-800' />
                                <div>
                                    <p> From {item.start_date} to {item.end_date} </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <p>Notes: {item.notes || 'No notes'}</p>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}