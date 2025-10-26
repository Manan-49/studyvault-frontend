// src/lib/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={['light', 'dark', 'amoled', 'night']}
      storageKey="studyvault-theme"
      disableTransitionOnChange={false}
    >
      {children}
      <Toaster />
    </ThemeProvider>
  )
}