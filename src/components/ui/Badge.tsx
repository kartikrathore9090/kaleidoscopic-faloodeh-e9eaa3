import { CATEGORY_META, PRIORITY_META, ROLE_META, STATUS_META, cn } from '@/lib/meta'
import type { Category, Priority, RequestStatus, Role } from '@/lib/types'

const base = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap'

export function StatusBadge({ status, pulse }: { status: RequestStatus; pulse?: boolean }) {
  const m = STATUS_META[status]
  const live = pulse ?? (status === 'IN_PROGRESS' || status === 'OPEN')
  return (
    <span className={cn(base, m.chip)}>
      <span className="relative flex h-1.5 w-1.5">
        {live && <span className={cn('absolute inset-0 rounded-full animate-pulse-ring', m.dot)} />}
        <span className={cn('relative h-1.5 w-1.5 rounded-full', m.dot)} />
      </span>
      {m.label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = PRIORITY_META[priority]
  return (
    <span className={cn(base, m.chip)}>
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn('w-[3px] rounded-sm', i <= m.weight ? m.bar : 'bg-current opacity-20')} style={{ height: 4 + i * 2 }} />
        ))}
      </span>
      {m.label}
    </span>
  )
}

export function CategoryTag({ category, className }: { category: Category; className?: string }) {
  const m = CATEGORY_META[category]
  const Icon = m.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted', className)}>
      <Icon className="h-3.5 w-3.5 text-teal-500 dark:text-teal-300" />
      {m.label}
    </span>
  )
}

export function CategoryIcon({ category, size = 'md' }: { category: Category; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = CATEGORY_META[category].icon
  const s = { sm: 'h-8 w-8 rounded-lg', md: 'h-10 w-10 rounded-xl', lg: 'h-12 w-12 rounded-2xl' }[size]
  return (
    <span className={cn('grid shrink-0 place-items-center bg-gradient-to-br from-teal-400/20 to-sky-500/10 ring-1 ring-inset ring-teal-400/25 text-teal-600 dark:text-teal-300', s)}>
      <Icon className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
    </span>
  )
}

export function RoleBadge({ role }: { role: Role }) {
  return <span className={cn(base, ROLE_META[role].chip)}>{ROLE_META[role].label}</span>
}
