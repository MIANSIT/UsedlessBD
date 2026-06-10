import { getAdminListings, getAdminRole } from '@/app/actions/admin'
import AdminListingsTable from '@/components/admin/AdminListingsTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Listings' }

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const [listings, adminRole] = await Promise.all([getAdminListings(status), getAdminRole()])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal">Listings</h2>
        <p className="text-muted text-sm mt-1">Review, approve, and manage all listings</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'active', 'sold', 'rejected'].map((s) => (
          <a
            key={s}
            href={`?status=${s}`}
            className={`px-4 py-1.5 rounded-[6px] text-sm font-medium transition-colors capitalize ${
              (status ?? 'all') === s
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-border text-muted hover:text-charcoal hover:bg-gray-50'
            }`}
          >
            {s}
          </a>
        ))}
      </div>

      <AdminListingsTable listings={listings ?? []} adminRole={adminRole ?? ''} />
    </div>
  )
}
