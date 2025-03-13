import type { NextConfig } from "next";

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  scope: '/app',
  sw: 'service-worker.js',
  disable: process.env.NODE_ENV === 'development',
});


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

export default withPWA(nextConfig);
