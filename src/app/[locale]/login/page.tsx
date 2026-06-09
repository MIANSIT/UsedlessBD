import { useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'
import LoginForm from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
}

export default function LoginPage() {
  return <LoginContent />
}

function LoginContent() {
  const t = useTranslations('auth.login')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-extrabold text-primary-600">Usedless</span>
            <span className="text-3xl font-extrabold text-gray-800">BD</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-500 mt-1.5 text-sm">{t('subtitle')}</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-gray-500">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-primary-600 font-medium hover:underline">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
