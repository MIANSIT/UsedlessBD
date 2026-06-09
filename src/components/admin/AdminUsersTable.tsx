'use client'

import { useTransition, useState } from 'react'
import { suspendUserAction, unsuspendUserAction } from '@/app/actions/admin'

const ROLE_STYLES: Record<string, string> = {
  seller:      'bg-gray-100 text-gray-700',
  merchant:    'bg-blue-100 text-blue-700',
  admin:       'bg-purple-100 text-purple-700',
  module_admin:'bg-indigo-100 text-indigo-700',
  super_admin: 'bg-red-100 text-red-700',
}

const STATUS_STYLES: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AdminUsersTable({ users }: { users: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)

  const act = (fn: () => Promise<{ success: boolean; error?: string }>) => {
    startTransition(async () => {
      const res = await fn()
      setFeedback(res.success ? '✅ Done' : `❌ ${res.error}`)
      setTimeout(() => setFeedback(null), 3000)
    })
  }

  return (
    <>
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-[8px] text-sm font-medium shadow-lg ${
          feedback.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {feedback}
        </div>
      )}

      <div className="bg-white rounded-[8px] border border-border shadow-card overflow-hidden">
        {users.length === 0 ? (
          <p className="p-8 text-center text-muted text-sm">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Registered</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-charcoal">{user.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted">{user.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-muted text-xs">{user.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-[4px] text-xs font-medium ${ROLE_STYLES[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {user.role ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-[4px] text-xs font-medium ${STATUS_STYLES[user.status ?? 'active'] ?? 'bg-gray-100'}`}>
                        {user.status ?? 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {user.status !== 'suspended' ? (
                          <button
                            disabled={isPending}
                            onClick={() => { if (confirm(`Suspend ${user.name}?`)) act(() => suspendUserAction(user.id)) }}
                            className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-[4px] hover:bg-red-100 disabled:opacity-50 transition-colors"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            disabled={isPending}
                            onClick={() => act(() => unsuspendUserAction(user.id))}
                            className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-[4px] hover:bg-green-100 disabled:opacity-50 transition-colors"
                          >
                            Unsuspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
