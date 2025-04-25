"use client"

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FailteIrelandBnB } from '@/api/APIcalls';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ExternalLink, Navigation, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import SaveButton from '@/components/savedItems';
import { Button } from '@/components/ui/button';
import { bnbs } from '@/utils/bnbImages';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

import bed from "@/public/illustrations/bed.png"

import { useSession } from '@/AuthContext';
import Link from 'next/link';

const PAGE_SIZE = 21;

export default function AccommodationsPage() {

    const { user, redirectBasedOnAuth } = useSession()

    useEffect(() => {
        if (!user) {
            redirectBasedOnAuth("/signIn");
        }
    }, [user, redirectBasedOnAuth]);


    const [page, setPage] = useState(1);
    const [displayData, setDisplayData] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Query for BnB data
    const accommodationQuery = useQuery({
        queryKey: ["FailteIrelandBnB", page],
        queryFn: () => FailteIrelandBnB(page, PAGE_SIZE),
    });

    useEffect(() => {
        if (accommodationQuery.data?.items) {
            setDisplayData(accommodationQuery.data.items);
        }
    }, [accommodationQuery.data]);

    // Handle search
    function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setSearchTerm(value);

        if (!value.trim()) {
            setDisplayData(accommodationQuery.data?.items || []);
            return;
        }

        const toLowCaseSearch = value.toLowerCase();

        const filteredResults = accommodationQuery.data?.items.filter((item: any) => {
            return (
                item["Account Name"]?.toLowerCase().includes(toLowCaseSearch) ||
                item["Address County"]?.toLowerCase().includes(toLowCaseSearch)
            );
        });

        setDisplayData(filteredResults || []);
    }

    // Handle pagination
    const nextPage = () => {
        if (accommodationQuery.data?.nextCursor) {
            setPage(accommodationQuery.data.nextCursor);
        }
    };

    const prevPage = () => {
        if (accommodationQuery.data?.prevCursor) {
            setPage(accommodationQuery.data.prevCursor);
        }
    };

    const getImageForIndex = (index: number) => {
        // Calculate the absolute index based on current page and page size
        const absoluteIndex = ((page - 1) * PAGE_SIZE) + index;
        // Use modulo to cycle through the images array
        const imageIndex = absoluteIndex % bnbs.length;
        return bnbs[imageIndex];
    };

    return (
        <div className="px-8 pb-8">
            <div className='md:flex flex-row justify-evenly items-center mb-2'>
                <div className='md:w-1/3 flex flex-col gap-6'>
                    <h1 className="text-3xl font-bold ">Bed and Breakfast <p className='text-sm text-gray-600'>Local Businesses</p></h1>

                    <p className='text-xl'>
                        Browse through the local BnBs provided by <a href="https://www.failteireland.ie/" target='_blank' className='text-primary'>Fáilte Ireland</a>.
                    </p>
                    <p className='text-xl'>
                        Save the events you like, then find them in the <Link href={"/itinerary/saved"} className='text-primary' >Saved Places</Link>
                    </p>
                    <div className="mb-6">
                        <Input
                            type="text"
                            placeholder="Search by Name or County..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="border-gray-300"
                        />
                    </div>
                </div>
                <Image src={bed} alt={'illustration for the bed and breadkfast discover page'} className='md:w-1/3 ' />
            </div>

            {accommodationQuery.isLoading && (
                <div className="flex flex-col items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p>Loading... This may take a while</p>
                </div>
            )}

            {accommodationQuery.isError && (
                <div className="p-4 bg-red-100 text-destructive rounded-md">
                    Error: {accommodationQuery.error.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {displayData.map((item, index) => {
                    const cardImage = getImageForIndex(index);

                    return (
                        <Card key={item["Property Reg Number"]} className="h-full pt-0 border-none">
                            <div className="relative w-full h-48 overflow-hidden">
                                <Image
                                    src={cardImage}
                                    alt={`${item["Account Name"]} accommodation`}
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
                                {item.Rating && (
                                    <Badge className="mb-4" variant="outline">{item.Rating}</Badge>
                                )}
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
                                    href={`https://www.booking.com/search.html?ss=${encodeURIComponent(item["Account Name"])}+${encodeURIComponent(item["Address County"] || "Ireland")}`}
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
                                <Button variant={"outline"} className='bg-transparent'>
                                    <Plus size={22} />
                                </Button>
                            </CardFooter>
                        </Card>

                    )
                })}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center gap-8 items-center mt-8">
                <Button
                    onClick={prevPage}
                    disabled={!accommodationQuery.data?.prevCursor}
                    className="px-4 py-2 disabled:opacity-50 flex flex-row items-center"
                    variant={"ghost"}
                >
                    <ChevronLeft className='mt-1' />
                    Previous
                </Button>
                <Button disabled variant={"outline"}>{page}</Button>
                <Button
                    onClick={nextPage}
                    disabled={!accommodationQuery.data?.nextCursor}
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