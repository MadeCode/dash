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
  title: {
    default: 'MiniDash',
    template: '%s | MiniDash',
  },
  applicationName: 'MiniDash',
  description:
    "MiniDash is a distraction-free personal dashboard that helps you view today's Google Calendar schedule and manage your MiniDash Google Tasks list in one focused workspace.",
  openGraph: {
    title: 'MiniDash',
    siteName: 'MiniDash',
    description:
      "MiniDash is a distraction-free personal dashboard for today's Google Calendar schedule and your MiniDash Google Tasks list.",
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'MiniDash',
    description:
      "MiniDash is a distraction-free personal dashboard for today's Google Calendar schedule and your MiniDash Google Tasks list.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MiniDash',
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
