import { getAuditLogs } from '@/app/actions/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Audit Logs' }

const ACTION_COLORS: Record<string, string> = {
  LISTING_SUBMITTED:   'bg-blue-50 text-blue-700',
  LISTING_APPROVED:    'bg-green-50 text-green-700',
  LISTING_REJECTED:    'bg-red-50 text-red-700',
  LISTING_SOLD:        'bg-emerald-50 text-emerald-700',
  LISTING_DELETED:     'bg-gray-100 text-gray-600',
  MERCHANT_ADDED:      'bg-purple-50 text-purple-700',
  MERCHANT_UPDATED:    'bg-indigo-50 text-indigo-700',
  MERCHANT_DEACTIVATED:'bg-orange-50 text-orange-700',
  MERCHANT_DELETED:    'bg-gray-100 text-gray-600',
  USER_SUSPENDED:      'bg-red-50 text-red-700',
  USER_UNSUSPENDED:    'bg-green-50 text-green-700',
  USER_ROLE_CHANGED:   'bg-yellow-50 text-yellow-700',
}

export default async function AuditLogsPage() {
  const logs = await getAuditLogs(200)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Audit Logs</h2>
          <p className="text-muted text-sm mt-1">
            Immutable record of every significant platform action · {logs?.length ?? 0} entries
          </p>
        </div>
        <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-[4px] font-medium">
          🔒 Write-only — no deletions
        </span>
      </div>

      <div className="bg-white rounded-[8px] border border-border shadow-card overflow-hidden">
        {!logs || logs.length === 0 ? (
          <p className="p-8 text-center text-muted text-sm">No audit logs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase whitespace-nowrap">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Actor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Module</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Target</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Before → After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const l = log as any
                  const actionColor = ACTION_COLORS[l.action] ?? 'bg-gray-100 text-gray-600'
                  return (
                    <tr key={l.id} className="hover:bg-gray-50 transition-colors align-top">
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {l.timestamp ? new Date(l.timestamp).toLocaleString('en-BD', {
                          dateStyle: 'short', timeStyle: 'medium'
                        }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-charcoal">{l.actorName ?? '—'}</p>
                        <p className="text-xs text-muted">{l.actorRole ?? ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-[4px] text-xs font-medium ${actionColor}`}>
                          {l.action ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted capitalize">{l.module ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted font-mono">
                        <span title={l.targetId}>{l.targetId?.slice(0, 8) ?? '—'}…</span>
                        <p className="text-[10px]">{l.targetType ?? ''}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted max-w-[200px]">
                        {l.previousValue || l.newValue ? (
                          <details>
                            <summary className="cursor-pointer text-primary-600 hover:underline">View diff</summary>
                            <div className="mt-1 space-y-1">
                              {l.previousValue && (
                                <div className="bg-red-50 rounded p-1 font-mono text-[10px] text-red-700 whitespace-pre-wrap break-all">
                                  {JSON.stringify(l.previousValue, null, 2)}
                                </div>
                              )}
                              {l.newValue && (
                                <div className="bg-green-50 rounded p-1 font-mono text-[10px] text-green-700 whitespace-pre-wrap break-all">
                                  {JSON.stringify(l.newValue, null, 2)}
                                </div>
                              )}
                            </div>
                          </details>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
