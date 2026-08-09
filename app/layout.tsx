import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mini Desk Dashboard',
  description: 'Lightweight, distraction-free landscape productivity dashboard for desk displays',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mini Dash',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#fafaf9',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full overflow-hidden">
      <body className={`${inter.variable} antialiased h-screen w-screen overflow-hidden bg-stone-50 text-stone-800 flex relative selection:bg-stone-200 font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
