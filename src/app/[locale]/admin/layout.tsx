import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import AdminSidebar from '@/components/admin/AdminSidebar'

const ADMIN_ROLES = ['admin', 'module_admin', 'super_admin']

async function getAdminFromCookie() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null
  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true)
    const userDoc = await adminDb().collection('users').doc(decoded.uid).get()
    if (!userDoc.exists) return null
    const data = userDoc.data()!
    if (!ADMIN_ROLES.includes(data.role)) return null
    return { uid: decoded.uid, name: data.name as string, role: data.role as string }
  } catch {
    return null
  }
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const admin = await getAdminFromCookie()

  if (!admin) {
    const prefix = locale === 'en' ? '' : `${locale}/`
    redirect(`/${prefix}admin-login`)
  }

  return (
    // Fixed full-screen overlay — visually replaces the locale layout Header/Footer
    <div className="fixed inset-0 z-[100] bg-snow flex overflow-hidden">
      <AdminSidebar adminName={admin.name} adminRole={admin.role} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-border flex items-center px-6 shrink-0 shadow-card">
          <h1 className="text-sm font-semibold text-charcoal">Admin Dashboard</h1>
          <span className="ml-auto text-xs text-muted">UsedLess BD — {admin.name}</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
