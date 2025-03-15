import { useEffect, useRef, useState, useMemo } from 'react';
import { TripType, StopType } from '@/types/types';
import { loadMapsAPI, isGoogleMapsLoaded } from './loadMapsAPI';

type ItineraryMapViewProps = {
    trip: TripType;
};

const ItineraryMapView = ({ trip }: ItineraryMapViewProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isReady, setIsReady] = useState(isGoogleMapsLoaded());

    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    console.log("marker ref: ", markersRef)

    // using a ref to track markers instead of state to avoid re-render cycles
    const hasLocations = useMemo(() => {
        return Object.values(trip.days || {}).some(day => {
            return ['morning', 'afternoon', 'evening'].some(period => {  // Added "return" here
                const stops = day[period as keyof typeof day];
                return stops && Array.isArray(stops) &&
                    stops.some(stop => stop.location !== undefined);
            });
        });
    }, [trip.days]);


    // Load Google Maps API
    useEffect(() => {
        if (!isReady) {
            loadMapsAPI().then(() => setIsReady(true));
        }
    }, [isReady]);

    // Initialise map only once
    useEffect(() => {
        if (isReady && mapRef.current && !map) {
            try {
                const mapInstance = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 53.3498, lng: -6.2603 }, // Dublin coords
                    zoom: 8,
                    mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || undefined,
                });
                setMap(mapInstance);
            } catch (error) {
                console.error('Error initializing map:', error);
            }
        }
    }, [isReady, map]);

    // Update markers when trip changes
    useEffect(() => {
        if (!map || !isReady || !hasLocations) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.map = null);
        markersRef.current = [];

        // Collect all stops with location data
        const allStops: Array<StopType & { day: number; period: string }> = [];

        // Loop through all days and periods to collect stops with locations
        Object.entries(trip.days).forEach(([dayNumber, dayData]) => {
            const day = parseInt(dayNumber);

            ['morning', 'afternoon', 'evening'].forEach(period => {
                const stops = dayData[period as keyof typeof dayData];
                if (stops && Array.isArray(stops)) {
                    stops.filter(stop => stop.location).forEach(stop => {
                        allStops.push({
                            ...stop,
                            day,
                            period
                        });
                    });
                }
            });
        });

        console.log(`Found ${allStops.length} stops with locations:`, allStops);

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
                    content:
                        `
                        <div>
                        <strong>${stop.name}</strong>
                        <br>Day ${stop.day}, ${stop.period}
                        ${stop.time ? `<br>Time: ${stop.time}` : ''}
                        ${stop.notes ? `<br>Notes: ${stop.notes}` : ''}
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });

                return marker;
            }).filter(Boolean) as google.maps.marker.AdvancedMarkerElement[];

            markersRef.current = newMarkers;

            // Fit bounds to show all markers on the map itself
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
    }, [map, isReady, trip, hasLocations]);

    // If there are no locations, don't render the map
    if (!hasLocations) {
        return (
            <div className="bg-slate-50 p-4 rounded-lg my-6 text-center">
                <p>No location data available for this itinerary.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm my-6">
            <h2 className="text-xl font-semibold p-4 border-b">Itinerary Map</h2>
            <div
                ref={mapRef}
                className="w-full rounded-b-lg"
                style={{ height: "400px" }}
            />
        </div>
    );
};

export default ItineraryMapView;