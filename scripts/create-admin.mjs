/**
 * Creates or updates an admin user in Firebase Auth + Firestore.
 *
 * Usage:
 *   node --env-file=.env.local scripts/create-admin.mjs
 *   node --env-file=.env.local scripts/create-admin.mjs --email admin@example.com --name "Site Admin" --password "P@ssw0rd!"
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// ── Parse CLI args ──────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const getArg = (name) => {
  const idx = argv.indexOf(`--${name}`)
  return idx !== -1 ? argv[idx + 1] : null
}

const EMAIL    = getArg('email')    || 'admin@uselessbd.com'
const NAME     = getArg('name')     || 'Super Admin'
const PASSWORD = getArg('password') || 'Admin@12345'

// ── Init Firebase Admin ─────────────────────────────────────────────────────
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (
  !process.env.FIREBASE_ADMIN_PROJECT_ID ||
  !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
  !privateKey
) {
  console.error('\n❌ Missing Firebase Admin credentials.')
  console.error('   Ensure .env.local has:')
  console.error('     FIREBASE_ADMIN_PROJECT_ID=...')
  console.error('     FIREBASE_ADMIN_CLIENT_EMAIL=...')
  console.error('     FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"')
  process.exit(1)
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  })
}

const auth = getAuth()
const db   = getFirestore()

// ── Create / Update ─────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🚀  Creating admin user: ${EMAIL}\n`)

  let uid
  try {
    const existing = await auth.getUserByEmail(EMAIL)
    uid = existing.uid
    await auth.updateUser(uid, { displayName: NAME, password: PASSWORD })
    console.log(`✅  Updated existing Firebase Auth user  (uid: ${uid})`)
  } catch {
    const newUser = await auth.createUser({ email: EMAIL, password: PASSWORD, displayName: NAME })
    uid = newUser.uid
    console.log(`✅  Created Firebase Auth user           (uid: ${uid})`)
  }

  await db.collection('users').doc(uid).set(
    {
      name:      NAME,
      email:     EMAIL,
      role:      'super_admin',
      status:    'active',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  // Make sure createdAt is set only once
  const snap = await db.collection('users').doc(uid).get()
  if (!snap.data()?.createdAt) {
    await db.collection('users').doc(uid).update({ createdAt: FieldValue.serverTimestamp() })
  }

  console.log(`✅  Firestore user doc → role: super_admin`)
  console.log(`\n🎉  Admin user ready!`)
  console.log(`    Email:    ${EMAIL}`)
  console.log(`    Password: ${PASSWORD}`)
  console.log(`    Login:    http://localhost:3000/admin-login\n`)
}

run().catch((err) => {
  console.error('\n❌ Failed:', err.message)
  process.exit(1)
})
