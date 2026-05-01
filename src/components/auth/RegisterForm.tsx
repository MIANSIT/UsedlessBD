'use client'

import { useTranslations } from 'next-intl'
import { useActionState, useEffect } from 'react'
import { useRouter } from '@/lib/navigation'
import { registerAction, type AuthResult } from '@/app/actions/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function RegisterForm() {
  const t = useTranslations('auth.register')
  const router = useRouter()

  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    registerAction,
    null,
  )

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard')
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
        name="name"
        type="text"
        label={t('name')}
        placeholder={t('namePlaceholder')}
        autoComplete="name"
        required
        error={fieldErrors.name?.[0]}
      />

      <Input
        name="email"
        type="email"
        label={t('email')}
        placeholder={t('emailPlaceholder')}
        autoComplete="email"
        required
        error={fieldErrors.email?.[0]}
      />

      {/* Phone – highlighted as primary contact method */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <Input
          name="phone"
          type="tel"
          label={`📞 ${t('phone')}`}
          placeholder={t('phonePlaceholder')}
          autoComplete="tel"
          required
          helpText={t('phoneHelp')}
          error={fieldErrors.phone?.[0]}
          className="bg-white"
        />
      </div>

      <Input
        name="password"
        type="password"
        label={t('password')}
        placeholder={t('passwordPlaceholder')}
        autoComplete="new-password"
        required
        error={fieldErrors.password?.[0]}
      />

      <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
        {isPending ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}
