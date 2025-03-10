import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Building, Map, Music } from 'lucide-react';

export default function DiscoverHome() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Head>
        <title>Irish Travel Guide</title>
        <meta name="description" content="Discover accommodations, attractions, and events in Ireland" />
      </Head>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Irish Travel Guide</h1>
        <p className="text-xl text-gray-600">Discover places to stay, things to do, and events to attend.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <Link href="/itinerary/discover/bnbs" className="block group">
          <div className="border rounded-lg p-6 h-full hover:shadow-lg transition-shadow flex flex-col items-center text-center">
            <Building className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-semibold mb-2">Accommodations</h2>
            <p className="text-gray-600">Find B&Bs and places to stay across Ireland.</p>
          </div>
        </Link>
        
        <Link href="/itinerary/discover/attractions" className="block group">
          <div className="border rounded-lg p-6 h-full hover:shadow-lg transition-shadow flex flex-col items-center text-center">
            <Map className="w-12 h-12 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-semibold mb-2">Attractions</h2>
            <p className="text-gray-600">Discover interesting places and things to do.</p>
          </div>
        </Link>
        
        <Link href="/itinerary/discover/events" className="block group">
          <div className="border rounded-lg p-6 h-full hover:shadow-lg transition-shadow flex flex-col items-center text-center">
            <Music className="w-12 h-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-semibold mb-2">Music Events</h2>
            <p className="text-gray-600">Find traditional Irish music sessions and events.</p>
          </div>
        </Link>
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-gray-500">Data provided by Fáilte Ireland and TheSession.org</p>
      </div>
    </div>
  );
}