import React from 'react';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';
import { TripType, StopType } from '@/types/types';

type OpenInGoogleMapsProps = {
  trip: TripType;
};

const OpenInGoogleMaps: React.FC<OpenInGoogleMapsProps> = ({ trip }) => {
  // Check if there are any stops with location data
  const hasLocations = Object.values(trip.days || {}).some(day => {
    return ['morning', 'afternoon', 'evening'].some(period => {
      const stops = day[period as keyof typeof day];
      return stops && Array.isArray(stops) && 
        stops.some(stop => stop.location !== undefined);
    });
  });

  if (!hasLocations) {
    return null; // Don't show the button if there are no locations
  }

  const openInGoogleMaps = () => {
    // Detect if on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Show a brief notification to the user
    if (isMobile) {
      alert("Opening Google Maps app with your itinerary stops...");
    } else {
      alert("Opening Google Maps in a new tab with your itinerary stops...");
    }
    
    // Collect all stops with location data
    const stopsWithLocation: Array<StopType & { day: number; period: string }> = [];
    
    Object.entries(trip.days).forEach(([dayNumber, dayData]) => {
      const day = parseInt(dayNumber);
      
      ['morning', 'afternoon', 'evening'].forEach(period => {
        const stops = dayData[period as keyof typeof dayData];
        if (stops && Array.isArray(stops)) {
          stops.filter(stop => stop.location).forEach(stop => {
            stopsWithLocation.push({
              ...stop,
              day,
              period
            });
          });
        }
      });
    });

    if (stopsWithLocation.length === 0) {
      alert("No location data found to open in Google Maps");
      return;
    }

    // Sort by day and then by period (morning, afternoon, evening)
    stopsWithLocation.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      
      const periodOrder = { morning: 0, afternoon: 1, evening: 2 };
      return periodOrder[a.period as keyof typeof periodOrder] - 
             periodOrder[b.period as keyof typeof periodOrder];
    });

    // Create Google Maps URL with waypoints
    let mapUrl = "https://www.google.com/maps/dir/?api=1";
    
    // If there's only one location, open it as a destination
    if (stopsWithLocation.length === 1) {
      const stop = stopsWithLocation[0];
      mapUrl += `&destination=${stop.location?.lat},${stop.location?.lng}`;
      
      // Add destination name if available
      if (stop.name) {
        mapUrl += `&destination_place_id=${encodeURIComponent(stop.placeId || '')}`;
      }
    } 
    // If there are multiple locations, use the first as origin and last as destination
    else if (stopsWithLocation.length > 1) {
      const origin = stopsWithLocation[0];
      const destination = stopsWithLocation[stopsWithLocation.length - 1];
      
      mapUrl += `&origin=${origin.location?.lat},${origin.location?.lng}`;
      mapUrl += `&destination=${destination.location?.lat},${destination.location?.lng}`;
      
      // Add place IDs if available for better location accuracy
      if (origin.placeId) {
        mapUrl += `&origin_place_id=${encodeURIComponent(origin.placeId)}`;
      }
      
      if (destination.placeId) {
        mapUrl += `&destination_place_id=${encodeURIComponent(destination.placeId)}`;
      }
      
      // Add waypoints (Google Maps limit is 10 waypoints in free version)
      if (stopsWithLocation.length > 2) {
        const waypoints = stopsWithLocation.slice(1, -1)
          .slice(0, 8) // Limiting to 8 waypoints (plus origin and destination makes 10 total)
          .map(stop => `${stop.location?.lat},${stop.location?.lng}`)
          .join('|');
        
        mapUrl += `&waypoints=${encodeURIComponent(waypoints)}`;
      }
    }

    // Open the URL in a new tab
    window.open(mapUrl, '_blank');
  };

  // Detect if on mobile
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  return (
    <Button 
      onClick={openInGoogleMaps} 
      className="md:fixed md:bottom-4  flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
      variant="outline"
    >
      <Map className="h-4 w-4" /> 
      {isMobile ? 'Navigate in Google Maps' : 'Open in Google Maps'}
    </Button>
  );
};

export default OpenInGoogleMaps;
