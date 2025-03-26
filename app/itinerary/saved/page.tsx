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
    BookmarkX
} from 'lucide-react';
import SaveButton from '@/components/savedItems';
import { useRouter } from 'next/navigation';
import { Attractions, Accommodation, Events } from '@/types/types';

// Type for our saved items
interface SavedItemsState {
    attractions: Attractions[];
    accommodations: Accommodation[];
    events: Events[];
}

export default function SavedItemsPage() {
    const { user, isLoading: authLoading } = useSession();
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
            router.push('/signIn');
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
            <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading your saved items...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">My Saved Items</h1>
            <p className="text-muted-foreground mb-6">Places and events you've saved for your trip</p>

            <Tabs defaultValue="attractions" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-3">
                    <TabsTrigger value="attractions">
                        Attractions ({savedItems.attractions.length})
                    </TabsTrigger>
                    <TabsTrigger value="accommodations">
                        Accommodations ({savedItems.accommodations.length})
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
                            {savedItems.attractions.map((item) => (
                                <Card key={item.id} className="h-full">
                                    <CardHeader className='flex-row justify-between content-center'>
                                        <div>
                                            <CardTitle>{item.Name}</CardTitle>
                                            {item.County && (
                                                <CardDescription>{item.County}</CardDescription>
                                            )}
                                        </div>
                                        <div>{<SaveButton item={item} itemType="attraction" />}</div>

                                    </CardHeader>
                                    <CardContent>
                                        {item.Address && (
                                            <div className="flex items-center mb-4">
                                                <MapPin className="h-5 w-5 text-emerald-700 mr-2" />
                                                <p>{item.Address}</p>
                                            </div>
                                        )}

                                        {item.Telephone && (
                                            <div className="flex items-center mb-4">
                                                <Phone className="h-5 w-5 text-emerald-700 mr-2" />
                                                <p>{item.Telephone}</p>
                                            </div>
                                        )}

                                        {item.Url && (
                                            <a
                                                href={item.Url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline text-sm flex items-center mb-4"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" /> Visit Website
                                            </a>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center">
                                        <div className="flex flex-wrap gap-2 max-w-[70%]">
                                            {item.Tags && Array.isArray(item.Tags) && item.Tags.slice(0, 2).map((tag: string, i: number) => (
                                                <Badge key={i} variant="outline">{tag}</Badge>
                                            ))}
                                            {item.Tags && !Array.isArray(item.Tags) && typeof item.Tags === 'string' && (
                                                <Badge variant="outline">{item.Tags}</Badge>
                                            )}
                                        </div>
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
                            <h3 className="text-lg font-medium mb-2">No saved accommodations</h3>
                            <p className="text-slate-600">You haven't saved any accommodations yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedItems.accommodations.map((item) => (
                                <Card key={item.id} className="h-full">
                                    <CardHeader className='flex-row justify-between content-center'>
                                        <div>
                                            <CardTitle>{item["Account Name"] || 'Unnamed Accommodation'}</CardTitle>
                                            {item["Address County"] && (
                                                <CardDescription>{item["Address County"]}</CardDescription>
                                            )}
                                        </div>
                                        <div>{<SaveButton item={item} itemType="accommodation" />}</div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-start mb-4">
                                            <MapPin className="h-5 w-5 text-emerald-700 mr-2 mt-1" />
                                            <div>
                                                <p className="font-medium">Address</p>
                                                <p className="text-sm">
                                                    {item["Address Line 1"] ? `${item["Address Line 1"]}, ` : ''}
                                                    {item["Address County"] || 'Location unavailable'}
                                                </p>
                                            </div>
                                        </div>

                                        {item["Eircode/Postal code"] && (
                                            <div className="flex items-start mb-4">
                                                <div className="h-5 w-5 mr-2"></div> {/* Spacer for alignment */}
                                                <p className="text-sm">
                                                    <span className="font-medium">Eircode:</span> {item["Eircode/Postal code"]}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center">
                                        <Badge variant="outline">{item.Sector || 'Accommodation'}</Badge>
                                    </CardFooter>
                                </Card>
                            ))}
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
                                        <div>
                                            <CardTitle>{item.name}</CardTitle>
                                            {item.member && (
                                                <CardDescription>
                                                    Organized by {item.member.name}
                                                </CardDescription>
                                            )}
                                        </div>
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

                                        {item.venue && (
                                            <div className="flex items-start">
                                                <Building className="h-5 w-5 mr-2 text-primary shrink-0 mt-1" />
                                                <div>
                                                    <p className="font-medium">Venue</p>
                                                    <p className="text-sm">{item.venue.name || "Unknown Venue"}</p>
                                                    {item.venue.web && (
                                                        <a
                                                            href={item.venue.web}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline text-xs flex items-center"
                                                        >
                                                            <ExternalLink className="h-3 w-3 mr-1" /> Venue website
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}

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
                                    <CardFooter className="flex justify-between items-center">
                                        {item.url ? (
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" /> View Details
                                            </a>
                                        ) : (
                                            <span></span>
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