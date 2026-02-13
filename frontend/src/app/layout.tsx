'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import '../globals.css';
import { useAuthStore } from '@/store';
import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="CarWheels.com - Discover and compare cars & bikes in India" />
        <title>CarWheels - Find Your Perfect Car</title>
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen bg-slate-950">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
