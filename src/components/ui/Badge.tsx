import { cn } from '@/lib/utils'

type Variant = 'pending' | 'connected' | 'completed' | 'rejected' | 'default'

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<Variant, string> = {
  pending: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
  connected: 'bg-blue-100 text-blue-800 ring-blue-200',
  completed: 'bg-green-100 text-green-800 ring-green-200',
  rejected: 'bg-red-100 text-red-800 ring-red-200',
  default: 'bg-gray-100 text-gray-700 ring-gray-200',
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
