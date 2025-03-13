import type { NextConfig } from "next";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const withPWA = require("next-pwa")({
	dest: "public",
	register: true,
	skipWaiting: true,
	scope: "/app",
	sw: "service-worker.js",
	disable: process.env.NODE_ENV === "development"
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
