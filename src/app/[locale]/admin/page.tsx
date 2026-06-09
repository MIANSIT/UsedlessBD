import { getAdminStats, getAuditLogs } from '@/app/actions/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Overview' }

function StatCard({
  label, value, sub, color,
}: {
  label: string; value: number | string; sub?: string; color: string
}) {
  return (
    <div className={`bg-white rounded-[8px] border border-border shadow-card p-5`}>
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  )
}

export default async function AdminOverviewPage() {
  const [stats, logs] = await Promise.all([getAdminStats(), getAuditLogs(20)])

  if (!stats) {
    return <p className="text-muted">Unable to load stats.</p>
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-charcoal">Overview</h2>
        <p className="text-muted text-sm mt-1">Real-time platform summary</p>
      </div>

      {/* Listings stats */}
      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-3 uppercase tracking-wide">Listings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total"    value={stats.listings.total}    color="text-charcoal" />
          <StatCard label="Pending"  value={stats.listings.pending}  color="text-yellow-600" />
          <StatCard label="Active"   value={stats.listings.active}   color="text-primary-600" />
          <StatCard label="Sold"     value={stats.listings.sold}     color="text-secondary-600" />
          <StatCard label="Rejected" value={stats.listings.rejected} color="text-danger" />
        </div>
      </div>

      {/* Platform stats */}
      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-3 uppercase tracking-wide">Platform</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total Sellers"   value={stats.totalSellers}   color="text-charcoal" />
          <StatCard label="Total Merchants" value={stats.totalMerchants} color="text-charcoal" />
          <StatCard label="Deals Closed"    value={stats.listings.sold}  color="text-secondary-600" sub="all time" />
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h3 className="text-sm font-semibold text-charcoal mb-3 uppercase tracking-wide">Recent Activity</h3>
        <div className="bg-white rounded-[8px] border border-border shadow-card overflow-hidden">
          {!logs || logs.length === 0 ? (
            <p className="p-6 text-sm text-muted text-center">No activity yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Actor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <tr key={(log as any).id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('en-BD', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-charcoal">{(log as { actorName?: string }).actorName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-primary-50 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-[4px]">
                        {(log as { action?: string }).action ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted capitalize">{(log as { module?: string }).module ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
