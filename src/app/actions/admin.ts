'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { headers } from 'next/headers'

const ADMIN_ROLES = ['admin', 'module_admin', 'super_admin']

async function getAdminUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null
  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true)
    const userDoc = await adminDb().collection('users').doc(decoded.uid).get()
    if (!userDoc.exists) return null
    const data = userDoc.data()!
    if (!ADMIN_ROLES.includes(data.role)) return null
    return { uid: decoded.uid, ...data } as {
      uid: string; name: string; role: string; email: string
    }
  } catch {
    return null
  }
}

async function getClientIp(): Promise<string> {
  try {
    const h = await headers()
    return h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

async function writeAuditLog(params: {
  actorId: string
  actorName: string
  actorRole: string
  action: string
  module: string
  targetId: string
  targetType: string
  previousValue?: object | null
  newValue?: object | null
  notes?: string
}) {
  const ip = await getClientIp()
  await adminDb().collection('audit_logs').add({
    ...params,
    previousValue: params.previousValue ?? null,
    newValue: params.newValue ?? null,
    notes: params.notes ?? '',
    ipAddress: ip,
    userAgent: '',
    timestamp: FieldValue.serverTimestamp(),
  })
}

export type AdminResult =
  | { success: true; id?: string }
  | { success: false; error: string }

// ─── Listings ────────────────────────────────────────────────────────────────

export async function getAdminListings(status?: string) {
  const admin = await getAdminUser()
  if (!admin) return null

  let query = adminDb().collection('listings').orderBy('createdAt', 'desc')
  // Note: actual Firestore filtering done after fetch for simplicity; use indexes in prod
  const snapshot = await query.limit(100).get()

  return snapshot.docs
    .map((doc) => {
      const data = doc.data()
      if (data.deletedAt) return null
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? '',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? '',
      }
    })
    .filter((d): d is NonNullable<typeof d> => {
      if (!d) return false
      if (status && status !== 'all') return (d as Record<string, unknown>).status === status
      return true
    })
}

export async function approveListingAction(listingId: string): Promise<AdminResult> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }

  const docRef = adminDb().collection('listings').doc(listingId)
  const doc = await docRef.get()
  if (!doc.exists) return { success: false, error: 'Listing not found' }

  const prev = doc.data()!
  await docRef.update({ status: 'active', updatedAt: FieldValue.serverTimestamp() })

  await writeAuditLog({
    actorId: admin.uid, actorName: admin.name, actorRole: admin.role,
    action: 'LISTING_APPROVED', module: 'listings',
    targetId: listingId, targetType: 'listing',
    previousValue: { status: prev.status },
    newValue: { status: 'active' },
  })

  // In-app notification for seller
  await adminDb()
    .collection('users').doc(prev.sellerId)
    .collection('notifications').add({
      title: 'Listing Approved ✅',
      body: `Your listing "${prev.title}" has been approved and is now live!`,
      read: false,
      listingId,
      createdAt: FieldValue.serverTimestamp(),
    })

  return { success: true }
}

export async function rejectListingAction(listingId: string, reason: string): Promise<AdminResult> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }

  const docRef = adminDb().collection('listings').doc(listingId)
  const doc = await docRef.get()
  if (!doc.exists) return { success: false, error: 'Listing not found' }

  const prev = doc.data()!
  await docRef.update({
    status: 'rejected',
    rejectionReason: reason,
    updatedAt: FieldValue.serverTimestamp(),
  })

  await writeAuditLog({
    actorId: admin.uid, actorName: admin.name, actorRole: admin.role,
    action: 'LISTING_REJECTED', module: 'listings',
    targetId: listingId, targetType: 'listing',
    previousValue: { status: prev.status },
    newValue: { status: 'rejected', rejectionReason: reason },
  })

  await adminDb()
    .collection('users').doc(prev.sellerId)
    .collection('notifications').add({
      title: 'Listing Rejected',
      body: `Your listing "${prev.title}" was rejected. Reason: ${reason}`,
      read: false,
      listingId,
      createdAt: FieldValue.serverTimestamp(),
    })

  return { success: true }
}

export async function markListingSoldAction(listingId: string): Promise<AdminResult> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }

  const docRef = adminDb().collection('listings').doc(listingId)
  const doc = await docRef.get()
  if (!doc.exists) return { success: false, error: 'Listing not found' }

  const prev = doc.data()!
  await docRef.update({ status: 'sold', updatedAt: FieldValue.serverTimestamp() })

  await writeAuditLog({
    actorId: admin.uid, actorName: admin.name, actorRole: admin.role,
    action: 'LISTING_SOLD', module: 'listings',
    targetId: listingId, targetType: 'listing',
    previousValue: { status: prev.status },
    newValue: { status: 'sold' },
  })

  return { success: true }
}

export async function deleteListingAdminAction(listingId: string): Promise<AdminResult> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }

  const docRef = adminDb().collection('listings').doc(listingId)
  const doc = await docRef.get()
  if (!doc.exists) return { success: false, error: 'Listing not found' }

  const prev = doc.data()!
  await docRef.update({
    deletedAt: FieldValue.serverTimestamp(),
    status: 'deleted',
    updatedAt: FieldValue.serverTimestamp(),
  })

  await writeAuditLog({
    actorId: admin.uid, actorName: admin.name, actorRole: admin.role,
    action: 'LISTING_DELETED', module: 'listings',
    targetId: listingId, targetType: 'listing',
    previousValue: { status: prev.status },
    newValue: { status: 'deleted' },
  })

  return { success: true }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getAdminUsers() {
  const admin = await getAdminUser()
  if (!admin) return null

  const snapshot = await adminDb().collection('users').orderBy('createdAt', 'desc').limit(200).get()
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt ?? '',
    }
  })
}

export async function suspendUserAction(userId: string): Promise<AdminResult> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }

  const docRef = adminDb().collection('users').doc(userId)
  const doc = await docRef.get()
  if (!doc.exists) return { success: false, error: 'User not found' }

  const prev = doc.data()!
  await docRef.update({ status: 'suspended', updatedAt: new Date().toISOString() })
  await adminAuth().updateUser(userId, { disabled: true })

  await writeAuditLog({
    actorId: admin.uid, actorName: admin.name, actorRole: admin.role,
    action: 'USER_SUSPENDED', module: 'users',
    targetId: userId, targetType: 'user',
    previousValue: { status: prev.status },
    newValue: { status: 'suspended' },
  })

  return { success: true }
}

export async function unsuspendUserAction(userId: string): Promise<AdminResult> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }

  const docRef = adminDb().collection('users').doc(userId)
  const doc = await docRef.get()
  if (!doc.exists) return { success: false, error: 'User not found' }

  const prev = doc.data()!
  await docRef.update({ status: 'active', updatedAt: new Date().toISOString() })
  await adminAuth().updateUser(userId, { disabled: false })

  await writeAuditLog({
    actorId: admin.uid, actorName: admin.name, actorRole: admin.role,
    action: 'USER_UNSUSPENDED', module: 'users',
    targetId: userId, targetType: 'user',
    previousValue: { status: prev.status },
    newValue: { status: 'active' },
  })

  return { success: true }
}

// ─── Merchants ────────────────────────────────────────────────────────────────

const MerchantSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z
    .string()
    .min(11)
    .regex(/^(\+880|880|0)1[0-9]\d{8}$/, 'Enter a valid BD phone number'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  categories: z.array(z.string()).min(1, 'At least one category'),
  areas: z.array(z.string()).min(1, 'At least one area'),
  notes: z.string().optional(),
})

export async function getMerchants() {
  const admin = await getAdminUser()
  if (!admin) return null

  const snapshot = await adminDb()
    .collection('merchants')
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get()

  return snapshot.docs
    .map((doc) => {
      const data = doc.data()
      if (data.deletedAt) return null
      return { id: doc.id, ...data, createdAt: data.createdAt ?? '' }
    })
    .filter(Boolean)
}

export async function createMerchantAction(
  _prev: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }

  const raw = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: (formData.get('email') as string) || '',
    categories: formData.getAll('categories') as string[],
    areas: formData.getAll('areas') as string[],
    notes: (formData.get('notes') as string) || '',
  }

  const parsed = MerchantSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed' }
  }

  const ref = await adminDb().collection('merchants').add({
    ...parsed.data,
    status: 'active',
    addedBy: admin.name,
    addedById: admin.uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  await writeAuditLog({
    actorId: admin.uid, actorName: admin.name, actorRole: admin.role,
    action: 'MERCHANT_ADDED', module: 'merchants',
    targetId: ref.id, targetType: 'merchant',
    previousValue: null,
    newValue: { name: parsed.data.name, phone: parsed.data.phone },
  })

  return { success: true, id: ref.id }
}

export async function updateMerchantAction(
  merchantId: string,
  _prev: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }

  const raw = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: (formData.get('email') as string) || '',
    categories: formData.getAll('categories') as string[],
    areas: formData.getAll('areas') as string[],
    notes: (formData.get('notes') as string) || '',
  }

  const parsed = MerchantSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed' }
  }

  const docRef = adminDb().collection('merchants').doc(merchantId)
  const prev = (await docRef.get()).data()

  await docRef.update({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() })

  await writeAuditLog({
    actorId: admin.uid, actorName: admin.name, actorRole: admin.role,
    action: 'MERCHANT_UPDATED', module: 'merchants',
    targetId: merchantId, targetType: 'merchant',
    previousValue: prev ?? null,
    newValue: parsed.data,
  })

  return { success: true }
}

export async function deactivateMerchantAction(merchantId: string): Promise<AdminResult> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }

  const docRef = adminDb().collection('merchants').doc(merchantId)
  const prev = (await docRef.get()).data()

  await docRef.update({ status: 'inactive', updatedAt: FieldValue.serverTimestamp() })

  await writeAuditLog({
    actorId: admin.uid, actorName: admin.name, actorRole: admin.role,
    action: 'MERCHANT_DEACTIVATED', module: 'merchants',
    targetId: merchantId, targetType: 'merchant',
    previousValue: { status: prev?.status },
    newValue: { status: 'inactive' },
  })

  return { success: true }
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export async function getAuditLogs(limitCount = 100) {
  const admin = await getAdminUser()
  if (!admin) return null

  const snapshot = await adminDb()
    .collection('audit_logs')
    .orderBy('timestamp', 'desc')
    .limit(limitCount)
    .get()

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp?.toDate?.()?.toISOString() ?? '',
    }
  })
}

// ─── Overview Stats ───────────────────────────────────────────────────────────

export async function getAdminStats() {
  const admin = await getAdminUser()
  if (!admin) return null

  const [listingsSnap, usersSnap, merchantsSnap] = await Promise.all([
    adminDb().collection('listings').get(),
    adminDb().collection('users').get(),
    adminDb().collection('merchants').get(),
  ])

  const listings = listingsSnap.docs.map((d) => d.data())
  const counts = {
    total: listings.filter((l) => !l.deletedAt).length,
    pending:  listings.filter((l) => l.status === 'pending').length,
    active:   listings.filter((l) => l.status === 'active').length,
    sold:     listings.filter((l) => l.status === 'sold').length,
    rejected: listings.filter((l) => l.status === 'rejected').length,
  }

  return {
    listings: counts,
    totalSellers: usersSnap.size,
    totalMerchants: merchantsSnap.docs.filter((d) => !d.data().deletedAt).length,
  }
}
