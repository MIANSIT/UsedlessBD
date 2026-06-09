import { NextRequest, NextResponse } from 'next/server'

const SELLER_ROUTES = ['/submit', '/my-listings', '/profile']
const ADMIN_ROUTES = ['/admin']

function isProtectedRoute(pathname: string): 'seller' | 'admin' | null {
  const clean = pathname.replace(/^\/(en|bn)/, '') || '/'
  if (ADMIN_ROUTES.some((r) => clean === r || clean.startsWith(r + '/'))) return 'admin'
  if (SELLER_ROUTES.some((r) => clean === r || clean.startsWith(r + '/'))) return 'seller'
  return null
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const routeType = isProtectedRoute(pathname)
  if (!routeType) return NextResponse.next()

  const sessionCookie = req.cookies.get('session')?.value
  if (!sessionCookie) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo|public|api).*)',
  ],
}
