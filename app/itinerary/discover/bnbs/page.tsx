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
import { MapPin } from 'lucide-react';
import Head from 'next/head';

const PAGE_SIZE = 20;

export default function AccommodationsPage() {
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

    return (
        <div className="container mx-auto px-4 py-8">
            <Head>
                <title>Accommodations | Irish Travel Guide</title>
                <meta name="description" content="Browse accommodations in Ireland" />
            </Head>

            <h1 className="text-3xl font-bold mb-6">Accommodations</h1>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search accommodations..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            {accommodationQuery.isLoading && (
                <div className="flex flex-col items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p>Loading... This may take a while</p>
                </div>
            )}

            {accommodationQuery.isError && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    Error: {accommodationQuery.error.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayData.map((item) => (
                    <Card key={item["Property Reg Number"]} className="h-full">
                        <CardHeader>
                            <CardTitle>{item["Account Name"]}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center">
                                <MapPin className="h-5 w-5 text-emerald-700 mr-2" />
                                <p>{item["Address Line 1"]}, {item["Address County"]}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Badge variant="outline">{item.Sector}</Badge>
                            {item.Rating && (
                                <Badge className="ml-2" variant="secondary">{item.Rating}</Badge>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={prevPage}
                    disabled={!accommodationQuery.data?.prevCursor}
                    className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
                >
                    Previous
                </button>
                <span>Page {page}</span>
                <button
                    onClick={nextPage}
                    disabled={!accommodationQuery.data?.nextCursor}
                    className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}