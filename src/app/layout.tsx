// src/app/layout.tsx

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'
import { Preloader } from '@/components/layout/preloader'
import { Suspense } from 'react'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'StudyVault - Smart Study Material Management',
  description: 'Upload, organize, and search study materials with AI-powered OCR. Your academic life, organized.',
  applicationName: 'StudyVault',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StudyVault',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'StudyVault',
    title: 'StudyVault - Smart Study Material Management',
    description: 'Upload, organize, and search study materials with AI-powered OCR',
  },
  twitter: {
    card: 'summary',
    title: 'StudyVault - Smart Study Material Management',
    description: 'Upload, organize, and search study materials with AI-powered OCR',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3B82F6' },
    { media: '(prefers-color-scheme: dark)', color: '#1E40AF' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="StudyVault" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StudyVault" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="72x72" href="/icon-72.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icon-96.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icon-144.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-72.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-72.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <Suspense fallback={null}>
            <Preloader />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  )
}