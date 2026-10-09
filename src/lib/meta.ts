import {
  Wrench,
  Monitor,
  Zap,
  Droplets,
  Sparkles,
  ShieldCheck,
  BedDouble,
  CircleHelp,
  type LucideIcon,
} from 'lucide-react'
import type { Category, Priority, RequestStatus, Role } from './types'

export const STATUS_FLOW: RequestStatus[] = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export const STATUS_META: Record<RequestStatus, { label: string; dot: string; chip: string; hex: string }> = {
  OPEN: { label: 'Open', dot: 'bg-sky-400', chip: 'text-sky-600 dark:text-sky-300 bg-sky-400/12 ring-sky-400/25', hex: '#38bdf8' },
  ASSIGNED: { label: 'Assigned', dot: 'bg-violet-400', chip: 'text-violet-600 dark:text-violet-300 bg-violet-400/12 ring-violet-400/25', hex: '#a78bfa' },
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-amber-400', chip: 'text-amber-600 dark:text-amber-300 bg-amber-400/12 ring-amber-400/25', hex: '#fbbf24' },
  RESOLVED: { label: 'Resolved', dot: 'bg-teal-400', chip: 'text-teal-600 dark:text-teal-300 bg-teal-400/12 ring-teal-400/25', hex: '#2dd4bf' },
  CLOSED: { label: 'Closed', dot: 'bg-slate-400', chip: 'text-slate-600 dark:text-slate-300 bg-slate-400/12 ring-slate-400/25', hex: '#94a3b8' },
}

export const PRIORITY_META: Record<Priority, { label: string; chip: string; bar: string; weight: number; sla: number }> = {
  LOW: { label: 'Low', chip: 'text-slate-600 dark:text-slate-300 bg-slate-400/10 ring-slate-400/20', bar: 'bg-slate-400', weight: 0, sla: 120 },
  MEDIUM: { label: 'Medium', chip: 'text-cyan-700 dark:text-cyan-300 bg-cyan-400/10 ring-cyan-400/25', bar: 'bg-cyan-400', weight: 1, sla: 72 },
  HIGH: { label: 'High', chip: 'text-orange-600 dark:text-orange-300 bg-orange-400/12 ring-orange-400/25', bar: 'bg-orange-400', weight: 2, sla: 24 },
  URGENT: { label: 'Urgent', chip: 'text-rose-600 dark:text-rose-300 bg-rose-500/12 ring-rose-400/30', bar: 'bg-rose-500', weight: 3, sla: 4 },
}

export const CATEGORY_META: Record<Category, { label: string; icon: LucideIcon; hint: string }> = {
  MAINTENANCE: { label: 'Maintenance', icon: Wrench, hint: 'Doors, furniture, walls, fixtures' },
  IT: { label: 'IT & Network', icon: Monitor, hint: 'Wi-Fi, lab PCs, projectors, accounts' },
  ELECTRICAL: { label: 'Electrical', icon: Zap, hint: 'Lights, sockets, power outages' },
  PLUMBING: { label: 'Plumbing', icon: Droplets, hint: 'Leaks, washrooms, water supply' },
  CLEANING: { label: 'Cleaning', icon: Sparkles, hint: 'Spills, waste, housekeeping' },
  SECURITY: { label: 'Security', icon: ShieldCheck, hint: 'Access cards, locks, safety' },
  HOSTEL: { label: 'Hostel', icon: BedDouble, hint: 'Rooms, mess, laundry, amenities' },
  OTHER: { label: 'Other', icon: CircleHelp, hint: 'Anything else on campus' },
}

export type AppPath = '/app/student' | '/app/requests/new' | '/app/staff' | '/app/admin' | '/app/admin/users'

export const ROLE_META: Record<Role, { label: string; home: AppPath; chip: string }> = {
  STUDENT: { label: 'Student', home: '/app/student', chip: 'text-cyan-700 dark:text-cyan-300 bg-cyan-400/10 ring-cyan-400/25' },
  STAFF: { label: 'Staff', home: '/app/staff', chip: 'text-violet-600 dark:text-violet-300 bg-violet-400/12 ring-violet-400/25' },
  ADMIN: { label: 'Admin', home: '/app/admin', chip: 'text-amber-600 dark:text-amber-300 bg-amber-400/12 ring-amber-400/25' },
}

export const BUILDINGS = [
  'Turing Hall (CS)',
  'Curie Science Block',
  'Central Library',
  'Ada Lovelace Hostel',
  'Raman Hostel',
  'Student Union',
  'Sports Complex',
  'Admin Building',
  'Engineering Workshop',
  'Main Cafeteria',
]

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  const units: [number, string][] = [
    [60 * 60 * 24 * 30, 'mo'],
    [60 * 60 * 24 * 7, 'w'],
    [60 * 60 * 24, 'd'],
    [60 * 60, 'h'],
    [60, 'm'],
  ]
  for (const [s, u] of units) if (diff >= s) return `${Math.floor(diff / s)}${u} ago`
  return 'just now'
}

export function formatDate(iso: string, withTime = true) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : { year: 'numeric' }),
  })
}

export function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}
