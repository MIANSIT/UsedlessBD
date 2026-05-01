import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: {
    template: '%s | uselessbd',
    default: 'uselessbd – Buy & Sell Secondhand in Bangladesh',
  },
  description:
    "Bangladesh's marketplace for unused and pre-loved items. Turn your clutter into cash or score great deals on quality secondhand stuff. List in 2 minutes. বিক্রি করুন, কিনুন, সাশ্রয় করুন।",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  keywords: [
    'uselessbd',
    'secondhand bangladesh',
    'used items bangladesh',
    'buy sell used',
    'পুরনো জিনিস বিক্রি',
    'সেকেন্ডহ্যান্ড বাংলাদেশ',
    'pre-loved bangladesh',
    'unused items dhaka',
  ],
  openGraph: {
    siteName: 'uselessbd',
    locale: 'en_BD',
    type: 'website',
    title: 'uselessbd – Buy & Sell Secondhand in Bangladesh',
    description:
      "Your useless = someone's useful. Bangladesh's premier secondhand marketplace.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'uselessbd – Buy & Sell Secondhand in Bangladesh',
    description: "Your useless = someone's useful. List in 2 minutes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale} className={`h-full ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-snow font-sans">{children}</body>
    </html>
  )
}
