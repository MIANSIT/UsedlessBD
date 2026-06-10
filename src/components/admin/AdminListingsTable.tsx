'use client'

import { useTransition, useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import {
  approveListingAction,
  rejectListingAction,
  markListingSoldAction,
  deleteListingAdminAction,
  createListingAdminAction,
  type AdminResult,
} from '@/app/actions/admin'
import { getDivisionLabel, getDistrictLabel, DIVISIONS } from '@/lib/regions'

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-800',
  active:   'bg-blue-100 text-blue-800',
  sold:     'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  deleted:  'bg-gray-100 text-gray-600',
}

const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Electronics', furniture: 'Furniture', fashion: 'Fashion',
  books: 'Books', sports: 'Sports', home_garden: 'Home & Garden', others: 'Others',
}

const inputCls = 'w-full px-3 py-2 rounded-[6px] border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition'
const labelCls = 'block text-xs font-medium text-charcoal mb-1'

function CreateListingModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [selectedDivision, setSelectedDivision] = useState('')
  const [createState, createFormAction, createPending] = useActionState<AdminResult | null, FormData>(
    createListingAdminAction,
    null,
  )

  const districts = selectedDivision
    ? (DIVISIONS.find((d) => d.value === selectedDivision)?.districts ?? [])
    : []

  useEffect(() => {
    if (createState?.success) {
      onClose()
      router.refresh()
    }
  }, [createState, onClose, router])

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white">
          <h3 className="font-semibold text-charcoal">Create Listing</h3>
          <button onClick={onClose} className="text-muted hover:text-charcoal text-xl leading-none">×</button>
        </div>

        <form action={createFormAction} className="p-6 space-y-4">
          {createState && !createState.success && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[6px] text-sm text-red-700">
              {createState.error}
            </div>
          )}

          {/* Item info */}
          <div>
            <label className={labelCls}>Title</label>
            <input name="title" required minLength={5} maxLength={80} className={inputCls} placeholder="e.g. Samsung Galaxy S21" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Category</label>
              <select name="category" required className={inputCls}>
                <option value="">Select…</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="fashion">Fashion</option>
                <option value="books">Books</option>
                <option value="sports">Sports</option>
                <option value="home_garden">Home & Garden</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Condition</label>
              <select name="condition" required className={inputCls}>
                <option value="">Select…</option>
                <option value="brand_new">Brand New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Price (৳)</label>
              <input name="price" type="number" min={1} required className={inputCls} placeholder="500" />
            </div>
            <div className="flex flex-col justify-end pb-0.5">
              <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer select-none">
                <input type="checkbox" name="negotiable" value="true" className="w-4 h-4 accent-primary-600" />
                Negotiable
              </label>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description (optional)</label>
            <textarea name="description" maxLength={500} rows={3} className={inputCls} placeholder="Describe the item…" />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Division</label>
              <select
                name="division"
                required
                className={inputCls}
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
              >
                <option value="">Select…</option>
                {DIVISIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>District</label>
              <select name="district" required className={inputCls} disabled={!selectedDivision}>
                <option value="">Select…</option>
                {districts.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Seller */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-muted uppercase mb-3">Seller Info</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Seller Name</label>
                <input name="sellerName" required className={inputCls} placeholder="e.g. Karim" />
              </div>
              <div>
                <label className={labelCls}>Seller Phone</label>
                <input name="sellerPhone" type="tel" required className={inputCls} placeholder="01712345678" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted hover:text-charcoal border border-border rounded-[6px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPending}
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-[6px] hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {createPending ? 'Creating…' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AdminListingsTable({ listings, adminRole }: { listings: any[]; adminRole: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const act = (fn: () => Promise<{ success: boolean; error?: string }>) => {
    startTransition(async () => {
      const res = await fn()
      setFeedback(res.success ? '✅ Done' : `❌ ${res.error}`)
      if (res.success) router.refresh()
      setTimeout(() => setFeedback(null), 3000)
    })
  }

  const handleReject = () => {
    if (!rejectModal || !rejectionReason.trim()) return
    act(() => rejectListingAction(rejectModal.id, rejectionReason))
    setRejectModal(null)
    setRejectionReason('')
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

      {/* Reject reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] shadow-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-charcoal mb-1">Reject Listing</h3>
            <p className="text-sm text-muted mb-4">{rejectModal.title}</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection (visible to seller)…"
              className="w-full border border-border rounded-[6px] p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectionReason('') }}
                className="px-4 py-2 text-sm text-muted hover:text-charcoal border border-border rounded-[6px]"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-[6px] hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing modal */}
      {showCreate && <CreateListingModal onClose={() => setShowCreate(false)} />}

      {/* Create button */}
      {adminRole === 'super_admin' && (
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-[6px] hover:bg-blue-700 transition-colors"
          >
            <span className="text-lg leading-none">+</span> Create Listing
          </button>
        </div>
      )}

      <div className="bg-white rounded-[8px] border border-border shadow-card overflow-hidden">
        {listings.length === 0 ? (
          <p className="p-8 text-center text-muted text-sm">No listings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Item</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Seller</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map((listing) => {
                  const locationLabel = listing.location
                    ? `${getDivisionLabel(listing.location.division)}, ${getDistrictLabel(listing.location.division, listing.location.district)}`
                    : ''
                  return (
                    <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {listing.photos?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={listing.photos[0]} alt={listing.title} className="w-10 h-10 rounded object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg shrink-0">📦</div>
                          )}
                          <div>
                            <p className="font-medium text-charcoal line-clamp-1 max-w-[180px]">{listing.title}</p>
                            <p className="text-xs text-muted">{listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-charcoal">{listing.sellerName}</p>
                        <p className="text-xs text-muted">{listing.sellerPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {CATEGORY_LABELS[listing.category] ?? listing.category}
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary-700">
                        ৳{listing.price?.toLocaleString()}
                        {listing.negotiable && <span className="ml-1 text-[10px] text-secondary-600 font-normal">(neg)</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">{locationLabel}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-[4px] text-xs font-medium capitalize ${STATUS_STYLES[listing.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {listing.status}
                        </span>
                        {listing.rejectionReason && (
                          <p className="text-[10px] text-red-600 mt-0.5 max-w-[120px] truncate" title={listing.rejectionReason}>
                            {listing.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {listing.status === 'pending' && (
                            <>
                              <button
                                disabled={isPending}
                                onClick={() => act(() => approveListingAction(listing.id))}
                                className="px-2 py-1 bg-secondary-500 text-white text-xs rounded-[4px] hover:bg-secondary-600 disabled:opacity-50 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                disabled={isPending}
                                onClick={() => setRejectModal({ id: listing.id, title: listing.title })}
                                className="px-2 py-1 bg-red-500 text-white text-xs rounded-[4px] hover:bg-red-600 disabled:opacity-50 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {listing.status === 'active' && (
                            <>
                              <button
                                disabled={isPending}
                                onClick={() => act(() => markListingSoldAction(listing.id))}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded-[4px] hover:bg-green-700 disabled:opacity-50 transition-colors"
                              >
                                Mark Sold
                              </button>
                              <button
                                disabled={isPending}
                                onClick={() => setRejectModal({ id: listing.id, title: listing.title })}
                                className="px-2 py-1 bg-red-500 text-white text-xs rounded-[4px] hover:bg-red-600 disabled:opacity-50 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {listing.status !== 'deleted' && (
                            <button
                              disabled={isPending}
                              onClick={() => { if (confirm('Delete this listing?')) act(() => deleteListingAdminAction(listing.id)) }}
                              className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-[4px] hover:bg-gray-300 disabled:opacity-50 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
