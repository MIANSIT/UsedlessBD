'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

const SESSION_DURATION_MS = 60 * 60 * 24 * 7 * 1000 // 7 days

/** Sign in via Firebase Auth REST API and return an ID token. */
async function signInWithPassword(email: string, password: string): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  )
  const data = await res.json()
  if (!res.ok || data.error) throw new Error('Invalid email or password')
  return data.idToken as string
}

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
    .regex(/^(\+880|880|0)1[0-9]\d{8}$/, 'Enter a valid Bangladeshi phone number (e.g. 01712345678)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type AuthResult =
  | { success: true; redirectTo?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

async function setSessionCookie(idToken: string): Promise<void> {
  const sessionCookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  })
  const cookieStore = await cookies()
  cookieStore.set('session', sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_MS / 1000,
  })
}

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

  try {
    const idToken = await signInWithPassword(parsed.data.email, parsed.data.password)
    await setSessionCookie(idToken)
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

  try {
    const userRecord = await adminAuth().createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      displayName: parsed.data.name,
    })

    await adminDb().collection('users').doc(userRecord.uid).set({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      role: 'seller',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Auto-login after registration
    // Small delay to allow Firebase to propagate the new user before REST sign-in
    await new Promise((r) => setTimeout(r, 500))
    const idToken = await signInWithPassword(parsed.data.email, parsed.data.password)
    await setSessionCookie(idToken)

    return { success: true }
  } catch (err: unknown) {
    console.error('[registerAction] error:', err)
    const message = (err as Error)?.message ?? ''
    const code = (err as { code?: string }).code

    if (code === 'auth/email-already-exists') {
      return { success: false, error: 'An account with this email already exists.' }
    }
    if (code === 'auth/invalid-password' || code === 'auth/weak-password') {
      return { success: false, error: 'Password is too weak. Use at least 8 characters.' }
    }
    if (code === 'auth/invalid-email') {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: { email: ['Invalid email address'] },
      }
    }
    if (message.includes('Missing Firebase Admin credentials')) {
      return {
        success: false,
        error:
          'Server is not configured. Set FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in your .env.local file.',
      }
    }

    return { success: false, error: 'Registration failed. Please try again.' }
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/')
}

/** Returns the current signed-in user from the session cookie, or null. */
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null

  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true)
    const userDoc = await adminDb().collection('users').doc(decoded.uid).get()
    if (!userDoc.exists) return null
    return { uid: decoded.uid, ...(userDoc.data() as Record<string, unknown>) }
  } catch {
    return null
  }
}

