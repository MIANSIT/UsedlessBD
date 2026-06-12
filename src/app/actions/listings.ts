'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

type SessionUser = { uid: string; name: string; phone: string; role: string; [key: string]: unknown }

async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null
  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true)
    const userDoc = await adminDb().collection('users').doc(decoded.uid).get()
    if (!userDoc.exists) return null
    return { uid: decoded.uid, ...(userDoc.data() as Record<string, unknown>) } as SessionUser
  } catch {
    return null
  }
}

const CreateListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(80, 'Title must be at most 80 characters'),
  category: z.enum(['electronics', 'furniture', 'fashion', 'books', 'sports', 'home_garden', 'others']),
  condition: z.enum(['brand_new', 'like_new', 'good', 'fair', 'poor']),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  price: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().min(1, 'Price must be at least ৳1').optional(),
  ),
  negotiable: z.enum(['true', 'false']).transform((v) => v === 'true'),
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
})

export type ListingResult =
  | { success: true; id?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function createListingAction(
  photoUrls: string[],
  _prevState: ListingResult | null,
  formData: FormData,
): Promise<ListingResult> {
  const raw = {
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    condition: formData.get('condition') as string,
    description: (formData.get('description') as string) || undefined,
    price: formData.get('price') as string,
    negotiable: (formData.get('negotiable') as string) || 'false',
    division: formData.get('division') as string,
    district: formData.get('district') as string,
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
      title: parsed.data.title,
      category: parsed.data.category,
      condition: parsed.data.condition,
      description: parsed.data.description ?? '',
      price: parsed.data.price ?? null,
      negotiable: parsed.data.negotiable,
      photos: photoUrls,
      location: {
        division: parsed.data.division,
        district: parsed.data.district,
      },
      sellerId: user.uid,
      sellerName: (user.name as string) ?? '',
      sellerPhone: (user.phone as string) ?? '',
      status: 'pending',
      viewCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    // Audit log
    await adminDb().collection('audit_logs').add({
      timestamp: FieldValue.serverTimestamp(),
      actorId: user.uid,
      actorName: (user.name as string) ?? '',
      actorRole: (user.role as string) ?? 'seller',
      action: 'LISTING_SUBMITTED',
      module: 'listings',
      targetId: ref.id,
      targetType: 'listing',
      previousValue: null,
      newValue: { status: 'pending', title: parsed.data.title },
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

  // Single-field equality + orderBy on the same field avoids composite index requirements.
  // Filtering out soft-deleted docs is done in JS so no extra index is needed.
  const snapshot = await adminDb()
    .collection('listings')
    .where('sellerId', '==', user.uid)
    .orderBy('createdAt', 'desc')
    .get()

  const listings = snapshot.docs
    .map((doc) => {
      const data = doc.data()
      // Skip soft-deleted listings (deletedAt field present, or status 'deleted')
      if (data.deletedAt || data.status === 'deleted') return null
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      }
    })
    .filter(Boolean)

  return { user, listings }
}

export async function deleteListingAction(listingId: string): Promise<ListingResult> {
  const user = await getSessionUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const docRef = adminDb().collection('listings').doc(listingId)
  const doc = await docRef.get()
  if (!doc.exists) return { success: false, error: 'Listing not found' }

  const data = doc.data()!
  if (data.sellerId !== user.uid) return { success: false, error: 'Not authorized' }
  if (!['pending', 'active'].includes(data.status)) {
    return { success: false, error: 'Cannot delete a sold or rejected listing' }
  }

  await docRef.update({
    deletedAt: FieldValue.serverTimestamp(),
    status: 'deleted',
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
}

export async function updateListingAction(
  listingId: string,
  photoUrls: string[],
  _prevState: ListingResult | null,
  formData: FormData,
): Promise<ListingResult> {
  const raw = {
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    condition: formData.get('condition') as string,
    description: (formData.get('description') as string) || undefined,
    price: formData.get('price') as string,
    negotiable: (formData.get('negotiable') as string) || 'false',
    division: formData.get('division') as string,
    district: formData.get('district') as string,
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
  if (!user) return { success: false, error: 'Not authenticated' }

  const docRef = adminDb().collection('listings').doc(listingId)
  const doc = await docRef.get()
  if (!doc.exists) return { success: false, error: 'Listing not found' }

  const data = doc.data()!
  if (data.sellerId !== user.uid) return { success: false, error: 'Not authorized' }

  await docRef.update({
    title: parsed.data.title,
    category: parsed.data.category,
    condition: parsed.data.condition,
    description: parsed.data.description ?? '',
    price: parsed.data.price ?? null,
    negotiable: parsed.data.negotiable,
    photos: photoUrls,
    location: { division: parsed.data.division, district: parsed.data.district },
    status: 'pending',
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { success: true }
}
