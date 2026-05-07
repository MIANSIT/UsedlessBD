'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

async function getSessionUser() {
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

const CreateListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  type: z.enum(['metal', 'plastic', 'electronics', 'paper', 'glass', 'other']),
  weight: z.coerce.number().positive('Weight must be greater than 0'),
  description: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  phone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .regex(/^(\+880|880|0)1[3-9]\d{8}$/, 'Enter a valid Bangladeshi phone number'),
})

export type ListingResult =
  | { success: true; id?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function createListingAction(
  imageUrls: string[],
  _prevState: ListingResult | null,
  formData: FormData,
): Promise<ListingResult> {
  const raw = {
    title: formData.get('title') as string,
    type: formData.get('type') as string,
    weight: formData.get('weight') as string,
    description: (formData.get('description') as string) || undefined,
    location: formData.get('location') as string,
    phone: formData.get('phone') as string,
  }

  const parsed = CreateListingSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const user = await getSessionUser()
  if (!user) return { success: false, error: 'You must be logged in to submit a listing.' }

  try {
    const ref = await adminDb().collection('listings').add({
      ...parsed.data,
      images: imageUrls.map((url) => ({ url })),
      status: 'pending',
      userId: user.uid,
      createdAt: FieldValue.serverTimestamp(),
    })

    return { success: true, id: ref.id }
  } catch (err) {
    console.error('Error creating listing:', err)
    return { success: false, error: 'Failed to create listing. Please try again.' }
  }
}

export async function getUserListings() {
  const user = await getSessionUser()
  if (!user) return null

  const snapshot = await adminDb()
    .collection('listings')
    .where('userId', '==', user.uid)
    .orderBy('createdAt', 'desc')
    .get()

  const listings = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    }
  })

  return { user, listings }
}

