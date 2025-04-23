"use client"

import React, { useState, useEffect } from 'react';
import { useSession } from '@/AuthContext';
import { db } from '@/firebaseConfig';
import { ref, onValue, off } from 'firebase/database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Building,
    MapPin,
    ExternalLink,
    Phone,
    Calendar,
    Loader2,
    BookmarkX,
    Navigation
} from 'lucide-react';
import SaveButton from '@/components/savedItems';
import { useRouter } from 'next/navigation';
import { Attractions, Accommodation, Events } from '@/types/types';
import { Button } from '@/components/ui/button';

import Image from 'next/image';
import { bnbs } from '@/utils/bnbImages';

// Type for our saved items
interface SavedItemsState {
    attractions: Attractions[];
    accommodations: Accommodation[];
    events: Events[];
}

export default function SavedItemsPage() {
    const { user, isLoading: authLoading, redirectBasedOnAuth } = useSession();
    const [savedItems, setSavedItems] = useState<SavedItemsState>({
        attractions: [],
        accommodations: [],
        events: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            redirectBasedOnAuth("/signIn");
            return;
        }

        const userSavedItemsRef = ref(db, `User/${user.uid}/saved`);

        const handleData = (snapshot: any) => {
            const data = snapshot.val();
            const items: SavedItemsState = {
                attractions: [],
                accommodations: [],
                events: []
            };

            if (data) {
                // Process attractions
                if (data.attractions) {
                    items.attractions = Object.entries(data.attractions).map(([id, item]) => ({
                        id,
                        ...(item as Omit<Attractions, 'id'>)
                    })) as Attractions[];
                }

                // Process accommodations
                if (data.accommodations) {
                    items.accommodations = Object.entries(data.accommodations).map(([id, item]) => ({
                        id,
                        ...(item as Omit<Accommodation, 'id'>)
                    })) as Accommodation[];
                }

                // Process events
                if (data.events) {
                    items.events = Object.entries(data.events).map(([id, item]) => ({
                        id,
                        ...(item as Omit<Events, 'id'>)
                    })) as Events[];
                }
            }

            setSavedItems(items);
            setIsLoading(false);
        };

        onValue(userSavedItemsRef, handleData, (error) => {
            console.error("Firebase read failed:", error);
            setIsLoading(false);
        });

        return () => off(userSavedItemsRef);
    }, [user, authLoading, router]);

    // Format date function for events
    const formatDate = (dateString: string) => {
        if (!dateString) return 'No date available';

        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex flex-col items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p>Loading...</p>
            </div>
        );
    }

    const getConsistentImage = (item: Accommodation) => {
        // Use a property that's always available and consistent for each accommodation
        const identifier = item["Property Reg Number"] ||
            item["Account Name"] ||
            item.id ||
            JSON.stringify(item);

        // Create a numeric hash from the string
        let hash = 0;
        if (identifier) {
            for (let i = 0; i < identifier.length; i++) {
                hash = ((hash << 5) - hash) + identifier.charCodeAt(i);
                hash |= 0; // Convert to 32bit integer
            }
        }

        // Get a consistent index between 0 and bnbs.length-1
        const imageIndex = Math.abs(hash) % bnbs.length;
        return bnbs[imageIndex];
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">My Saved Items</h1>
            <p className="text-muted-foreground mb-6">Places and events you've saved for your trip</p>

            <Tabs defaultValue="attractions" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-3">
                    <TabsTrigger value="accommodations">
                        BnBs ({savedItems.accommodations.length})
                    </TabsTrigger>
                    <TabsTrigger value="attractions">
                        Attractions ({savedItems.attractions.length})
                    </TabsTrigger>
                    <TabsTrigger value="events">
                        Events ({savedItems.events.length})
                    </TabsTrigger>
                </TabsList>

                {/* Attractions Tab */}
                <TabsContent value="attractions">
                    {savedItems.attractions.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-lg">
                            <BookmarkX className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No saved attractions</h3>
                            <p className="text-slate-600">You haven't saved any attractions yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedItems.attractions.map((item, index) => (
                                <Card key={item.id || `attraction-${index}`} className="h-full">
                                    <CardHeader className='flex-row justify-between content-center'>
                                        <CardTitle>{item.Name} </CardTitle>
                                        <div>{<SaveButton item={item} itemType="attraction" />}</div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center mb-4">
                                            <MapPin size={22} className="text-primary mr-2" />
                                            <p>{item.Address || item.County}</p>
                                        </div>

                                        {item.Telephone && (
                                            <div className='flex gap-2'>
                                                <Phone size={22} className='text-gray-600' />
                                                <p className="text-gray-600 mb-2">Tel: {item.Telephone}</p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {item.Tags && (
                                                Array.isArray(item.Tags)
                                                    ? item.Tags.map((tag: string, tagIndex: number) => (
                                                        <Badge key={tagIndex} variant="outline" className='border border-secondary'>{tag}</Badge>
                                                    ))
                                                    : typeof item.Tags === 'string' && (
                                                        <Badge variant="outline" className='border border-secondary'>{item.Tags}</Badge>
                                                    )
                                            )}
                                        </div>

                                    </CardContent>
                                    <CardFooter className='mt-auto flex justify-between'>
                                        <a
                                            href={`https://www.google.com/maps?q=${item.Latitude}+${item.Longitude}`}
                                            target="_blank"
                                            // this is to protect my site from bring linked in booking.com
                                            rel="noopener noreferrer"
                                            className='flex gap-2'
                                        >
                                            <Button variant={"outline"} className='bg-transparent'>
                                                <Navigation size={22} className='' />
                                                Google Maps
                                            </Button>
                                        </a>
                                        {item.Url ? (
                                            <a
                                                href={item.Url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary"
                                            >
                                                <Button variant={"default"}>
                                                    <ExternalLink className="mr-2" />
                                                    Visit Website
                                                </Button>
                                            </a>
                                        ) : (
                                            <Button variant={"ghost"} >
                                                <p className="text-gray-500 text-sm italic">No link available</p>
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Accommodations Tab */}
                <TabsContent value="accommodations">
                    {savedItems.accommodations.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-lg">
                            <BookmarkX className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No saved BnBs</h3>
                            <p className="text-slate-600">You haven't saved any BnBs yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedItems.accommodations.map((item, index) => {
                                return (
                                    <Card key={item["Property Reg Number"]} className="h-full pt-0 border-none">
                                        <div className="relative w-full h-48 overflow-hidden">
                                            <Image
                                                src={getConsistentImage(item)}
                                                alt={`${item["Account Name"] || "Accommodation"}`}
                                                fill
                                                className="object-cover transition-transform duration-300 hover:scale-105 rounded-lg"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                priority={index < 6}
                                            />
                                        </div>
                                        <CardHeader className='flex-row justify-between content-center'>
                                            <CardTitle>{item["Account Name"]}</CardTitle>
                                            <div className='-mt-[40px] relative'>{<SaveButton item={item} itemType="accommodation" />}</div>
                                        </CardHeader>
                                        <CardContent>

                                            <div className="flex items-center mb-2">
                                                <MapPin size={22} className="text-primary mr-2" />
                                                <p>{item["Address Line 1"]}, {item["Address County"]}</p>
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps?q=${item.Latitude}+${item.Longitude}`}
                                                target="_blank"
                                                // this is to protect my site from bring linked in booking.com
                                                rel="noopener noreferrer"
                                                className='flex gap-2'
                                            >
                                                <Navigation size={22} className='text-primary' />
                                                Open in Google Maps
                                            </a>
                                        </CardContent>
                                        <CardFooter className='flex justify-between'>

                                            <a
                                                href={`https://www.booking.com/search.html?ss=${encodeURIComponent(item["Account Name"] || "")}+${encodeURIComponent(item["Address County"] || "Ireland")}`}
                                                target="_blank"
                                                // this is to protect my site from bring linked in booking.com
                                                rel="noopener noreferrer"
                                                className='flex gap-2'
                                            >
                                                <Button>
                                                    <ExternalLink size={22} className='text-background' />
                                                    Booking.com
                                                </Button>
                                            </a>
                                        </CardFooter>
                                    </Card>

                                )
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Events Tab */}
                <TabsContent value="events">
                    {savedItems.events.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-lg">
                            <BookmarkX className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No saved events</h3>
                            <p className="text-slate-600">You haven't saved any events yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedItems.events.map((item) => (
                                <Card key={item.id} className="h-full">
                                    <CardHeader className='flex-row justify-between content-center'>
                                        <CardTitle>{item.name}</CardTitle>
                                        <div>{<SaveButton item={item} itemType="event" />}</div>

                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-start">
                                            <Calendar className="h-5 w-5 mr-2 text-primary shrink-0 mt-1" />
                                            <div>
                                                <p className="font-medium">Event Date</p>
                                                <p className="text-sm">{formatDate(item.dtstart)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Building className="h-5 w-5 mr-2 text-primary shrink-0 mt-1" />
                                            <div>
                                                <p className="font-medium">Venue</p>
                                                <p className="text-sm">{item.venue?.name || "Unknown Venue"}</p>
                                                {item.venue?.web && (
                                                    <a
                                                        href={item.venue.web}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline text-xs"
                                                    >
                                                        Venue website
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <MapPin className="h-5 w-5 mr-2 text-primary shrink-0 mt-1" />
                                            <div>
                                                <p className="font-medium">Location</p>
                                                <p className="text-sm">
                                                    {item.town?.name && `${item.town.name}, `}
                                                    {item.area?.name || ""}
                                                    {item.country?.name && `, ${item.country.name}`}
                                                </p>
                                            </div>
                                        </div>

                                    </CardContent>
                                    <CardFooter className='ms-auto mt-auto'>
                                        {item.url && (
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button>
                                                    <ExternalLink />
                                                    TheSession.org
                                                </Button>
                                            </a>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}