'use client'

import { useActionState, useTransition, useState } from 'react'
import {
  createMerchantAction,
  updateMerchantAction,
  deactivateMerchantAction,
  type AdminResult,
} from '@/app/actions/admin'
import { DIVISIONS } from '@/lib/regions'

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture',   label: 'Furniture' },
  { value: 'fashion',     label: 'Fashion' },
  { value: 'books',       label: 'Books' },
  { value: 'sports',      label: 'Sports' },
  { value: 'home_garden', label: 'Home & Garden' },
  { value: 'others',      label: 'Others' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MerchantModal({ onClose, existing }: { onClose: () => void; existing?: any }) {
  const isEdit = !!existing
  const boundAction = isEdit
    ? updateMerchantAction.bind(null, existing.id)
    : createMerchantAction

  const [state, formAction, isPending] = useActionState<AdminResult | null, FormData>(
    boundAction,
    null,
  )

  if (state?.success) {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-charcoal">{isEdit ? 'Edit Merchant' : 'Add Merchant'}</h3>
          <button onClick={onClose} className="text-muted hover:text-charcoal text-lg">✕</button>
        </div>

        {!state?.success && state?.error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-[6px] p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-charcoal">Name *</label>
            <input name="name" required defaultValue={existing?.name}
              className="mt-1 w-full border border-border rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Person or company name" />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Phone *</label>
            <input name="phone" required defaultValue={existing?.phone} type="tel"
              className="mt-1 w-full border border-border rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Email</label>
            <input name="email" type="email" defaultValue={existing?.email}
              className="mt-1 w-full border border-border rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="merchant@example.com" />
          </div>

          <div>
            <label className="text-sm font-medium text-charcoal">Categories of Interest *</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <label key={cat.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox" name="categories" value={cat.value}
                    defaultChecked={existing?.categories?.includes(cat.value)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  {cat.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-charcoal">Areas of Operation *</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {DIVISIONS.map((div) => (
                <label key={div.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox" name="areas" value={div.value}
                    defaultChecked={existing?.areas?.includes(div.value)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  {div.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-charcoal">Internal Notes</label>
            <textarea name="notes" defaultValue={existing?.notes} rows={3}
              className="mt-1 w-full border border-border rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
              placeholder="Not visible to sellers…" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-muted border border-border rounded-[6px] hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-[6px] hover:bg-primary-700 disabled:opacity-50">
              {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Merchant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AdminMerchantsTable({ merchants }: { merchants: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingMerchant, setEditingMerchant] = useState<any | null>(null)
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

      {(showModal || editingMerchant) && (
        <MerchantModal
          existing={editingMerchant}
          onClose={() => { setShowModal(false); setEditingMerchant(null) }}
        />
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-[8px] hover:bg-primary-700 transition-colors"
        >
          + Add Merchant
        </button>
      </div>

      <div className="bg-white rounded-[8px] border border-border shadow-card overflow-hidden">
        {merchants.length === 0 ? (
          <p className="p-8 text-center text-muted text-sm">No merchants yet. Add one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Categories</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Areas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal">{merchant.name}</p>
                      <p className="text-xs text-muted">Added by {merchant.addedBy}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-charcoal">{merchant.phone}</p>
                      <p className="text-xs text-muted">{merchant.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {(merchant.categories ?? []).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {(merchant.areas ?? []).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-[4px] text-xs font-medium ${
                        merchant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {merchant.status ?? 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingMerchant(merchant)}
                          className="px-2 py-1 bg-gray-100 text-charcoal text-xs rounded-[4px] hover:bg-gray-200 transition-colors"
                        >
                          Edit
                        </button>
                        {merchant.status === 'active' && (
                          <button
                            disabled={isPending}
                            onClick={() => { if (confirm(`Deactivate ${merchant.name}?`)) act(() => deactivateMerchantAction(merchant.id)) }}
                            className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-[4px] hover:bg-red-100 disabled:opacity-50 transition-colors"
                          >
                            Deactivate
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
