'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminLoginAction, type AuthResult } from '@/app/actions/auth'

export default function AdminLoginForm() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<AuthResult | null, FormData>(
    adminLoginAction,
    null,
  )

  useEffect(() => {
    if (state?.success) router.push('/admin')
  }, [state, router])

  const err = state && !state.success ? state : null

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-charcoal">Admin Portal</h1>
          <p className="text-sm text-muted mt-1">UsedLess BD — Staff Access Only</p>
        </div>

        {err && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {err.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-medium text-charcoal mb-1">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="admin@uselessbd.com"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
            />
            {err?.fieldErrors?.email && (
              <p className="mt-1 text-xs text-red-600">{err.fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-medium text-charcoal mb-1">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
            />
            {err?.fieldErrors?.password && (
              <p className="mt-1 text-xs text-red-600">{err.fieldErrors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 bg-primary-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {pending ? 'Signing in…' : 'Sign In to Admin'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Seller account?{' '}
          <a href="/login" className="text-primary-600 hover:underline font-medium">
            Go to seller login
          </a>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        Restricted access. Unauthorised login attempts are logged.
      </p>
    </div>
  )
}
