'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
})

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  phone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .regex(/^(\+880|880|0)1[3-9]\d{8}$/, 'Enter a valid Bangladeshi phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type AuthResult =
  | { success: true; redirectTo?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function loginAction(
  _prevState: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const payload = await getPayload({ config })

  try {
    const result = await payload.login({
      collection: 'users',
      data: { email: parsed.data.email, password: parsed.data.password },
    })

    if (!result.token) {
      return { success: false, error: 'Invalid email or password' }
    }

    const cookieStore = await cookies()
    cookieStore.set('payload-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Invalid email or password' }
  }
}

export async function registerAction(
  _prevState: AuthResult | null,
  formData: FormData,
): Promise<AuthResult> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    password: formData.get('password') as string,
  }

  const parsed = RegisterSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const payload = await getPayload({ config })

  try {
    await payload.create({
      collection: 'users',
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        password: parsed.data.password,
        role: 'user',
      },
    })

    // Auto-login after registration
    const loginResult = await payload.login({
      collection: 'users',
      data: { email: parsed.data.email, password: parsed.data.password },
    })

    if (loginResult.token) {
      const cookieStore = await cookies()
      cookieStore.set('payload-token', loginResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return { success: true }
  } catch (err: unknown) {
    // Detect duplicate email
    const message =
      err instanceof Error && err.message.toLowerCase().includes('duplicate')
        ? 'An account with this email already exists.'
        : 'Registration failed. Please try again.'
    return { success: false, error: message }
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('payload-token')
  redirect('/')
}
