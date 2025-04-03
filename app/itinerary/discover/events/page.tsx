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
import { Calendar, MapPin, User, Building, ExternalLink, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Head from 'next/head';
import SaveButton from '@/components/savedItems';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

import music from "@/public/illustrations/music.png"
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 21;

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
    <div className="px-8 pb-8">
      <div className='md:flex flex-row justify-evenly items-center'>
        <div className='md:w-1/3 gap-6 flex flex-col gap-6'>
          <h1 className="text-3xl font-bold ">Music Events</h1>
          <p className='text-xl text-gray-800'>
            Explore the traditional Irish Music events provided by <a href="https://thesession.org/tunes" target='_blank' className='text-primary'>The Session</a>.
          </p>
          <p className='text-xl text-gray-800'>
            Save the events you like, then find them in the Saved Places page
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
        <Image src={music} alt={'illustration for the events / music events page'} className='md:w-1/3 ' />
      </div>



      {eventsQuery.isLoading && (
        <div className="flex flex-col items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
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
            <CardFooter className='flex justify-between mt-auto'>
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
              <Button variant={"outline"} className='bg-transparent'>
                <Plus size={22} />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-8 items-center mt-8">
        <Button
          onClick={prevPage}
          disabled={!eventsQuery.data?.prevCursor}
          className="px-4 py-2 disabled:opacity-50 flex flex-row items-center"
          variant={"ghost"}
        >
          <ChevronLeft className='mt-1' />
          Previous
        </Button>
        <Button disabled variant={"outline"}>{page}</Button>
        <Button
          onClick={nextPage}
          disabled={!eventsQuery.data?.nextCursor}
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