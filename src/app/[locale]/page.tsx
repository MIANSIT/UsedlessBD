import { useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'uselessbd – Buy & Sell Secondhand in Bangladesh',
  description:
    "Bangladesh's premier marketplace for unused and pre-loved items. List your stuff in 2 minutes and turn clutter into cash. Someone's gonna love what you no longer need.",
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      bn: '/bn',
    },
  },
  openGraph: {
    title: 'uselessbd – Your useless = someone\'s useful',
    description:
      'Buy & sell secondhand stuff in Bangladesh. Turn clutter into টাকা, find great deals.',
    url: '/',
    type: 'website',
  },
}

const ITEM_CATEGORIES = [
  { key: 'electronics', icon: '💻', color: 'bg-sky-50 text-sky-700 border border-sky-100' },
  { key: 'furniture',   icon: '🪑', color: 'bg-amber-50 text-amber-700 border border-amber-100' },
  { key: 'fashion',     icon: '👗', color: 'bg-rose-50 text-rose-700 border border-rose-100' },
  { key: 'books',       icon: '📚', color: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  { key: 'sports',      icon: '⚽', color: 'bg-orange-50 text-orange-700 border border-orange-100' },
  { key: 'home',        icon: '🏠', color: 'bg-violet-50 text-violet-700 border border-violet-100' },
] as const

const STEPS = [
  { num: '01', titleKey: 'step1Title', descKey: 'step1Desc', icon: '📋' },
  { num: '02', titleKey: 'step2Title', descKey: 'step2Desc', icon: '📞' },
  { num: '03', titleKey: 'step3Title', descKey: 'step3Desc', icon: '✅' },
] as const

const VALUES = [
  { icon: '♻️', labelKey: 'valueSustainability' },
  { icon: '🤝', labelKey: 'valueTrust' },
  { icon: '🇧🇩', labelKey: 'valueCommunity' },
  { icon: '💙', labelKey: 'valueTransparency' },
] as const

export default function HomePage() {
  return <HomeContent />
}

function HomeContent() {
  const t = useTranslations()

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 ring-1 ring-white/20">
              🇧🇩 {t('home.hero.badge')}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
              {t('home.hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl">
              {t('home.hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {t('home.hero.cta')} →
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
              >
                {t('home.hero.secondary')}
              </Link>
            </div>

            {/* Social proof micro-copy */}
            <p className="mt-6 text-sm text-white/70">
              {t('home.hero.socialProof')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
          {[
            { value: '500+', label: t('home.stats.listings') },
            { value: '50+',  label: t('home.stats.dealers') },
            { value: '200+', label: t('home.stats.completed') },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values Strip ──────────────────────────────────────── */}
      <section className="bg-snow py-8 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {VALUES.map(({ icon, labelKey }) => (
              <div key={labelKey} className="flex items-center gap-2 justify-center text-sm font-medium text-gray-600">
                <span className="text-xl">{icon}</span>
                <span>{t(`home.values.${labelKey}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal">
              {t('home.howItWorks.title')}
            </h2>
            <p className="mt-3 text-lg text-gray-500">{t('home.howItWorks.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center group hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {step.num}
                </div>
                <div className="text-5xl mb-4 mt-2">{step.icon}</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">
                  {t(`home.howItWorks.${step.titleKey}`)}
                </h3>
                <p className="text-gray-500 leading-relaxed">{t(`home.howItWorks.${step.descKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Item Categories ───────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">
              {t('home.categories.title')}
            </h2>
            <p className="mt-2 text-gray-500">{t('home.categories.subtitle')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ITEM_CATEGORIES.map(({ key, icon, color }) => (
              <Link
                key={key}
                href="/submit"
                className={`flex flex-col items-center gap-2 p-5 rounded-xl ${color} hover:scale-105 hover:shadow-sm transition-all duration-200 cursor-pointer`}
              >
                <span className="text-3xl">{icon}</span>
                <span className="text-sm font-medium text-center">{t(`home.categories.${key}`)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Section ─────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-secondary-50 to-primary-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-4">
            {t('home.trust.title')}
          </h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            {t('home.trust.body')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              t('home.trust.tag1'),
              t('home.trust.tag2'),
              t('home.trust.tag3'),
              t('home.trust.tag4'),
            ].map((tag) => (
              <span
                key={tag}
                className="bg-white text-primary-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm border border-primary-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="py-20 bg-primary-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-4xl mb-4">💙</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('home.cta.title')}</h2>
          <p className="text-lg text-white/85 mb-8">{t('home.cta.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-10 py-4 rounded-xl hover:bg-primary-50 transition-all shadow-lg text-lg"
            >
              {t('home.cta.buttonSell')} →
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-semibold px-10 py-4 rounded-xl hover:bg-white/10 transition-all text-lg"
            >
              {t('home.cta.buttonBuy')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

