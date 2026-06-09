'use client'

import { useTransition, useState } from 'react'
import Badge from '@/components/ui/Badge'
import { deleteListingAction } from '@/app/actions/listings'
import { getDivisionLabel, getDistrictLabel } from '@/lib/regions'

type Status = 'pending' | 'active' | 'sold' | 'rejected' | 'deleted'

const STATUS_BADGES: Record<Status, { variant: 'pending' | 'connected' | 'completed' | 'rejected' | 'default'; label: string }> = {
  pending:  { variant: 'pending',   label: 'Pending Review' },
  active:   { variant: 'connected', label: 'Active' },
  sold:     { variant: 'completed', label: 'Sold' },
  rejected: { variant: 'rejected',  label: 'Rejected' },
  deleted:  { variant: 'default',   label: 'Deleted' },
}

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '💻',
  furniture:   '🪑',
  fashion:     '👗',
  books:       '📚',
  sports:      '⚽',
  home_garden: '🏠',
  others:      '📦',
}

const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Electronics',
  furniture:   'Furniture',
  fashion:     'Fashion',
  books:       'Books',
  sports:      'Sports',
  home_garden: 'Home & Garden',
  others:      'Others',
}

const CONDITION_LABELS: Record<string, string> = {
  brand_new: 'Brand New',
  like_new:  'Like New',
  good:      'Good',
  fair:      'Fair',
  poor:      'Poor',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ListingCard({ listing }: { listing: any }) {
  const [isPending, startTransition] = useTransition()
  const [deleted, setDeleted] = useState(false)
  const status: Status = listing.status ?? 'pending'
  const badge = STATUS_BADGES[status] ?? STATUS_BADGES.pending

  if (deleted) return null

  const handleDelete = () => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    startTransition(async () => {
      await deleteListingAction(listing.id)
      setDeleted(true)
    })
  }

  const locationLabel = listing.location
    ? `${getDivisionLabel(listing.location.division)}, ${getDistrictLabel(listing.location.division, listing.location.district)}`
    : listing.location ?? ''

  const canEdit = ['pending', 'active'].includes(status)

  return (
    <div className="bg-white rounded-[8px] border border-border shadow-card hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Thumbnail */}
      {listing.photos && listing.photos.length > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.photos[0]}
          alt={listing.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl">
          {CATEGORY_ICONS[listing.category] ?? '📦'}
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Status + Category */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <span className="text-xs text-gray-400">
            {CATEGORY_ICONS[listing.category]} {CATEGORY_LABELS[listing.category] ?? listing.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-charcoal leading-snug line-clamp-2">{listing.title}</h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary-600">৳{listing.price?.toLocaleString()}</span>
          {listing.negotiable && (
            <span className="text-xs text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-[4px] font-medium">
              Negotiable
            </span>
          )}
        </div>

        {/* Condition + Location */}
        <div className="text-xs text-muted space-y-0.5">
          <p>🏷️ {CONDITION_LABELS[listing.condition] ?? listing.condition}</p>
          {locationLabel && <p>📍 {locationLabel}</p>}
        </div>

        {/* Rejection reason */}
        {status === 'rejected' && listing.rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-[8px] p-2 text-xs text-red-700">
            <span className="font-medium">Reason: </span>{listing.rejectionReason}
          </div>
        )}

        {/* Merchant contact (when lead assigned) */}
        {listing.merchantPhone && (
          <div className="bg-blue-50 border border-blue-100 rounded-[8px] p-3 text-xs space-y-0.5">
            <p className="font-medium text-blue-800">🤝 Buyer found!</p>
            <p className="text-blue-700">📞 {listing.merchantPhone}</p>
          </div>
        )}

        {/* Actions */}
        {canEdit && (
          <div className="flex gap-2 mt-auto pt-3 border-t border-border">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 py-1.5 rounded-[6px] transition-colors disabled:opacity-50"
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-[11px] text-gray-400 mt-auto pt-2 border-t border-border">
          Listed {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
        </p>
      </div>
    </div>
  )
}
