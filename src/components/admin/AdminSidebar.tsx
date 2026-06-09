'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'

const NAV = [
  { href: '/admin',            label: 'Overview',    icon: '📊' },
  { href: '/admin/listings',   label: 'Listings',    icon: '📦' },
  { href: '/admin/merchants',  label: 'Merchants',   icon: '🤝' },
  { href: '/admin/users',      label: 'Users',       icon: '👥' },
  { href: '/admin/audit-logs', label: 'Audit Logs',  icon: '📋' },
]

interface AdminSidebarProps {
  adminName: string
  adminRole: string
}

export default function AdminSidebar({ adminName, adminRole }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin'
      ? pathname === '/admin' || pathname === '/en/admin'
      : pathname.includes(href.replace('/admin', ''))

  return (
    <aside className="w-64 shrink-0 bg-charcoal text-white flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpeg" alt="uselessbd" className="h-8 w-auto rounded" />
          <div>
            <p className="text-sm font-bold text-white">UsedLess BD</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wide">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-colors ${
              isActive(href)
                ? 'bg-primary-600 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="mb-3">
          <p className="text-sm font-medium text-white truncate">{adminName}</p>
          <span className="text-[11px] bg-primary-600/30 text-primary-300 px-2 py-0.5 rounded-[4px] font-medium uppercase tracking-wide">
            {adminRole}
          </span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full text-left text-xs text-white/50 hover:text-red-400 transition-colors py-1"
          >
            ← Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
