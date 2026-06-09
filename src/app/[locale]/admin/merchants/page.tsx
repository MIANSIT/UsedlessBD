import { getMerchants } from '@/app/actions/admin'
import AdminMerchantsTable from '@/components/admin/AdminMerchantsTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Merchants' }

export default async function AdminMerchantsPage() {
  const merchants = await getMerchants()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Merchants</h2>
          <p className="text-muted text-sm mt-1">Verified buyers and resellers on the platform</p>
        </div>
      </div>
      <AdminMerchantsTable merchants={merchants ?? []} />
    </div>
  )
}
