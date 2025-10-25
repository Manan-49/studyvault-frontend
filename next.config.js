// next.config.js

/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  // ✅ Additional PWA config for production
  buildExcludes: [/middleware-manifest\.json$/],
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // ✅ Updated image domains
  images: {
    domains: [
      'localhost',
      'partnerships-finals-cuts-collar.trycloudflare.com',
      '82253af2cfd8.ngrok-free.app',
    ],
    unoptimized: true, // Required for static hosting
  },

  // ✅ Remove rewrites for Netlify - use direct API calls instead
  // The frontend already uses NEXT_PUBLIC_API_URL from env
  
  // ✅ Disable x-powered-by header
  poweredByHeader: false,

  // ✅ Compression
  compress: true,

  // ✅ Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
}

module.exports = withPWA(nextConfig)