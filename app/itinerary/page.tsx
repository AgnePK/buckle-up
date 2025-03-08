"use client"

import { useEffect, useState } from 'react';
import { TripType, UserType } from '@/types/types';
// FIREBASE //
import { db } from '@/firebaseConfig'
import { ref, onValue, off, set, push, child } from "firebase/database";
import { useSession } from '@/AuthContext';

// import { CalendarDays } from "~/lib/icons/Calendar"

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
export default function TabOneScreen() {
    // to create a unique id for users use this: 
    // const UID = push(child(ref(database), "user")).key;

    const [trip, setTrip] = useState<TripType[]>([]);
    const { user } = useSession();
    if (!user?.uid) return <p>Loading...</p>;
    console.log("UserData:", user)
    
    // READ USER trips
    useEffect(() => {
        const readData = ref(db, `User/${user.uid}/trips`);
        console.log("Firebase Data:", readData);

        const unsubscribe = onValue(readData, (snapshot) => {
            try {
                const data = snapshot.val();
                if (data) {
                    const dataList = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    })) as (TripType & { id: string })[];
                    console.log("Firebase Data:", data);
                    setTrip(dataList);
                }
            } catch (error) {
                console.error("Error processing Firebase data:", error);
            }
        },
            (error) => {
                console.error("Firebase read failed:", error);
            }
        );
        // the off function ends the task, meaning this useeffect will only run once
        return () => off(readData);
    }, []);

    return (
        <div className='flex items-center'>
            {trip.map((item, index) => (
                <Card className='w-full max-w-sm'>
                    <Link
                        href={{
                            pathname: '/itinerary',
                        }}>
                        <CardHeader>
                            <CardTitle>{item.title || 'Untitled Trip'}</CardTitle>
                        </CardHeader>
                    </Link>
                    <CardContent className='flex-row items-center'>
                        {/* <CalendarDays className='w-10 h-10 text-emerald-800' /> */}
                        <div>
                            <p> From {item.start_date} to {item.end_date} </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <p>Notes: {item.notes}</p>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}