import { CheckCircle2, MessageSquare, PlusCircle, RefreshCw, UserPlus } from 'lucide-react'
import { STATUS_META, cn, formatDate, timeAgo } from '@/lib/meta'
import type { Activity } from '@/lib/types'
import { useDirectory } from '@/lib/directory'
import { Avatar } from './ui/Avatar'

const icon = {
  CREATED: PlusCircle,
  ASSIGNED: UserPlus,
  STATUS_CHANGED: RefreshCw,
  COMMENT: MessageSquare,
  RESOLVED: CheckCircle2,
}

export function ActivityFeed({ activity }: { activity: Activity[] }) {
  const users = useDirectory()
  const items = [...activity].reverse()
  return (
    <ol className="relative space-y-1">
      {items.map((a, i) => {
        const Icon = icon[a.type]
        const u = users.get(a.actorId)
        const isComment = a.type === 'COMMENT'
        return (
          <li key={a.id} className="relative flex gap-4 pb-5" style={{ animation: `fade-up 0.5s ${Math.min(i, 8) * 60}ms both` }}>
            {i < items.length - 1 && <span className="absolute top-9 bottom-0 left-[17px] w-px bg-gradient-to-b from-teal-400/40 to-line" />}
            <span
              className={cn(
                'relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ring-inset',
                a.type === 'RESOLVED' ? 'bg-teal-400/15 text-teal-500 ring-teal-400/30 dark:text-teal-300' : 'glass text-muted ring-transparent',
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="font-medium">{u?.name ?? 'System'}</span>
                <span className="text-muted">
                  {isComment ? 'commented' : a.message}
                </span>
                {a.status && a.type !== 'CREATED' && (
                  <span className="inline-flex items-center gap-1 text-xs text-subtle">
                    → <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_META[a.status].dot)} /> {STATUS_META[a.status].label}
                  </span>
                )}
              </div>
              <time className="text-xs text-subtle" title={formatDate(a.at)}>
                {timeAgo(a.at)}
              </time>
              {isComment && (
                <div className="glass mt-2 flex gap-3 rounded-2xl rounded-tl-md p-3 text-sm leading-relaxed text-muted">
                  <Avatar name={u?.name} size={22} className="ring-0" />
                  <p>{a.message}</p>
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
