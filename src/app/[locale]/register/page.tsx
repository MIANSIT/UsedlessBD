import { useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'
import RegisterForm from '@/components/auth/RegisterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register',
}

export default function RegisterPage() {
  return <RegisterContent />
}

function RegisterContent() {
  const t = useTranslations('auth.register')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
          <img
            src="/logo.jpeg"
            alt="UsedLess Logo"
            className="mx-auto h-12 w-auto mb-2"
          />
            <span className="text-3xl font-extrabold text-primary-600">Used</span>
            <span className="text-3xl font-extrabold text-gray-800">Less</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-500 mt-1.5 text-sm">{t('subtitle')}</p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('hasAccount')}{' '}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
