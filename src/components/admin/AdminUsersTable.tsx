'use client'

import { useTransition, useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { suspendUserAction, unsuspendUserAction, createUserAction, type AdminResult } from '@/app/actions/admin'

const ROLE_STYLES: Record<string, string> = {
  seller:       'bg-gray-100 text-gray-700',
  merchant:     'bg-blue-100 text-blue-700',
  admin:        'bg-purple-100 text-purple-700',
  module_admin: 'bg-indigo-100 text-indigo-700',
  super_admin:  'bg-red-100 text-red-700',
}

const STATUS_STYLES: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
}

const inputCls = 'w-full px-3 py-2 rounded-[6px] border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition'
const labelCls = 'block text-xs font-medium text-charcoal mb-1'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AdminUsersTable({ users, adminRole }: { users: any[]; adminRole: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const [createState, createFormAction, createPending] = useActionState<AdminResult | null, FormData>(
    createUserAction,
    null,
  )

  useEffect(() => {
    if (createState?.success) {
      setShowCreate(false)
      router.refresh()
      setFeedback('✅ User created successfully')
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [createState, router])

  const act = (fn: () => Promise<{ success: boolean; error?: string }>) => {
    startTransition(async () => {
      const res = await fn()
      setFeedback(res.success ? '✅ Done' : `❌ ${res.error}`)
      if (res.success) router.refresh()
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

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-charcoal">Create User</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-muted hover:text-charcoal text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form action={createFormAction} className="p-6 space-y-4">
              {createState && !createState.success && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-[6px] text-sm text-red-700">
                  {createState.error}
                </div>
              )}

              <div>
                <label className={labelCls}>Full Name</label>
                <input name="name" required className={inputCls} placeholder="e.g. Rahim Uddin" />
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input name="email" type="email" required className={inputCls} placeholder="user@example.com" />
              </div>

              <div>
                <label className={labelCls}>Phone (BD)</label>
                <input name="phone" type="tel" required className={inputCls} placeholder="01712345678" />
              </div>

              <div>
                <label className={labelCls}>Password</label>
                <input name="password" type="password" required minLength={8} className={inputCls} placeholder="Min 8 characters" />
              </div>

              <div>
                <label className={labelCls}>Role</label>
                <select name="role" required className={inputCls}>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                  <option value="module_admin">Module Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm text-muted hover:text-charcoal border border-border rounded-[6px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPending}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-[6px] hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {createPending ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table header with create button */}
      {adminRole === 'super_admin' && (
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-[6px] hover:bg-blue-700 transition-colors"
          >
            <span className="text-lg leading-none">+</span> Create User
          </button>
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
