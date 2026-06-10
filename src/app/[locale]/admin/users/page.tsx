import { getAdminUsers, getAdminRole } from '@/app/actions/admin'
import AdminUsersTable from '@/components/admin/AdminUsersTable'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Users' }

export default async function AdminUsersPage() {
  const [users, adminRole] = await Promise.all([getAdminUsers(), getAdminRole()])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal">Users</h2>
        <p className="text-muted text-sm mt-1">Manage registered sellers and their accounts</p>
      </div>
      <AdminUsersTable users={users ?? []} adminRole={adminRole ?? ''} />
    </div>
  )
}
