import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost' },
      // Legacy direct-bucket URLs (kept for any existing stored URLs)
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      // Firebase Storage download-token URLs (kept for any existing stored URLs)
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      // Cloudinary CDN (new image storage)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
}

export default withNextIntl(nextConfig)
