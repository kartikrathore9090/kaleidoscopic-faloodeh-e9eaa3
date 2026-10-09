import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { AlarmClock, CheckCheck, ClipboardList, Hammer, LayoutGrid, List, MapPin, Play, CheckCircle2, Inbox } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { StatCard } from '@/components/StatCard'
import { RequestRow } from '@/components/RequestRow'
import { FilterBar, applyFilters, defaultFilters, type FilterState } from '@/components/Filters'
import { StatusModal } from '@/components/RequestActions'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/Glass'
import { CategoryIcon, PriorityBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { RowSkeleton, Skeleton, StatSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { useAsync } from '@/lib/hooks'
import { useDirectory } from '@/lib/directory'
import { STATUS_META, cn, timeAgo } from '@/lib/meta'
import type { RequestStatus, ServiceRequest } from '@/lib/types'

export const Route = createFileRoute('/app/staff')({
  head: () => ({ meta: [{ title: 'Work queue · CampusCare' }] }),
  component: StaffDashboard,
})

const BOARD: RequestStatus[] = ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

function StaffDashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAsync(() => (isAdmin ? api.listRequests() : api.listRequests({ assignedTo: user!.id })).then((l) => l.filter((r) => r.assignedTo)), [user?.id])
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters, sort: 'priority' })
  const [view, setView] = useState<'list' | 'board'>('list')
  const [target, setTarget] = useState<{ r: ServiceRequest; s: RequestStatus } | null>(null)
  const [starting, setStarting] = useState<string | null>(null)

  const list = useMemo(() => applyFilters(data ?? [], filters), [data, filters])
  const stats = useMemo(() => {
    const all = data ?? []
    const weekAgo = Date.now() - 7 * 86_400_000
    return {
      assigned: all.filter((r) => r.status === 'ASSIGNED').length,
      progress: all.filter((r) => r.status === 'IN_PROGRESS').length,
      resolved: all.filter((r) => r.resolution && +new Date(r.resolution.resolvedAt) > weekAgo).length,
      overdue: all.filter((r) => r.dueAt && !['RESOLVED', 'CLOSED'].includes(r.status) && +new Date(r.dueAt) < Date.now()).length,
    }
  }, [data])

  const replace = (n: ServiceRequest) => setData((d) => d?.map((x) => (x.id === n.id ? n : x)))

  const start = async (r: ServiceRequest) => {
    setStarting(r.id)
    try {
      replace(await api.updateStatus(r.id, { status: 'IN_PROGRESS' }, user!.id))
      toast({ kind: 'success', title: 'Work started', description: `${r.ticketNo} moved to In Progress.` })
    } catch (e) {
      toast({ kind: 'error', title: 'Update failed', description: (e as Error).message })
    } finally {
      setStarting(null)
    }
  }

  const quick = (r: ServiceRequest) => {
    const mine = r.assignedTo === user?.id || isAdmin
    if (!mine) return null
    if (r.status === 'ASSIGNED')
      return (
        <Button size="sm" variant="glass" loading={starting === r.id} onClick={() => start(r)}>
          {starting !== r.id && <Play className="h-3.5 w-3.5" />} Start
        </Button>
      )
    if (r.status === 'IN_PROGRESS')
      return (
        <Button size="sm" onClick={() => setTarget({ r, s: 'RESOLVED' })}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
        </Button>
      )
    return null
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow={isAdmin ? 'Staff view' : 'Staff workspace'}
        title={isAdmin ? 'Team work queue' : 'My work queue'}
        description={isAdmin ? 'Everything currently assigned across all technicians.' : 'Requests assigned to you, sorted by what matters most.'}
        actions={
          <div className="glass flex rounded-xl p-1">
            {(['list', 'board'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm capitalize transition', view === v ? 'bg-brand text-white shadow' : 'text-muted hover:text-fg')}>
                {v === 'list' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />} {v}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading && !data ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard index={0} tone="violet" icon={<ClipboardList className="h-5 w-5" />} label="Awaiting start" value={stats.assigned} />
            <StatCard index={1} tone="amber" icon={<Hammer className="h-5 w-5" />} label="In progress" value={stats.progress} />
            <StatCard index={2} icon={<CheckCheck className="h-5 w-5" />} label="Resolved this week" value={stats.resolved} />
            <StatCard index={3} tone="rose" icon={<AlarmClock className="h-5 w-5" />} label="Overdue" value={stats.overdue} />
          </>
        )}
      </div>

      <GlassCard glow={false} className="relative z-20 mt-6 p-3">
        <FilterBar value={filters} onChange={setFilters} statuses={BOARD} />
      </GlassCard>

      {error ? (
        <GlassCard className="mt-6">
          <ErrorState error={error} onRetry={reload} />
        </GlassCard>
      ) : view === 'list' ? (
        <GlassCard glow={false} className="mt-4 overflow-hidden">
          {loading && !data ? (
            <RowSkeleton rows={6} />
          ) : list.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-7 w-7" />}
              title={data?.length ? 'No requests match your filters' : 'Your queue is clear'}
              description={data?.length ? 'Try clearing a filter or searching for something else.' : 'New assignments will appear here the moment an admin routes them to you.'}
              action={data?.length ? <Button variant="glass" onClick={() => setFilters(defaultFilters)}>Clear filters</Button> : undefined}
            />
          ) : (
            <div className="divide-y divide-line">
              {list.map((r, i) => (
                <RequestRow key={r.id} r={r} index={i} showAssignee={isAdmin} actions={quick(r)} />
              ))}
            </div>
          )}
        </GlassCard>
      ) : (
        <div className="mt-4 grid gap-4 overflow-x-auto pb-2 md:grid-cols-2 xl:grid-cols-4">
          {BOARD.map((s) => {
            const col = list.filter((r) => r.status === s)
            return (
              <div key={s} className="glass min-w-0 rounded-3xl p-3">
                <div className="flex items-center gap-2 px-2 pt-1 pb-3">
                  <span className={cn('h-2 w-2 rounded-full', STATUS_META[s].dot)} />
                  <p className="text-sm font-medium">{STATUS_META[s].label}</p>
                  <span className="ml-auto rounded-full bg-fg/5 px-2 text-xs text-subtle tabular-nums">{col.length}</span>
                </div>
                <div className="space-y-2.5">
                  {loading && !data && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                  {!loading && col.length === 0 && <p className="rounded-2xl border border-dashed border-glass-border py-8 text-center text-xs text-subtle">Nothing here</p>}
                  {col.map((r, i) => (
                    <BoardCard key={r.id} r={r} index={i} action={quick(r)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <StatusModal request={target?.r ?? null} target={target?.s ?? null} onClose={() => setTarget(null)} onDone={replace} />
    </div>
  )
}

function BoardCard({ r, index, action }: { r: ServiceRequest; index: number; action: React.ReactNode }) {
  const users = useDirectory()
  const a = r.assignedTo ? users.get(r.assignedTo) : undefined
  return (
    <div className="glass-strong group relative rounded-2xl p-3.5 transition hover:-translate-y-0.5 hover:border-teal-400/40" style={{ animation: `fade-up .45s ${index * 50}ms both` }}>
      <Link to="/app/requests/$id" params={{ id: r.id }} className="after:absolute after:inset-0">
        <div className="flex items-start gap-2.5">
          <CategoryIcon category={r.category} size="sm" />
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-subtle">{r.ticketNo}</p>
            <p className="line-clamp-2 text-sm leading-snug font-medium group-hover:text-teal-600 dark:group-hover:text-teal-200">{r.title}</p>
          </div>
        </div>
        <p className="mt-2 flex items-center gap-1 truncate text-[11px] text-subtle">
          <MapPin className="h-3 w-3 shrink-0" /> {r.location.building}
        </p>
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <PriorityBadge priority={r.priority} />
        <span className="text-[11px] text-subtle">{timeAgo(r.updatedAt)}</span>
        <span className="ml-auto">{a && <Avatar name={a.name} size={22} />}</span>
      </div>
      {action && <div className="relative z-10 mt-3 [&>button]:w-full">{action}</div>}
    </div>
  )
}
