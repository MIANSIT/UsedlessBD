'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'

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
  | { success: true; id?: string | number }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function createListingAction(
  imageIds: (string | number)[],
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

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return { success: false, error: 'You must be logged in to submit a listing.' }
  }

  try {
    const listing = await payload.create({
      collection: 'scrap-listings',
      data: {
        title: parsed.data.title,
        type: parsed.data.type,
        weight: parsed.data.weight,
        description: parsed.data.description,
        location: parsed.data.location,
        phone: parsed.data.phone,
        images: imageIds,
        status: 'pending',
        user: user.id,
      },
      overrideAccess: false,
      user,
    })

    return { success: true, id: listing.id }
  } catch (err) {
    console.error('Error creating listing:', err)
    return { success: false, error: 'Failed to create listing. Please try again.' }
  }
}

export async function getUserListings() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) return null

  const { docs } = await payload.find({
    collection: 'scrap-listings',
    where: { user: { equals: user.id } },
    sort: '-createdAt',
    depth: 2, // populate assignedDealer
    overrideAccess: false,
    user,
  })

  return { user, listings: docs }
}
