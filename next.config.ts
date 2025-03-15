import type { NextConfig } from "next";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const firebaseUrlPattern = new RegExp(`^https://${process.env.NEXT_PUBLIC_FB_ID}.europe-west1.firebasedatabase.app/.*`);

const withPWA = require("next-pwa")({
	dest: "public",
	register: true,
	skipWaiting: true,
	scope: "/app",
	sw: "service-worker.js",
	disable: process.env.NODE_ENV === "development",
	runtimeCaching: [
		{
			// Cache Firebase data for offline use
			urlPattern: firebaseUrlPattern,
			handler: "NetworkFirst",
			options: {
				cacheName: "firebase-data-cache",
				expiration: {
					maxEntries: 50,
					maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
				}
			}
		},
		{
			// Google Maps resources -  limited offline capabilities
			urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/,
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "google-maps-cache",
				expiration: {
					maxEntries: 50,
					maxAgeSeconds: 3 * 24 * 60 * 60 // 1 day
				}
			}
		}
	]
});

const nextConfig: NextConfig = {
	/* config options here */
	env: {
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
		messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
		measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
	}
};

export default withPWA(nextConfig);
