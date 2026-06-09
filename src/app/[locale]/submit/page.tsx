import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'
import ListingForm from '@/components/forms/ListingForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'List an Item',
  description: 'List your secondhand item and connect with a buyer in Bangladesh.',
}

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/${locale === 'en' ? '' : locale + '/'}login?next=/${locale === 'en' ? '' : locale + '/'}submit`)
  }

  return (
    <div className="min-h-screen bg-snow py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-charcoal">List করুন</h1>
          <p className="mt-2 text-muted">
            সৎ বিবরণ + স্পষ্ট ছবি = দ্রুত বিক্রি। Honest listing + clear photos = fast sale.
          </p>
        </div>

        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-[8px] p-4 flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-amber-900 text-sm">After submission</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Your listing will be reviewed by our team. Once approved, we&apos;ll connect you
              with an interested buyer. আপনাকে কল করব! 📞
            </p>
          </div>
        </div>

        <ListingForm />
      </div>
    </div>
  )
}
