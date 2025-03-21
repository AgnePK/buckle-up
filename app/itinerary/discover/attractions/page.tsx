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
import { MapPin } from 'lucide-react';
import Head from 'next/head';

const PAGE_SIZE = 20;

export default function AttractionsPage() {
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
        <div className="container mx-auto px-4 py-8">
            <Head>
                <title>Attractions | Irish Travel Guide</title>
                <meta name="description" content="Discover attractions in Ireland" />
            </Head>

            <h1 className="text-3xl font-bold mb-6">Attractions</h1>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search attractions or tags..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            {attractionsQuery.isLoading && (
                <div className="flex flex-col items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p>Loading... This may take a while</p>
                </div>
            )}

            {attractionsQuery.isError && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    Error: {attractionsQuery.error.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayData.map((item, index) => (
                    <Card key={item.id || `attraction-${index}`} className="h-full">
                        <CardHeader>
                            <CardTitle>{item.Name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center mb-4">
                                <MapPin className="h-5 w-5 text-emerald-700 mr-2" />
                                <p>{item.Address || item.County}</p>
                            </div>

                            {item.Telephone && (
                                <p className="text-sm text-gray-600 mb-2">Tel: {item.Telephone}</p>
                            )}

                            {item.Url && (
                                <a
                                    href={item.Url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm block mb-4"
                                >
                                    Visit Website
                                </a>
                            )}
                        </CardContent>
                        <CardFooter>
                            <div className="flex flex-wrap gap-2">
                                {item.Tags && item.Tags.map((tag: string, tagIndex: number) => (
                                    <Badge key={tagIndex} variant="outline">{tag}</Badge>
                                ))}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={prevPage}
                    disabled={!attractionsQuery.data?.prevCursor}
                    className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
                >
                    Previous
                </button>
                <span>Page {page}</span>
                <button
                    onClick={nextPage}
                    disabled={!attractionsQuery.data?.nextCursor}
                    className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}