'use client'

import { useTranslations } from 'next-intl'
import { useActionState, useEffect } from 'react'
import { useRouter } from '@/lib/navigation'
import { loginAction, type AuthResult } from '@/app/actions/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginForm() {
  const t = useTranslations('auth.login')
  const router = useRouter()

  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    loginAction,
    null,
  )

  useEffect(() => {
    if (state?.success) {
      router.push('/my-listings')
      router.refresh()
    }
  }, [state, router])

  const fieldErrors = !state?.success && state?.fieldErrors ? state.fieldErrors : {}

  return (
    <form action={formAction} className="space-y-4">
      {!state?.success && state?.error && !state.fieldErrors && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm text-red-700 text-center">
          {state.error}
        </div>
      )}

      <Input
        name="email"
        type="email"
        label={t('email')}
        placeholder={t('emailPlaceholder')}
        autoComplete="email"
        required
        error={fieldErrors.email?.[0]}
      />

      <Input
        name="password"
        type="password"
        label={t('password')}
        placeholder={t('passwordPlaceholder')}
        autoComplete="current-password"
        required
        error={fieldErrors.password?.[0]}
      />

      <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
        {isPending ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}
