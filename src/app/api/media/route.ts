import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminStorage } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  // Verify session
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let uid: string
  try {
    const decoded = await adminAuth().verifySessionCookie(sessionCookie, true)
    uid = decoded.uid
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > 5_000_000) {
    return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `media/${uid}/${Date.now()}_${safeFilename}`

    const bucket = adminStorage().bucket()
    const fileRef = bucket.file(storagePath)

    await fileRef.save(buffer, { contentType: file.type })
    await fileRef.makePublic()

    const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

    return NextResponse.json({ id: url, url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
