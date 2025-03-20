import { useEffect, useRef, useState } from 'react';
import { loadMapsAPI, isGoogleMapsLoaded } from '@/Maps/loadMapsAPI';

type PlacesAutocompleteProps = {
    value: string;
    onChange: (value: string) => void;
    onPlaceSelect: (placeData: any) => void;
    placeholder?: string;
};

const PlacesAutocomplete = ({
    value,
    onChange,
    onPlaceSelect,
    placeholder = "Search places..."
}: PlacesAutocompleteProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded());


    useEffect(() => {
        if (inputRef.current && value !== undefined && value !== null) {
            inputRef.current.value = value;
        }
    }, [value]);

    // Load Google Maps API
    useEffect(() => {
        if (!isLoaded) {
            loadMapsAPI().then(() => {
                console.log("PlacesAutocomplete: Maps API loaded successfully");
                setIsLoaded(true);
            }).catch(err => {
                console.error("PlacesAutocomplete: Failed to load Maps API", err);
            });
        }
    }, [isLoaded]);

    // Initialise autocomplete
    useEffect(() => {
        if (!isLoaded || !inputRef.current) return;

        console.log("PlacesAutocomplete: initialising autocomplete");
        try {
            const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
                fields: ['formatted_address', 'geometry', 'name', 'place_id'],
                componentRestrictions: { country: 'ie' },
            });

            autocomplete.addListener('place_changed', () => {

                const place = autocomplete.getPlace();
                console.log("Selected place:", place);

                if (place && place.geometry && place.geometry.location) {
                    const placeData = {
                        name: place.name,
                        address: place.formatted_address,
                        location: {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng()
                        },
                        placeId: place.place_id
                    };

                    if (onChange) {
                        onChange(place.name || '');
                    }

                    console.log("Formatted place data:", placeData);
                    onPlaceSelect(placeData);
                } else {
                    console.warn("Place selection didn't have proper location data");
                }
            });

            console.log("PlacesAutocomplete: Autocomplete initialised successfully");
        } catch (error) {
            console.error("Error initialising autocomplete:", error);
        }
    }, [isLoaded, onPlaceSelect]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    return (
        <div>
            <input
                ref={inputRef}
                type="text"
                defaultValue={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="w-full p-2 border rounded"
            />
            {/* <div className="text-xs mt-1">Google Maps API status: {isLoaded ? 'Loaded' : 'Loading...'}</div> */}
        </div>
    );
};

export default PlacesAutocomplete;