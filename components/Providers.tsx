'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={15 * 60} refetchOnWindowFocus>
      {children}
    </SessionProvider>
  );
}
