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
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? '',
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? '',
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
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? '',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? '',
      }
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

// ─── Create User (super_admin only) ──────────────────────────────────────────

const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z
    .string()
    .regex(/^(\+880|880|0)1[0-9]\d{8}$/, 'Enter a valid BD phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['seller', 'admin', 'module_admin', 'super_admin']),
})

export async function createUserAction(
  _prev: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }
  if (admin.role !== 'super_admin') {
    return { success: false, error: 'Only super admins can create users.' }
  }

  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    password: formData.get('password') as string,
    role: formData.get('role') as string,
  }

  const parsed = CreateUserSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed' }
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
      role: parsed.data.role,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    await writeAuditLog({
      actorId: admin.uid, actorName: admin.name, actorRole: admin.role,
      action: 'USER_CREATED', module: 'users',
      targetId: userRecord.uid, targetType: 'user',
      previousValue: null,
      newValue: { name: parsed.data.name, email: parsed.data.email, role: parsed.data.role },
    })

    return { success: true, id: userRecord.uid }
  } catch (err: unknown) {
    const code = (err as { code?: string }).code
    if (code === 'auth/email-already-exists') {
      return { success: false, error: 'An account with this email already exists.' }
    }
    return { success: false, error: 'Failed to create user. Please try again.' }
  }
}

// ─── Create Listing (super_admin only) ───────────────────────────────────────

const AdminListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(80),
  category: z.enum(['electronics', 'furniture', 'fashion', 'books', 'sports', 'home_garden', 'others']),
  condition: z.enum(['brand_new', 'like_new', 'good', 'fair', 'poor']),
  description: z.string().max(500).optional(),
  price: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().min(1, 'Price must be at least ৳1').optional(),
  ),
  negotiable: z.enum(['true', 'false']).transform((v) => v === 'true'),
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  sellerName: z.string().min(1, 'Seller name is required'),
  sellerPhone: z
    .string()
    .regex(/^(\+880|880|0)1[0-9]\d{8}$/, 'Enter a valid BD phone number'),
})

export async function createListingAdminAction(
  _prev: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }
  if (admin.role !== 'super_admin') {
    return { success: false, error: 'Only super admins can create listings.' }
  }

  const raw = {
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    condition: formData.get('condition') as string,
    description: (formData.get('description') as string) || undefined,
    price: formData.get('price') as string,
    negotiable: (formData.get('negotiable') as string) || 'false',
    division: formData.get('division') as string,
    district: formData.get('district') as string,
    sellerName: formData.get('sellerName') as string,
    sellerPhone: formData.get('sellerPhone') as string,
  }

  const parsed = AdminListingSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Validation failed' }
  }

  try {
    const ref = await adminDb().collection('listings').add({
      title: parsed.data.title,
      category: parsed.data.category,
      condition: parsed.data.condition,
      description: parsed.data.description ?? '',
      price: parsed.data.price ?? null,
      negotiable: parsed.data.negotiable,
      photos: [],
      location: { division: parsed.data.division, district: parsed.data.district },
      sellerId: admin.uid,
      sellerName: parsed.data.sellerName,
      sellerPhone: parsed.data.sellerPhone,
      status: 'active',
      viewCount: 0,
      createdByAdmin: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    await writeAuditLog({
      actorId: admin.uid, actorName: admin.name, actorRole: admin.role,
      action: 'LISTING_CREATED_BY_ADMIN', module: 'listings',
      targetId: ref.id, targetType: 'listing',
      previousValue: null,
      newValue: { title: parsed.data.title, status: 'active' },
    })

    return { success: true, id: ref.id }
  } catch (err) {
    console.error('[createListingAdminAction]', err)
    return { success: false, error: 'Failed to create listing. Please try again.' }
  }
}

// ─── Overview Stats ───────────────────────────────────────────────────────────

export async function getAdminRole(): Promise<string | null> {
  const admin = await getAdminUser()
  return admin?.role ?? null
}

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
