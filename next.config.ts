import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	env: {
		apiKey: process.env.FIREBASE_apiKey,
		authDomain: process.env.FIREBASE_authDomain,
		databaseURL: process.env.FIREBASE_databaseURL,
		projectId: process.env.FIREBASE_projectId,
		storageBucket: process.env.FIREBASE_storageBucket,
		messagingSenderId: process.env.FIREBASE_messagingSenderId,
		appId: process.env.FIREBASE_appId,
		measurementId: process.env.FIREBASE_measurementId
	}
};

export default nextConfig;
