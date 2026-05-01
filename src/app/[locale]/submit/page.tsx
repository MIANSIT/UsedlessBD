import { useTranslations } from 'next-intl'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import ScrapListingForm from '@/components/forms/ScrapListingForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit Scrap Listing',
  description: 'Submit your scrap listing and get connected with a verified dealer.',
}

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    redirect(`/${locale === 'en' ? '' : locale + '/'}login?callbackUrl=/${locale === 'en' ? '' : locale + '/'}submit`)
  }

  return <SubmitContent />
}

function SubmitContent() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('submit.title')}</h1>
          <p className="mt-2 text-gray-500">{t('submit.subtitle')}</p>
        </div>

        {/* Phone number callout */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">📞</span>
          <div>
            <p className="font-semibold text-amber-900 text-sm">Phone number is important</p>
            <p className="text-amber-700 text-sm mt-0.5">
              We primarily contact customers via phone in Bangladesh. Make sure your number is
              correct and active.
            </p>
          </div>
        </div>

        <ScrapListingForm />
      </div>
    </div>
  )
}
