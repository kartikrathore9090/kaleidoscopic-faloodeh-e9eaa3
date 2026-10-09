import { Check, CircleDot, ClipboardCheck, Hammer, Lock, UserCheck } from 'lucide-react'
import { STATUS_FLOW, STATUS_META, cn, formatDate } from '@/lib/meta'
import type { Activity, RequestStatus } from '@/lib/types'

const icons = { OPEN: CircleDot, ASSIGNED: UserCheck, IN_PROGRESS: Hammer, RESOLVED: ClipboardCheck, CLOSED: Lock }

/** Animated stepper: Open → Assigned → In Progress → Resolved → Closed */
export function StatusTimeline({ status, activity, compact }: { status: RequestStatus; activity?: Activity[]; compact?: boolean }) {
  const idx = STATUS_FLOW.indexOf(status)
  const pct = (idx / (STATUS_FLOW.length - 1)) * 100
  const when = (s: RequestStatus) => [...(activity ?? [])].reverse().find((a) => a.status === s)?.at

  return (
    <div className="relative">
      {/* track */}
      <div className={cn('absolute right-[10%] left-[10%] h-[3px] rounded-full bg-line', compact ? 'top-[13px]' : 'top-[19px]')}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 shadow-[0_0_14px_rgba(34,211,238,0.7)] transition-[width] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="relative grid grid-cols-5">
        {STATUS_FLOW.map((s, i) => {
          const Icon = icons[s]
          const done = i < idx
          const current = i === idx
          const t = when(s)
          return (
            <li key={s} className="flex flex-col items-center text-center" style={{ animation: `fade-up 0.6s ${i * 90}ms both cubic-bezier(0.22,1,0.36,1)` }}>
              <span
                className={cn(
                  'relative grid place-items-center rounded-full transition-all duration-500',
                  compact ? 'h-7 w-7' : 'h-10 w-10',
                  done && 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-[0_0_18px_-2px_rgba(45,212,191,0.8)]',
                  current && 'bg-bg text-teal-500 ring-2 ring-teal-400 dark:text-teal-300 shadow-[0_0_24px_-2px_rgba(34,211,238,0.8)]',
                  !done && !current && 'glass text-subtle',
                )}
              >
                {current && <span className="absolute inset-0 rounded-full bg-teal-400/40 animate-pulse-ring" />}
                {done ? <Check className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={3} /> : <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
              </span>
              <span className={cn('mt-2 font-medium', compact ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs', current ? 'text-fg' : done ? 'text-muted' : 'text-subtle')}>
                {STATUS_META[s].label}
              </span>
              {!compact && <span className="mt-0.5 hidden text-[10px] text-subtle sm:block">{t ? formatDate(t) : '—'}</span>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
