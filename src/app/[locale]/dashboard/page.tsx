import { useTranslations } from 'next-intl'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Link } from '@/lib/navigation'
import { getUserListings } from '@/app/actions/listings'
import ListingCard from '@/components/dashboard/ListingCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Listings – Dashboard',
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const data = await getUserListings()

  if (!data) {
    redirect(`/${locale === 'en' ? '' : locale + '/'}login?callbackUrl=/${locale === 'en' ? '' : locale + '/'}dashboard`)
  }

  return <DashboardContent listings={data.listings} user={data.user} />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DashboardContent({ listings, user }: { listings: any[]; user: any }) {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="text-gray-500 mt-1">
              {t('dashboard.subtitle')} · {user.name}
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
          >
            + {t('dashboard.newListing')}
          </Link>
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {t('dashboard.noListings')}
            </h2>
            <Link
              href="/submit"
              className="mt-4 inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              {t('dashboard.submitFirst')}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
