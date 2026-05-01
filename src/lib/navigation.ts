// Re-export next-intl navigation helpers bound to our routing config
// Use these instead of Next.js's built-in Link/useRouter
// so locale is automatically handled.
import { createNavigation } from 'next-intl/navigation'
import { routing } from '@/i18n/routing'

export const { Link, redirect, useRouter, usePathname, getPathname } =
  createNavigation(routing)
