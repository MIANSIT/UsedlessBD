import { useTranslations } from 'next-intl'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

type Status = 'pending' | 'connected' | 'completed' | 'rejected'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ListingCard({ listing }: { listing: any }) {
  const t = useTranslations()
  const status: Status = listing.status ?? 'pending'

  const statusLabel: Record<Status, string> = {
    pending: t('listing.status.pending'),
    connected: t('listing.status.connected'),
    completed: t('listing.status.completed'),
    rejected: t('listing.status.rejected'),
  }

  const typeLabel: Record<string, string> = {
    metal: t('listing.types.metal'),
    plastic: t('listing.types.plastic'),
    electronics: t('listing.types.electronics'),
    paper: t('listing.types.paper'),
    glass: t('listing.types.glass'),
    other: t('listing.types.other'),
  }

  const typeIcons: Record<string, string> = {
    metal: '🔩',
    plastic: '♻️',
    electronics: '💻',
    paper: '📄',
    glass: '🪟',
    other: '📦',
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Image */}
      {listing.images && listing.images.length > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.images[0]?.url ?? listing.images[0]?.filename}
          alt={listing.title}
          className="w-full h-36 object-cover"
        />
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-5xl">
          {typeIcons[listing.type] ?? '📦'}
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Status + Type */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant={status}>{statusLabel[status]}</Badge>
          <span className="text-xs text-gray-400">
            {typeIcons[listing.type]} {typeLabel[listing.type] ?? listing.type}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">{listing.title}</h3>

        {/* Weight + Location */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>⚖️ {listing.weight} {t('dashboard.weight')}</p>
          <p>📍 {listing.location}</p>
          <p>📞 {listing.phone}</p>
        </div>

        {/* Dealer info (once connected) */}
        {listing.assignedDealer && (
          <div className="mt-auto bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs space-y-1">
            <p className="font-medium text-blue-800">
              🤝 {t('dashboard.assignedDealer')}: {listing.assignedDealer.name}
            </p>
            <p className="text-blue-700">
              📞 {t('dashboard.dealerPhone')}: {listing.assignedDealer.phone}
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-100">
          {t('dashboard.submittedOn')} {formatDate(listing.createdAt)}
        </p>
      </div>
    </div>
  )
}
