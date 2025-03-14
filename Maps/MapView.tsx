import { useEffect, useRef, useState } from 'react';
import { DayType, StopType } from '@/types/types';
import { loadMapsAPI, isGoogleMapsLoaded } from './loadMapsAPI';

type MapViewProps = {
  day: number;
  dayData: DayType;
};

const MapView = ({ day, dayData }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isReady, setIsReady] = useState(isGoogleMapsLoaded());

  // Load Google Maps API
  useEffect(() => {
    if (!isReady) {
      loadMapsAPI().then(() => setIsReady(true));
    }
  }, [isReady]);

  // Initialize map
  useEffect(() => {
    if (isReady && mapRef.current && !map) {
      try {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 53.3498, lng: -6.2603 }, // Dublin, Ireland
          zoom: 8,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || undefined,
        });
        setMap(mapInstance);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }, [isReady, map]);

  // Update markers when stops change
  useEffect(() => {
    if (!map || !isReady) return;

    // Clear existing markers
    markers.forEach(marker => marker.map = null);

    // Collect all stops with location data
    const allStops: StopType[] = [];

    // Helper function to safely add stops
    const addStopsFromPeriod = (period: StopType[] | undefined) => {
      if (period && Array.isArray(period)) {
        period.filter(stop => stop.location).forEach(stop => allStops.push(stop));
      }
    };

    // Safely get stops from each time period
    addStopsFromPeriod(dayData.morning);
    addStopsFromPeriod(dayData.afternoon);
    addStopsFromPeriod(dayData.evening);

    console.log(`Day ${day} - Found ${allStops.length} stops with locations:`, allStops);

    if (allStops.length === 0) return;

    try {
      // Create new markers using standard marker.AdvancedMarkerElement API
      const newMarkers = allStops.map((stop, index) => {
        if (!stop.location) return null;

        // Create marker
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: stop.location,
          map: map,
          title: stop.name
        });
      
        // Add info window to show details when clicked
        const infoWindow = new google.maps.InfoWindow({
          content: `<div><strong>${stop.name}</strong>${stop.time ? `<br>Time: ${stop.time}` : ''}</div>`
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        return marker;
      }).filter(Boolean) as google.maps.marker.AdvancedMarkerElement[];

      setMarkers(newMarkers);

      // Fit bounds to show all markers
      if (newMarkers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          if (marker.position) {
            bounds.extend(marker.position);
          }
        });
        map.fitBounds(bounds);

        // Ensure reasonable zoom level
        google.maps.event.addListenerOnce(map, 'idle', () => {
          if (map.getZoom()! > 15) map.setZoom(15);
        });
      }
    } catch (error) {
      console.error('Error creating markers:', error);
    }
  }, [map, isReady, dayData, day, markers]);

  return (
    <div
      ref={mapRef}
      className="h-64 w-full rounded-lg border"
      style={{ minHeight: "250px" }}
    />
  );
};

export default MapView;