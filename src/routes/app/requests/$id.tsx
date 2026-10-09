import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  AlarmClock,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Copy,
  MapPin,
  RotateCcw,
  Send,
  Star,
  Tag,
  UserCheck,
  UserRound,
  FileQuestion,
  ChevronDown,
  Lock,
} from 'lucide-react'
import { StatusTimeline } from '@/components/StatusTimeline'
import { ActivityFeed } from '@/components/ActivityFeed'
import { AssignModal, StatusModal, nextStatuses } from '@/components/RequestActions'
import { Button } from '@/components/ui/Button'
import { GlassCard, SectionTitle } from '@/components/ui/Glass'
import { CategoryTag, PriorityBadge, StatusBadge, CategoryIcon } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Menu, MenuItem } from '@/components/ui/Dropdown'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { useAsync } from '@/lib/hooks'
import { useDirectory } from '@/lib/directory'
import { ROLE_META, STATUS_META, cn, formatDate, timeAgo } from '@/lib/meta'
import type { RequestStatus, ServiceRequest } from '@/lib/types'

export const Route = createFileRoute('/app/requests/$id')({
  head: () => ({ meta: [{ title: 'Request details · CampusCare' }] }),
  component: RequestDetails,
})

function RequestDetails() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  const { data: r, loading, error, reload, setData } = useAsync(() => api.getRequest(id), [id])
  const users = useDirectory()
  const toast = useToast()
  const [statusTarget, setStatusTarget] = useState<RequestStatus | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [busy, setBusy] = useState(false)

  const back = user ? ROLE_META[user.role].home : '/app/student'

  if (error) {
    const notFound = /not found/i.test(error.message)
    return (
      <div className="mx-auto max-w-3xl">
        <GlassCard>
          {notFound ? (
            <EmptyState icon={<FileQuestion className="h-7 w-7" />} title="Request not found" description="It may have been removed, or the link is incorrect." action={<Link to={back}><Button variant="glass">Back to dashboard</Button></Link>} />
          ) : (
            <ErrorState error={error} onRetry={reload} />
          )}
        </GlassCard>
      </div>
    )
  }

  if (loading && !r) return <DetailsSkeleton />
  if (!r || !user) return null

  const reporter = users.get(r.createdBy)
  const assignee = r.assignedTo ? users.get(r.assignedTo) : undefined
  const isOwner = r.createdBy === user.id
  const canWork = user.role === 'ADMIN' || (user.role === 'STAFF' && r.assignedTo === user.id)
  const options = canWork ? nextStatuses(r, user.role) : []
  const done = r.status === 'RESOLVED' || r.status === 'CLOSED'
  const dueMs = r.dueAt ? +new Date(r.dueAt) - Date.now() : 0
  const overdue = !done && dueMs < 0

  const update = (n: ServiceRequest) => setData(n)

  const postComment = async () => {
    if (!comment.trim()) return
    setPosting(true)
    try {
      update(await api.comment(r.id, comment.trim(), user.id))
      setComment('')
      toast({ kind: 'success', title: 'Comment posted' })
    } catch (e) {
      toast({ kind: 'error', title: 'Could not post comment', description: (e as Error).message })
    } finally {
      setPosting(false)
    }
  }

  const studentAction = async (status: RequestStatus) => {
    setBusy(true)
    try {
      update(await api.updateStatus(r.id, { status, note: status === 'CLOSED' ? 'Confirmed fixed by student' : 'Reopened — issue still present' }, user.id))
      toast(status === 'CLOSED' ? { kind: 'success', title: 'Request closed', description: 'Thanks for confirming! Rate the service below.' } : { kind: 'info', title: 'Request reopened', description: 'Campus Operations has been notified.' })
    } finally {
      setBusy(false)
    }
  }

  const rate = async (n: number) => {
    update(await api.rate(r.id, n))
    toast({ kind: 'success', title: 'Thanks for the feedback!', description: `You rated this ${n}/5.` })
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Link to={back} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <CategoryIcon category={r.category} size="lg" />
          <div className="min-w-0">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(r.ticketNo)
                toast({ kind: 'info', title: 'Ticket number copied', description: r.ticketNo })
              }}
              className="group inline-flex items-center gap-1.5 font-mono text-xs text-subtle hover:text-teal-500"
            >
              {r.ticketNo} <Copy className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
            </button>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{r.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={r.status} />
              <PriorityBadge priority={r.priority} />
              {overdue && <span className="rounded-full bg-rose-500/12 px-2.5 py-0.5 text-xs font-medium text-rose-600 ring-1 ring-rose-400/30 ring-inset dark:text-rose-300">Overdue</span>}
              <span className="text-xs text-subtle">· opened {timeAgo(r.createdAt)} by {reporter?.name ?? '…'}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.role === 'ADMIN' && !done && (
            <Button variant="glass" onClick={() => setAssignOpen(true)}>
              <UserCheck className="h-4 w-4" /> {r.assignedTo ? 'Reassign' : 'Assign'}
            </Button>
          )}
          {options.length > 0 && (
            <Menu
              className="w-52"
              trigger={(open) => (
                <Button>
                  Update status <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
                </Button>
              )}
            >
              {(close) =>
                options.map((s) => (
                  <MenuItem key={s} icon={<span className={cn('h-2 w-2 rounded-full', STATUS_META[s].dot)} />} onClick={() => { close(); setStatusTarget(s) }}>
                    {STATUS_META[s].label}
                  </MenuItem>
                ))
              }
            </Menu>
          )}
          {isOwner && r.status === 'RESOLVED' && (
            <>
              <Button variant="glass" onClick={() => studentAction('OPEN')} disabled={busy}>
                <RotateCcw className="h-4 w-4" /> Still broken
              </Button>
              <Button onClick={() => studentAction('CLOSED')} loading={busy}>
                <CheckCircle2 className="h-4 w-4" /> Confirm fixed
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Timeline */}
      <GlassCard strong className="p-6 sm:p-8">
        <StatusTimeline status={r.status} activity={r.activity} />
      </GlassCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <GlassCard className="p-6">
            <SectionTitle title="Description" />
            <p className="leading-relaxed whitespace-pre-line text-muted">{r.description}</p>
          </GlassCard>

          {r.resolution && (
            <GlassCard className="relative overflow-hidden p-6">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-300">
                  <CheckCircle2 className="h-5 w-5" />
                  <h2 className="font-display text-lg font-semibold tracking-tight text-fg">Resolution</h2>
                </div>
                <p className="mt-3 leading-relaxed text-muted">{r.resolution.summary}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-4 text-sm">
                  <span className="flex items-center gap-2">
                    <Avatar name={users.get(r.resolution.resolvedBy)?.name} size={24} />
                    {users.get(r.resolution.resolvedBy)?.name}
                  </span>
                  <span className="text-subtle">{formatDate(r.resolution.resolvedAt)}</span>
                  <span className="text-subtle">
                    Time to fix: <span className="text-fg">{((+new Date(r.resolution.resolvedAt) - +new Date(r.createdAt)) / 3_600_000).toFixed(1)}h</span>
                  </span>
                  <span className="ml-auto">
                    <Stars value={r.resolution.rating} onRate={isOwner && !r.resolution.rating ? rate : undefined} />
                  </span>
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-6">
            <SectionTitle title="Activity" subtitle={`${r.activity.length} events`} />
            {r.status !== 'CLOSED' ? (
              <div className="mb-6 flex gap-3">
                <Avatar name={user.name} size={36} />
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && postComment()}
                    placeholder="Add an update or ask a question…"
                    rows={2}
                    className="glass w-full resize-none rounded-2xl px-4 py-3 text-sm placeholder:text-subtle focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/15 focus:outline-none"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-subtle">⌘ + Enter to send</span>
                    <Button size="sm" onClick={postComment} loading={posting} disabled={!comment.trim()}>
                      {!posting && <Send className="h-3.5 w-3.5" />} Comment
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mb-6 flex items-center gap-2 rounded-xl bg-fg/[0.03] px-4 py-3 text-sm text-subtle ring-1 ring-inset ring-line">
                <Lock className="h-4 w-4" /> This request is closed. The history below is read‑only.
              </p>
            )}
            <ActivityFeed activity={r.activity} />
          </GlassCard>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <GlassCard className="p-5">
            <SectionTitle title="Details" />
            <dl className="space-y-4 text-sm">
              <Detail icon={<Tag className="h-4 w-4" />} label="Category">
                <CategoryTag category={r.category} className="text-sm text-fg" />
              </Detail>
              <Detail icon={<MapPin className="h-4 w-4" />} label="Location">
                {r.location.building}
                {r.location.room && <span className="block text-xs text-subtle">{r.location.room}</span>}
              </Detail>
              <Detail icon={<UserRound className="h-4 w-4" />} label="Reported by">
                <span className="flex items-center gap-2">
                  <Avatar name={reporter?.name} size={22} /> {reporter?.name}
                </span>
                {reporter?.studentId && <span className="block pl-[30px] font-mono text-[11px] text-subtle">{reporter.studentId}</span>}
              </Detail>
              <Detail icon={<UserCheck className="h-4 w-4" />} label="Assigned to">
                {assignee ? (
                  <span className="flex items-center gap-2">
                    <Avatar name={assignee.name} size={22} /> {assignee.name}
                  </span>
                ) : (
                  <span className="text-subtle italic">Awaiting assignment</span>
                )}
                {assignee?.department && <span className="block pl-[30px] text-[11px] text-subtle">{assignee.department}</span>}
              </Detail>
              <Detail icon={<CalendarDays className="h-4 w-4" />} label="Created">
                {formatDate(r.createdAt)}
              </Detail>
              {r.dueAt && (
                <Detail icon={<AlarmClock className="h-4 w-4" />} label="Target resolution">
                  <span className={cn(overdue && 'text-rose-500 dark:text-rose-300')}>{formatDate(r.dueAt)}</span>
                  {!done && (
                    <span className={cn('block text-[11px]', overdue ? 'text-rose-500 dark:text-rose-300' : 'text-subtle')}>
                      {overdue ? `Overdue by ${fmtDur(-dueMs)}` : `${fmtDur(dueMs)} remaining`}
                    </span>
                  )}
                </Detail>
              )}
            </dl>
          </GlassCard>
        </div>
      </div>

      <StatusModal request={statusTarget ? r : null} target={statusTarget} onClose={() => setStatusTarget(null)} onDone={update} />
      <AssignModal request={assignOpen ? r : null} onClose={() => setAssignOpen(false)} onDone={update} />
    </div>
  )
}

function fmtDur(ms: number) {
  const h = ms / 3_600_000
  return h >= 48 ? `${Math.round(h / 24)} days` : h >= 1 ? `${Math.round(h)}h` : `${Math.max(1, Math.round(h * 60))}m`
}

function Detail({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-subtle">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-subtle">{label}</dt>
        <dd className="mt-0.5">{children}</dd>
      </div>
    </div>
  )
}

function Stars({ value, onRate }: { value?: number; onRate?: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value || 0
  if (!onRate && !value) return <span className="text-xs text-subtle">Not rated yet</span>
  return (
    <span className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {onRate && !hover && <span className="mr-1 text-xs text-subtle">Rate this fix</span>}
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          disabled={!onRate}
          onMouseEnter={() => onRate && setHover(n)}
          onClick={() => onRate?.(n)}
          className={cn('transition', onRate && 'hover:scale-125')}
          aria-label={`${n} stars`}
        >
          <Star className={cn('h-4 w-4', n <= shown ? 'fill-amber-400 text-amber-400' : 'text-subtle')} />
        </button>
      ))}
    </span>
  )
}

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      <Skeleton className="mb-6 h-4 w-16" />
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-5 w-48 rounded-full" />
        </div>
      </div>
      <Skeleton className="mt-8 h-32 w-full rounded-3xl" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    </div>
  )
}
