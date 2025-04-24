import { useEffect, useRef, useState, useMemo } from 'react';
import { TripType, StopType } from '@/types/types';
import { loadMapsAPI, isGoogleMapsLoaded } from './loadMapsAPI';

type ItineraryMapViewProps = {
    trip: TripType;
};

type MapStyleOption = 'default' | 'earth';

const ItineraryMapView = ({ trip }: ItineraryMapViewProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isReady, setIsReady] = useState(isGoogleMapsLoaded());
    const [currentStyle, setCurrentStyle] = useState<MapStyleOption>('earth');

    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    // console.log("marker ref: ", markersRef)



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

    // Function to change map style
    // cant change mapId after rendering map
    // also cant add a toggle button to switch styles
    // useEffect(() => {
    //     if (isReady && mapRef.current) {
    //         // Clear existing markers first
    //         if (markersRef.current.length > 0) {
    //             markersRef.current.forEach(marker => marker.map = null);
    //             markersRef.current = [];
    //         }

    //         // Clear existing map instance
    //         if (map) {
    //             // Dispose of existing map (no direct method, just clear references)
    //             setMap(null);
    //         }

    //         // Create a new map with the current style
    //         try {
    //             console.log(`Creating map with style: ${currentStyle}, mapId: ${mapIds[currentStyle]}`);
    //             const mapInstance = new window.google.maps.Map(mapRef.current, {
    //                 center: { lat: 53.3498, lng: -6.2603 }, // Dublin coords
    //                 zoom: 8,
    //                 mapId: mapIds[currentStyle] // Use the map ID for the selected style
    //             });
    //             setMap(mapInstance);
    //         } catch (error) {
    //             console.error('Error initialising map:', error);
    //         }
    //     }
    // }, [isReady, currentStyle, mapIds]);

    // const mapIds = {
    //     default: '31a2878abe5bb0cc',
    //     earth: '8bfb21788aafdcfd'
    // };


    // Initialise map only once
    useEffect(() => {
        if (isReady && mapRef.current && !map) {
            try {
                const mapInstance = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 53.3498, lng: -6.2603 }, // Dublin coords
                    zoom: 8,
                    mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || undefined
                });
                setMap(mapInstance);
            } catch (error) {
                console.error('Error initialising map:', error);
            }
        }
    }, [isReady, map, currentStyle]);

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
                            <strong>
                                <a href="https://www.google.com/maps?q=${encodeURIComponent(stop.name)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                style="color: #008d5c; text-decoration: none;"
                                >
                                    ${stop.name}
                                </a>
                            </strong>                        
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


    // Function to change map style - trigger map rerendering
    // const changeMapStyle = (newStyle: MapStyleOption) => {
    //     if (newStyle !== currentStyle) {
    //         console.log(`Changing style from ${currentStyle} to ${newStyle}`);
    //         setCurrentStyle(newStyle);
    //     }
    // };

    // If there are no locations, don't render the map
    if (!hasLocations) {
        return (
            <div className="bg-slate-50 p-4 rounded-lg my-6 text-center">
                <p>No location data available for this itinerary.</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg">

            {/* <div className="flex items-center space-x-4">
                <div className="flex items-center">
                    <input
                        type="radio"
                        id="style-default"
                        name="mapStyle"
                        value="default"
                        checked={currentStyle === 'default'}
                            onChange={() => changeMapStyle('default')}
                        className="mr-2"
                    />
                    <label htmlFor="style-default">Default</label>
                </div>

                <div className="flex items-center">
                    <input
                        type="radio"
                        id="style-earth"
                        name="mapStyle"
                        value="earth"
                        checked={currentStyle === 'earth'}
                        onChange={() => changeMapStyle('earth')}
                        className="mr-2"
                    />
                    <label htmlFor="style-earth">Earth</label>
                </div>
            </div> */}

            <div className="relative">
                <div
                    ref={mapRef}
                    className="w-full rounded-xl h-80 md:h-screen"
                />
            </div>
        </div>
    );
};

export default ItineraryMapView;