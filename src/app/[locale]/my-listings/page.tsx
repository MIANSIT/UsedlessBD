import { redirect } from 'next/navigation'
import { Link } from '@/lib/navigation'
import { getUserListings } from '@/app/actions/listings'
import ListingCard from '@/components/dashboard/ListingCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Listings',
}

export default async function MyListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const data = await getUserListings()

  if (!data) {
    redirect(`/${locale === 'en' ? '' : locale + '/'}login?next=/${locale === 'en' ? '' : locale + '/'}my-listings`)
  }

  const { listings, user } = data

  return (
    <div className="min-h-screen bg-snow py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">My Listings</h1>
            <p className="text-muted mt-1">
              Track all your listed items · {(user as { name?: string }).name}
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-[8px] hover:bg-primary-700 transition-colors"
          >
            + List করুন
          </Link>
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap gap-3 mb-6 text-xs">
          {[
            { color: 'bg-yellow-100 text-yellow-800', label: 'Pending — under review' },
            { color: 'bg-blue-100 text-blue-800',   label: 'Active — live on platform' },
            { color: 'bg-green-100 text-green-800', label: 'Sold — deal closed' },
            { color: 'bg-red-100 text-red-800',     label: 'Rejected — see reason' },
          ].map(({ color, label }) => (
            <span key={label} className={`${color} px-2.5 py-1 rounded-[4px] font-medium`}>
              {label}
            </span>
          ))}
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[8px] border border-border shadow-card">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">
              Nothing listed yet — আপনার জিনিস নিজে থেকে বিক্রি হবে না! 😄
            </h2>
            <p className="text-muted mb-6">List your first item in under 2 minutes.</p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-[8px] hover:bg-primary-700 transition-colors"
            >
              List করুন → Free
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <ListingCard key={(listing as any).id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
