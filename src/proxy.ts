import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Routes that require authentication (matched AFTER stripping locale)
const PROTECTED_PATHS = ['/dashboard', '/submit']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Skip API and static asset routes ──────────────────────────────
  if (pathname.startsWith('/api') || pathname.startsWith('/media')) {
    return NextResponse.next()
  }

  // ── Extract locale from URL (e.g. /bn/dashboard → /dashboard) ───
  const locales = routing.locales as readonly string[]
  const localePrefix = locales.find(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`,
  )
  const pathWithoutLocale = localePrefix
    ? pathname.slice(localePrefix.length + 1) || '/'
    : pathname

  // ── Auth guard for protected routes ──────────────────────────────
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`),
  )

  if (isProtected) {
    const token = request.cookies.get('session')
    if (!token) {
      const locale = localePrefix ?? routing.defaultLocale
      const loginPath = locale === routing.defaultLocale ? '/login' : `/${locale}/login`
      const loginUrl = new URL(loginPath, request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── Apply next-intl locale routing ───────────────────────────────
  return intlMiddleware(request)
}

export const config = {
  // Match all paths except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
