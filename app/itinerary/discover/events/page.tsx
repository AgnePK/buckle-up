"use client"
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TheSessionEvents } from '@/api/APIcalls';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, MapPin, User, Building } from 'lucide-react';
import Head from 'next/head';

const PAGE_SIZE = 20;

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Query for events data
  const eventsQuery = useQuery({
    queryKey: ["TheSessionEvents", page],
    queryFn: () => TheSessionEvents(page, PAGE_SIZE),
  });

  useEffect(() => {
    if (eventsQuery.data?.items) {
      setDisplayData(eventsQuery.data.items);
    }
  }, [eventsQuery.data]);

  // Handle search
  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      setDisplayData(eventsQuery.data?.items || []);
      return;
    }

    const toLowCaseSearch = value.toLowerCase();

    const filteredResults = eventsQuery.data?.items.filter((item: any) => {
      return (
        item.name?.toLowerCase().includes(toLowCaseSearch) ||
        item.area?.name?.toLowerCase().includes(toLowCaseSearch) ||
        item.member?.name?.toLowerCase().includes(toLowCaseSearch) ||
        item.venue?.name?.toLowerCase().includes(toLowCaseSearch)
      );
    });

    setDisplayData(filteredResults || []);
  }

  // Format date function
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

  // Handle pagination
  const nextPage = () => {
    if (eventsQuery.data?.nextCursor) {
      setPage(eventsQuery.data.nextCursor);
    }
  };

  const prevPage = () => {
    if (eventsQuery.data?.prevCursor) {
      setPage(eventsQuery.data.prevCursor);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Music Events | Irish Travel Guide</title>
        <meta name="description" content="Irish music events and gatherings" />
      </Head>

      <h1 className="text-3xl font-bold mb-6">Music Events</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search events, venues, or locations..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {eventsQuery.isLoading && (
        <div className="flex flex-col items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
          <p>Loading... This may take a while</p>
        </div>
      )}

      {eventsQuery.isError && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          Error: {eventsQuery.error.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayData.map((item) => (
          <Card key={item.id} className="h-full">
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-2 text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Event Date</p>
                  <p className="text-sm">{formatDate(item.dtstart)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Building className="h-5 w-5 mr-2 text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Venue</p>
                  <p className="text-sm">{item.venue?.name || "Unknown Venue"}</p>
                  {item.venue?.web && (
                    <a
                      href={item.venue.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Venue website
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm">
                    {item.town?.name && `${item.town.name}, `}
                    {item.area?.name || ""}
                    {item.country?.name && `, ${item.country.name}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <User className="h-5 w-5 mr-2 text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Listed by</p>
                  <p className="text-sm">{item.member?.name || "Unknown"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on TheSession.org
                </a>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={prevPage}
          disabled={!eventsQuery.data?.prevCursor}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={nextPage}
          disabled={!eventsQuery.data?.nextCursor}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}