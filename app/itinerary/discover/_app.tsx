import type { AppProps } from 'next/app';
import { QueryClientProvider } from '@/components/QueryProvider';
import Link from 'next/link';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider>
      <div className="min-h-screen flex flex-col">
        <header className="bg-slate-800 text-white py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">Irish Travel Guide</Link>
            <nav className="flex space-x-6">
              <Link href="/accommodations" className="hover:text-blue-300">Accommodations</Link>
              <Link href="/attractions" className="hover:text-blue-300">Attractions</Link>
              <Link href="/events" className="hover:text-blue-300">Events</Link>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        
        <footer className="bg-slate-800 text-white py-4 mt-8">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; {new Date().getFullYear()} Irish Travel Guide</p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}