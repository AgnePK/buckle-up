"use client"

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FailteIrelandAttractions } from '@/api/APIcalls';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, ExternalLink, Navigation, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Head from 'next/head';
import SaveButton from '@/components/savedItems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import parade from "@/public/illustrations/parade1.png"

import { useSession } from '@/AuthContext';
import Link from 'next/link';

const PAGE_SIZE = 20;

export default function AttractionsPage() {

    const { user, redirectBasedOnAuth } = useSession()

    useEffect(() => {
        if (!user) {
            redirectBasedOnAuth("/signIn");
        }
    }, [user, redirectBasedOnAuth]);

    const [page, setPage] = useState(1);
    const [displayData, setDisplayData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Query for attractions data
    const attractionsQuery = useQuery({
        queryKey: ["FailteIrelandAttractions", page],
        queryFn: () => FailteIrelandAttractions(page, PAGE_SIZE),
    });

    useEffect(() => {
        if (attractionsQuery.data?.items) {
            setDisplayData(attractionsQuery.data.items);
        }
    }, [attractionsQuery.data]);

    // Handle search
    function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setSearchTerm(value);

        if (!value.trim()) {
            setDisplayData(attractionsQuery.data?.items || []);
            return;
        }

        const toLowCaseSearch = value.toLowerCase();

        const filteredResults = attractionsQuery.data?.items.filter((item: any) => {
            return (
                item.Name?.toLowerCase().includes(toLowCaseSearch) ||
                item.County?.toLowerCase().includes(toLowCaseSearch) ||
                item.Tags?.some((tag: string) => tag.toLowerCase().includes(toLowCaseSearch))
            );
        });

        setDisplayData(filteredResults || []);
    }

    // Handle pagination
    const nextPage = () => {
        if (attractionsQuery.data?.nextCursor) {
            setPage(attractionsQuery.data.nextCursor);
        }
    };

    const prevPage = () => {
        if (attractionsQuery.data?.prevCursor) {
            setPage(attractionsQuery.data.prevCursor);
        }
    };

    return (
        <div className="px-8 pb-8">
            <div className='md:flex flex-row justify-evenly items-center'>
                <div className='md:w-1/3 gap-6 flex flex-col'>
                    <h1 className="text-3xl font-bold ">Attractions</h1>
                    <p className='text-xl'>
                        Find below the attractions provided by <a href="https://www.failteireland.ie/" target='_blank' className='text-primary'>Fáilte Ireland</a>.
                    </p>
                    <p className='text-xl'>
                        Save the events you like, then find them in the <Link href={"/itinerary/saved"} className='text-primary' >Saved Places</Link>
                    </p>
                    <div className="mb-6">
                        <Input
                            type="text"
                            placeholder="Search Name, County or Tags..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="border-gray-300"
                        />
                    </div>
                </div>
                <Image src={parade} alt={'illustration for the attractions page'} className='md:w-1/3 ' />
            </div>

            {attractionsQuery.isLoading && (
                <div className="flex flex-col items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p>Loading... This may take a while</p>
                </div>
            )}

            {attractionsQuery.isError && (
                <div className="p-4 bg-red-100 text-destructive rounded-md">
                    Error: {attractionsQuery.error.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayData.map((item, index) => (
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
                                {item.Tags && item.Tags.map((tag: string, tagIndex: number) => (
                                    <Badge key={tagIndex} variant="outline" className='border border-secondary'>{tag}</Badge>
                                ))}
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
                            <Button variant={"outline"} className='bg-transparent'>
                                <Plus size={22} />
                            </Button>
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

            {/* Pagination Controls */}
            <div className="flex justify-center gap-8 items-center mt-8">
                <Button
                    onClick={prevPage}
                    disabled={!attractionsQuery.data?.prevCursor}
                    className="px-4 py-2 disabled:opacity-50 flex flex-row items-center"
                    variant={"ghost"}
                >
                    <ChevronLeft className='mt-1' />
                    Previous
                </Button>
                <Button disabled variant={"outline"}>{page}</Button>
                <Button
                    onClick={nextPage}
                    disabled={!attractionsQuery.data?.nextCursor}
                    className="px-4 py-2  disabled:opacity-50 flex flex-row items-center"
                    variant={"ghost"}
                >
                    Next
                    <ChevronRight className='mt-1' />
                </Button>
            </div>
        </div>
    );
}