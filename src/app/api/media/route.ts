import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'
import { v2 as cloudinary } from 'cloudinary'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 5_000_000 // 5 MB

// Configure once at module load — env vars are available by then in Next.js
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

function uploadBuffer(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image',
          // Resize to max 1200 px on either dimension (keeps aspect ratio)
          // and let Cloudinary pick optimal quality + format per browser.
          transformation: [{ width: 1200, height: 1200, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }],
        },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error('No result from Cloudinary'))
          resolve(result.secure_url)
        },
      )
      .end(buffer)
  })
}

export async function POST(req: NextRequest) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json(
      {
        error:
          'Image storage not configured. Add CLOUDINARY_CLOUD_NAME, ' +
          'CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env.local.',
      },
      { status: 500 },
    )
  }

  // Verify session
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  let uid: string
  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true)
    uid = decoded.uid
  } catch {
    return NextResponse.json({ error: 'Session expired — please log in again' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File exceeds 5 MB limit (got ${(file.size / 1_000_000).toFixed(1)} MB)` },
      { status: 400 },
    )
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type "${file.type}". Use JPEG, PNG, WebP, or GIF.` },
      { status: 400 },
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadBuffer(buffer, `usedlessbd/${uid}`)
    return NextResponse.json({ id: url, url })
  } catch (err) {
    console.error('[/api/media] Cloudinary error:', err)
    return NextResponse.json(
      { error: `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 500 },
    )
  }
}
