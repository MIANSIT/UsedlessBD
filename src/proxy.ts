import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const SELLER_PATHS = ['/submit', '/my-listings', '/profile']
const ADMIN_PATHS  = ['/admin']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API and static assets
  if (pathname.startsWith('/api') || pathname.startsWith('/media')) {
    return NextResponse.next()
  }

  // Strip locale prefix to get the canonical path
  const locales = routing.locales as readonly string[]
  const localePrefix = locales.find(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`,
  )
  const pathWithoutLocale = localePrefix
    ? pathname.slice(localePrefix.length + 1) || '/'
    : pathname

  const isSellerRoute = SELLER_PATHS.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`),
  )
  const isAdminRoute = ADMIN_PATHS.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`),
  )

  if (isSellerRoute || isAdminRoute) {
    const sessionCookie = request.cookies.get('session')
    if (!sessionCookie) {
      const locale = localePrefix ?? routing.defaultLocale
      const loginPath = locale === routing.defaultLocale ? '/login' : `/${locale}/login`
      const loginUrl = new URL(loginPath, request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
