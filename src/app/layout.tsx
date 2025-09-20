import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { initializeDatabase } from '@/lib/database/database';
import { seedInitialData } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Kiki 🦀',
  description: 'Effortless Attendance Management',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await initializeDatabase();
  await seedInitialData(); // Call seedInitialData after database initialization
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}