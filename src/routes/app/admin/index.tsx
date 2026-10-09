import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, Building2, CalendarRange, Download, Gauge, Inbox, Layers, Smile, Timer, UserPlus, Siren } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { StatCard } from '@/components/StatCard'
import { CategoryBars, StatusDonut, TrendChart } from '@/components/Charts'
import { AssignModal } from '@/components/RequestActions'
import { Button } from '@/components/ui/Button'
import { GlassCard, SectionTitle } from '@/components/ui/Glass'
import { CategoryIcon, PriorityBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton, StatSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Select } from '@/components/ui/Dropdown'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/api'
import { useAsync } from '@/lib/hooks'
import { monthlyVolume } from '@/lib/fixtures'
import { CATEGORY_META, PRIORITY_META, STATUS_FLOW, STATUS_META, cn, timeAgo } from '@/lib/meta'
import type { Category, ServiceRequest } from '@/lib/types'

export const Route = createFileRoute('/app/admin/')({
  head: () => ({ meta: [{ title: 'Operations overview · CampusCare' }] }),
  component: AdminDashboard,
})

const ACTIVE = ['OPEN', 'ASSIGNED', 'IN_PROGRESS']

function AdminDashboard() {
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAsync(() => Promise.all([api.listRequests(), api.listUsers('STAFF')]), [])
  const [assigning, setAssigning] = useState<ServiceRequest | null>(null)
  const [range, setRange] = useState<'6m' | '30d' | '7d'>('6m')
  const [requests, staff] = data ?? [[], []]

  const m = useMemo(() => {
    const now = Date.now()
    const resolved = requests.filter((r) => r.resolution)
    const avgH = resolved.length ? resolved.reduce((a, r) => a + (+new Date(r.resolution!.resolvedAt) - +new Date(r.createdAt)), 0) / resolved.length / 3_600_000 : 0
    const withinSla = resolved.filter((r) => r.dueAt && +new Date(r.resolution!.resolvedAt) <= +new Date(r.dueAt)).length
    const rated = resolved.filter((r) => r.resolution!.rating)
    const csat = rated.length ? rated.reduce((a, r) => a + r.resolution!.rating!, 0) / rated.length : 0
    const overdue = requests.filter((r) => ACTIVE.includes(r.status) && r.dueAt && +new Date(r.dueAt) < now)
    const urgentOpen = requests.filter((r) => ACTIVE.includes(r.status) && r.priority === 'URGENT')
    const alerts = [...new Map([...urgentOpen, ...overdue].map((r) => [r.id, r])).values()].sort((a, b) => PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight)
    const unassigned = requests.filter((r) => r.status === 'OPEN' && !r.assignedTo).sort((a, b) => PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight || +new Date(a.createdAt) - +new Date(b.createdAt))
    const cats = (Object.keys(CATEGORY_META) as Category[]).map((c) => [CATEGORY_META[c].label, requests.filter((r) => r.category === c).length] as const).sort((a, b) => b[1] - a[1])
    const buildings = Object.entries(requests.reduce<Record<string, number>>((acc, r) => ((acc[r.location.building] = (acc[r.location.building] ?? 0) + 1), acc), {})).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const workload = staff.map((s) => ({ s, active: requests.filter((r) => r.assignedTo === s.id && ['ASSIGNED', 'IN_PROGRESS'].includes(r.status)).length, done: requests.filter((r) => r.resolution?.resolvedBy === s.id).length })).sort((a, b) => b.active - a.active)
    return {
      total: requests.length,
      active: requests.filter((r) => ACTIVE.includes(r.status)).length,
      avgH,
      sla: resolved.length ? (withinSla / resolved.length) * 100 : 0,
      csat,
      alerts,
      unassigned,
      cats,
      buildings,
      workload,
      status: STATUS_FLOW.map((s) => requests.filter((r) => r.status === s).length),
    }
  }, [requests, staff])

  const trend = useMemo(() => {
    if (range === '6m') return monthlyVolume
    const days = range === '7d' ? 7 : 30
    const labels = Array.from({ length: days }, (_, i) => new Date(Date.now() - (days - 1 - i) * 86_400_000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    const seed = (i: number, k: number) => Math.round(5 + Math.abs(Math.sin(i * 1.7 + k)) * 6 + (i % 7 < 5 ? 3 : -2))
    return { labels, created: labels.map((_, i) => seed(i, 0.4)), resolved: labels.map((_, i) => Math.max(seed(i, 1.1) - 1, 2)) }
  }, [range])

  const replace = (n: ServiceRequest) => setData((d) => (d ? [d[0].map((x) => (x.id === n.id ? n : x)), d[1]] : d))
  const ready = !loading || !!data

  if (error)
    return (
      <GlassCard className="mx-auto max-w-3xl">
        <ErrorState error={error} onRetry={reload} />
      </GlassCard>
    )

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Campus operations"
        title="Operations overview"
        description="Live health of every service request across campus."
        actions={
          <>
            <span className="glass inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-muted">
              <CalendarRange className="h-4 w-4" /> Fall semester 2026
            </span>
            <Button variant="glass" onClick={() => toast({ kind: 'success', title: 'Report exported', description: 'campuscare-operations-report.csv is ready.' })}>
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      {/* Priority alerts */}
      {ready && m.alerts.length > 0 && (
        <div className="relative mb-6 animate-fade-up overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-transparent p-[1px]">
          <div className="glass relative flex flex-col gap-4 rounded-3xl p-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-500/15 text-rose-500 dark:text-rose-300">
                <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-rose-500/30" />
                <Siren className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display font-semibold">
                  {m.alerts.length} priority alert{m.alerts.length > 1 && 's'}
                </p>
                <p className="text-sm text-muted">Urgent or past their target time</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
              {m.alerts.slice(0, 6).map((r) => (
                <Link key={r.id} to="/app/requests/$id" params={{ id: r.id }} className="group flex w-64 shrink-0 items-center gap-3 rounded-2xl bg-fg/[0.03] px-3 py-2.5 ring-1 ring-inset ring-line transition hover:ring-rose-400/40">
                  <AlertTriangle className={cn('h-4 w-4 shrink-0', r.priority === 'URGENT' ? 'text-rose-400' : 'text-amber-400')} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium group-hover:text-rose-500 dark:group-hover:text-rose-200">{r.title}</p>
                    <p className="text-[11px] text-subtle">
                      {r.ticketNo} · {STATUS_META[r.status].label} · {timeAgo(r.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {!ready ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard index={0} icon={<Layers className="h-5 w-5" />} label="Active requests" value={m.active} delta={-12} spark={[9, 12, 10, 14, 11, 13, 9, 8]} />
            <StatCard index={1} tone="sky" icon={<Timer className="h-5 w-5" />} label="Avg. resolution time" value={m.avgH} decimals={1} suffix="h" delta={-8} spark={[30, 28, 31, 26, 24, 22, 23, 20]} />
            <StatCard index={2} tone="violet" icon={<Gauge className="h-5 w-5" />} label="Resolved within SLA" value={m.sla} suffix="%" delta={4} spark={[82, 85, 84, 88, 90, 89, 93, 95]} />
            <StatCard index={3} tone="amber" icon={<Smile className="h-5 w-5" />} label="Student satisfaction" value={m.csat} decimals={1} suffix="/5" delta={2} spark={[4.2, 4.3, 4.4, 4.3, 4.5, 4.6, 4.6, 4.7]} />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-2">
          <SectionTitle
            title="Request volume"
            subtitle="Created vs. resolved"
            action={
              <Select
                value={range}
                onChange={setRange}
                align="right"
                className="w-36"
                options={[
                  { value: '7d', label: 'Last 7 days' },
                  { value: '30d', label: 'Last 30 days' },
                  { value: '6m', label: 'Last 6 months' },
                ]}
              />
            }
          />
          <div className="mb-3 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Created</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-violet-400" /> Resolved</span>
          </div>
          <div className="h-64">{ready ? <TrendChart key={range} {...trend} /> : <Skeleton className="h-full w-full rounded-2xl" />}</div>
        </GlassCard>
        <GlassCard className="p-6">
          <SectionTitle title="By status" subtitle={`${m.total} total requests`} />
          <div className="relative mx-auto h-44 w-44">
            {ready ? <StatusDonut labels={STATUS_FLOW.map((s) => STATUS_META[s].label)} values={m.status} colors={STATUS_FLOW.map((s) => STATUS_META[s].hex)} /> : <Skeleton className="h-full w-full rounded-full" />}
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-display text-3xl font-semibold">{m.active}</p>
                <p className="text-[11px] text-subtle">active</p>
              </div>
            </div>
          </div>
          <ul className="mt-5 space-y-2">
            {STATUS_FLOW.map((s, i) => (
              <li key={s} className="flex items-center gap-2.5 text-sm">
                <span className={cn('h-2 w-2 rounded-full', STATUS_META[s].dot)} />
                <span className="text-muted">{STATUS_META[s].label}</span>
                <span className="ml-auto font-medium tabular-nums">{m.status[i]}</span>
                <span className="w-10 text-right text-xs text-subtle tabular-nums">{m.total ? Math.round((m.status[i] / m.total) * 100) : 0}%</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Assignment queue */}
        <GlassCard glow={false} className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight">Needs assignment</h2>
              <p className="text-sm text-muted">Open requests waiting for a technician</p>
            </div>
            <span className="rounded-full bg-sky-400/12 px-2.5 py-1 text-xs font-medium text-sky-600 ring-1 ring-sky-400/25 ring-inset dark:text-sky-300">{m.unassigned.length} waiting</span>
          </div>
          {!ready ? (
            <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}</div>
          ) : m.unassigned.length === 0 ? (
            <EmptyState icon={<Inbox className="h-7 w-7" />} title="Every request has an owner" description="New submissions that need routing will show up here." />
          ) : (
            <div className="divide-y divide-line">
              {m.unassigned.map((r, i) => (
                <div key={r.id} className="group relative flex items-center gap-4 px-6 py-4 transition hover:bg-teal-400/[0.04]" style={{ animation: `fade-up .45s ${i * 50}ms both` }}>
                  <CategoryIcon category={r.category} />
                  <Link to="/app/requests/$id" params={{ id: r.id }} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium group-hover:text-teal-600 dark:group-hover:text-teal-200">{r.title}</p>
                    <p className="mt-0.5 truncate text-xs text-subtle">
                      <span className="font-mono">{r.ticketNo}</span> · {r.location.building} · {timeAgo(r.createdAt)}
                    </p>
                  </Link>
                  <span className="hidden sm:block">
                    <PriorityBadge priority={r.priority} />
                  </span>
                  <Button size="sm" onClick={() => setAssigning(r)}>
                    <UserPlus className="h-3.5 w-3.5" /> Assign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Workload */}
        <GlassCard className="p-6">
          <SectionTitle title="Staff workload" subtitle="Active assignments" action={<Link to="/app/admin/users" className="text-xs text-teal-600 hover:underline dark:text-teal-300">Manage</Link>} />
          <ul className="space-y-4">
            {!ready && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
            {m.workload.map(({ s, active, done }) => (
              <li key={s.id} className="flex items-center gap-3">
                <Avatar name={s.name} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-subtle tabular-nums">{active} active · {done} done</p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                    <div className={cn('h-full rounded-full transition-[width] duration-1000', active >= 4 ? 'bg-gradient-to-r from-amber-400 to-rose-400' : 'bg-gradient-to-r from-teal-400 to-cyan-400')} style={{ width: `${Math.min(active / 5, 1) * 100}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-2">
          <SectionTitle title="Requests by category" subtitle="All time, this semester" />
          <div className="h-64">{ready ? <CategoryBars labels={m.cats.map((c) => c[0])} values={m.cats.map((c) => c[1])} /> : <Skeleton className="h-full w-full rounded-2xl" />}</div>
        </GlassCard>
        <GlassCard className="p-6">
          <SectionTitle title="Hot-spot buildings" subtitle="Most reported locations" />
          <ol className="space-y-3">
            {m.buildings.map(([b, n], i) => (
              <li key={b} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 ring-1 ring-inset ring-line transition hover:bg-fg/[0.03]">
                <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-semibold', i === 0 ? 'bg-brand text-white' : 'bg-fg/5 text-muted')}>{i + 1}</span>
                <Building2 className="h-4 w-4 shrink-0 text-subtle" />
                <span className="min-w-0 flex-1 truncate text-sm">{b}</span>
                <span className="text-sm font-medium tabular-nums">{n}</span>
              </li>
            ))}
          </ol>
          <Link to="/app/staff" className="mt-5 flex items-center justify-center gap-1.5 text-sm text-teal-600 hover:underline dark:text-teal-300">
            Open team queue <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </GlassCard>
      </div>

      <AssignModal request={assigning} onClose={() => setAssigning(null)} onDone={replace} />
    </div>
  )
}
