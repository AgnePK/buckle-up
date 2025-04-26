import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
// AuthProvider
import { SessionProvider } from "@/AuthContext"

import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';


const monts = Montserrat({
  subsets: ['latin'],
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Buckle Up",
  description: "An Itinerary management app built in NextJs",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Buckle Up'
  }
};

export default function RootLayout({ children, }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${monts.className} antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#19784d" />
        <link rel="logo" href="/icon-192.png" />
      </head>
      <body
      // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ServiceWorkerRegister />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
