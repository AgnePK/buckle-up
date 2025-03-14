export const isGoogleMapsLoaded = (): boolean => {
	return (
		typeof window !== "undefined" &&
		window.google !== undefined &&
		window.google.maps !== undefined
	);
};

let loadPromise: Promise<void> | null = null;

export const loadMapsAPI = (): Promise<void> => {

	// return existing promise if its already loading
	if (loadPromise) return loadPromise;

	// return immediately if already loaded
	if (isGoogleMapsLoaded()) {
		return Promise.resolve();
	}

	loadPromise = new Promise((resolve, reject) => {

		// script element
		const script = document.createElement("script");
		script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker`;
		script.async = true;
		script.defer = true;
		script.id = "google-maps-script";

		// loading events
		script.onload = () => resolve();
		script.onerror = () => {
			loadPromise = null;
			reject(new Error("Google Maps API failed to load"));
		};

		document.head.appendChild(script);
	});

	return loadPromise;
};
