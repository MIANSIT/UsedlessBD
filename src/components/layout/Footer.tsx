import { useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'

export default function Footer() {
  const t = useTranslations()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-3" aria-label="uselessbd home">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white font-extrabold text-base leading-none">
                U
              </span>
              <span className="text-lg font-extrabold text-white tracking-tight">
                useless<span className="text-primary-400">bd</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              {t('common.tagline')}.
            </p>
            <p className="mt-4 text-xs text-gray-500">🇧🇩 Made with 💙 in Bangladesh</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-white transition-colors">
                  {t('nav.submitScrap')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  {t('nav.dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <span>info@uselessbd.com</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {year} {t('common.appName')}. All rights reserved.</p>
          <p>Built with Next.js &amp; Payload CMS</p>
        </div>
      </div>
    </footer>
  )
}
