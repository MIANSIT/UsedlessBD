'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link, usePathname } from '@/lib/navigation'
import { logoutAction } from '@/app/actions/auth'

interface HeaderProps {
  locale: string
}

// The Header receives user state via a client wrapper; auth is checked server-side in pages.
export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/submit', label: t('submitScrap') },
    { href: '/dashboard', label: t('dashboard') },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" aria-label="uselessbd home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpeg" alt="uselessbd" className="h-10 w-auto" />
  <span className="text-lg font-extrabold text-primary-600">Used</span>
            <span className="text-lg font-extrabold text-gray-800">Less</span>          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side – auth links + locale switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Locale switcher */}
            <LocaleSwitcher locale={locale} />

            <AuthButtons t={t} />
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 flex items-center gap-2">
            <LocaleSwitcher locale={locale} />
            <AuthButtons t={t} />
          </div>
        </div>
      )}
    </header>
  )
}

function LocaleSwitcher({ locale }: { locale: string }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <Link
        href="/"
        locale="en"
        className={`px-2 py-1 rounded-md font-medium ${
          locale === 'en' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        EN
      </Link>
      <Link
        href="/"
        locale="bn"
        className={`px-2 py-1 rounded-md font-medium ${
          locale === 'bn' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        বাং
      </Link>
    </div>
  )
}

function AuthButtons({ t }: { t: (key: string) => string }) {
  // Lightweight client-side auth check via cookie presence
  // True auth gates are on server components/actions
  const hasCookie =
    typeof document !== 'undefined' &&
    document.cookie.split(';').some((c) => c.trim().startsWith('session='))

  if (hasCookie) {
    return (
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          {t('logout')}
        </button>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
      >
        {t('login')}
      </Link>
      <Link
        href="/register"
        className="text-sm font-semibold bg-primary-600 text-white px-4 py-1.5 rounded-xl hover:bg-primary-700 transition-colors"
      >
        {t('register')}
      </Link>
    </div>
  )
}
