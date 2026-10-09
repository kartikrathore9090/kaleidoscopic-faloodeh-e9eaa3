import { Link } from '@tanstack/react-router'
import { ChevronRight, Clock, MapPin } from 'lucide-react'
import { cn, timeAgo } from '@/lib/meta'
import type { ServiceRequest } from '@/lib/types'
import { useDirectory } from '@/lib/directory'
import { CategoryIcon, PriorityBadge, StatusBadge } from './ui/Badge'
import { Avatar } from './ui/Avatar'

export function RequestRow({ r, showAssignee = true, actions, index = 0 }: { r: ServiceRequest; showAssignee?: boolean; actions?: React.ReactNode; index?: number }) {
  const users = useDirectory()
  const assignee = r.assignedTo ? users.get(r.assignedTo) : undefined
  const overdue = r.dueAt && !['RESOLVED', 'CLOSED'].includes(r.status) && new Date(r.dueAt) < new Date()
  return (
    <div className="group relative flex items-center gap-4 px-5 py-4 transition hover:bg-teal-400/[0.04]" style={{ animation: `fade-up 0.5s ${Math.min(index, 10) * 45}ms both` }}>
      <span className="absolute inset-y-3 left-0 w-[2px] scale-y-0 rounded-full bg-gradient-to-b from-teal-400 to-sky-400 transition-transform duration-300 group-hover:scale-y-100" />
      <CategoryIcon category={r.category} />
      <Link to="/app/requests/$id" params={{ id: r.id }} className="min-w-0 flex-1 after:absolute after:inset-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-subtle">{r.ticketNo}</span>
          {overdue && <span className="rounded-full bg-rose-500/12 px-1.5 py-px text-[10px] font-semibold tracking-wide text-rose-500 uppercase dark:text-rose-300">Overdue</span>}
        </div>
        <p className="mt-0.5 truncate text-sm font-medium transition group-hover:text-teal-600 dark:group-hover:text-teal-200">{r.title}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-subtle">
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{r.location.building}{r.location.room ? ` · ${r.location.room}` : ''}</span>
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Clock className="h-3 w-3" /> {timeAgo(r.createdAt)}
          </span>
        </div>
      </Link>
      <div className="hidden w-24 shrink-0 md:block">
        <PriorityBadge priority={r.priority} />
      </div>
      <div className="w-[104px] shrink-0 text-right sm:text-left">
        <StatusBadge status={r.status} />
      </div>
      {showAssignee && (
        <div className={cn('hidden w-32 shrink-0 items-center gap-2 lg:flex', !assignee && 'text-subtle')}>
          {assignee ? (
            <>
              <Avatar name={assignee.name} size={24} />
              <span className="truncate text-xs">{assignee.name}</span>
            </>
          ) : (
            <span className="text-xs italic">Unassigned</span>
          )}
        </div>
      )}
      {actions ? <div className="relative z-10 shrink-0">{actions}</div> : <ChevronRight className="hidden h-4 w-4 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-teal-400 sm:block" />}
    </div>
  )
}
