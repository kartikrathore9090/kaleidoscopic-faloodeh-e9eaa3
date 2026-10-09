import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Clock3, Inbox, Layers, MapPin, Plus, Search, Timer } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { StatCard } from '@/components/StatCard'
import { RequestRow } from '@/components/RequestRow'
import { StatusTimeline } from '@/components/StatusTimeline'
import { Button } from '@/components/ui/Button'
import { GlassCard, SectionTitle } from '@/components/ui/Glass'
import { Input } from '@/components/ui/Field'
import { RowSkeleton, Skeleton, StatSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { CategoryIcon, PriorityBadge, StatusBadge } from '@/components/ui/Badge'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { useAsync } from '@/lib/hooks'
import { CATEGORY_META, cn, timeAgo } from '@/lib/meta'
import type { Category, ServiceRequest } from '@/lib/types'

export const Route = createFileRoute('/app/student')({
  head: () => ({ meta: [{ title: 'My dashboard · CampusCare' }] }),
  component: StudentDashboard,
})

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
] as const
type Tab = (typeof TABS)[number]['key']

const isActive = (r: ServiceRequest) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(r.status)

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function StudentDashboard() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(() => api.listRequests({ createdBy: user!.id }), [user?.id])
  const [tab, setTab] = useState<Tab>('all')
  const [q, setQ] = useState('')

  const stats = useMemo(() => {
    const all = data ?? []
    const resolved = all.filter((r) => r.resolution)
    const avgH = resolved.length
      ? resolved.reduce((a, r) => a + (+new Date(r.resolution!.resolvedAt) - +new Date(r.createdAt)) / 3_600_000, 0) / resolved.length
      : 0
    return { total: all.length, active: all.filter(isActive).length, resolved: all.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length, avgH }
  }, [data])

  const featured = useMemo(() => (data ?? []).filter(isActive).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))[0], [data])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (data ?? []).filter(
      (r) =>
        (tab === 'all' || (tab === 'active' && isActive(r)) || (tab === 'resolved' && r.status === 'RESOLVED') || (tab === 'closed' && r.status === 'CLOSED')) &&
        (!s || `${r.title} ${r.ticketNo} ${r.location.building}`.toLowerCase().includes(s)),
    )
  }, [data, tab, q])

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Student workspace"
        title={
          <>
            {greeting()}, <span className="text-gradient">{user?.name.split(' ')[0]}</span>
          </>
        }
        description="Report anything that needs fixing on campus and follow it all the way to done."
        actions={
          <Link to="/app/requests/new">
            <Button size="lg">
              <Plus className="h-4 w-4" /> New request
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading && !data ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard index={0} icon={<Layers className="h-5 w-5" />} label="Total requests" value={stats.total} />
            <StatCard index={1} tone="amber" icon={<Clock3 className="h-5 w-5" />} label="In progress" value={stats.active} />
            <StatCard index={2} tone="sky" icon={<CheckCircle2 className="h-5 w-5" />} label="Resolved" value={stats.resolved} />
            <StatCard index={3} tone="violet" icon={<Timer className="h-5 w-5" />} label="Avg. time to fix" value={stats.avgH} decimals={1} suffix="h" />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {/* Featured active request */}
          {loading && !data ? (
            <GlassCard className="p-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-3 h-6 w-2/3" />
              <Skeleton className="mt-8 h-12 w-full" />
            </GlassCard>
          ) : (
            featured && (
              <GlassCard strong className="relative overflow-hidden p-6">
                <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-teal-400/20 blur-3xl" />
                <div className="relative flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-4">
                    <CategoryIcon category={featured.category} size="lg" />
                    <div className="min-w-0">
                      <p className="text-xs text-subtle">
                        Latest active request · <span className="font-mono">{featured.ticketNo}</span> · updated {timeAgo(featured.updatedAt)}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">{featured.title}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                        <MapPin className="h-3.5 w-3.5" /> {featured.location.building}
                        {featured.location.room && ` · ${featured.location.room}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={featured.priority} />
                    <StatusBadge status={featured.status} />
                  </div>
                </div>
                <div className="relative mt-8">
                  <StatusTimeline status={featured.status} activity={featured.activity} />
                </div>
                <div className="relative mt-6 flex justify-end">
                  <Link to="/app/requests/$id" params={{ id: featured.id }}>
                    <Button variant="glass" size="sm">
                      View details <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            )
          )}

          {/* All requests */}
          <GlassCard glow={false} className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-1 overflow-x-auto rounded-xl bg-fg/[0.03] p-1 ring-1 ring-inset ring-line">
                {TABS.map((t) => {
                  const count = (data ?? []).filter((r) => t.key === 'all' || (t.key === 'active' ? isActive(r) : r.status === t.key.toUpperCase())).length
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition', tab === t.key ? 'glass-strong font-medium text-fg' : 'text-muted hover:text-fg')}
                    >
                      {t.label}
                      <span className={cn('rounded-full px-1.5 text-[10px] tabular-nums', tab === t.key ? 'bg-teal-400/20 text-teal-600 dark:text-teal-300' : 'bg-fg/5')}>{count}</span>
                    </button>
                  )
                })}
              </div>
              <div className="sm:w-64">
                <Input placeholder="Search my requests" value={q} onChange={(e) => setQ(e.target.value)} icon={<Search className="h-4 w-4" />} className="h-10" />
              </div>
            </div>
            {error ? (
              <ErrorState error={error} onRetry={reload} />
            ) : loading && !data ? (
              <RowSkeleton />
            ) : list.length === 0 ? (
              data?.length === 0 ? (
                <EmptyState
                  title="No requests yet"
                  description="When something on campus needs fixing, report it here and track it to resolution."
                  action={
                    <Link to="/app/requests/new">
                      <Button>
                        <Plus className="h-4 w-4" /> Report your first issue
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <EmptyState icon={<Inbox className="h-7 w-7" />} title="Nothing matches" description="Try a different tab or clear your search." action={<Button variant="glass" onClick={() => { setTab('all'); setQ('') }}>Reset filters</Button>} />
              )
            ) : (
              <div className="divide-y divide-line">
                {list.map((r, i) => (
                  <RequestRow key={r.id} r={r} index={i} />
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <GlassCard className="p-5">
            <SectionTitle title="Quick report" subtitle="Jump straight into a category" />
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CATEGORY_META) as Category[]).map((c) => {
                const M = CATEGORY_META[c]
                return (
                  <Link
                    key={c}
                    to="/app/requests/new"
                    search={{ category: c }}
                    className="group flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-muted ring-1 ring-inset ring-line transition hover:-translate-y-0.5 hover:bg-teal-400/[0.06] hover:text-fg hover:ring-teal-400/40"
                  >
                    <M.icon className="h-4 w-4 text-teal-500 transition group-hover:scale-110 dark:text-teal-300" />
                    <span className="truncate">{M.label}</span>
                  </Link>
                )
              })}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <SectionTitle title="Good to know" />
            <ul className="space-y-4 text-sm">
              {[
                ['Urgent issues', 'Anything unsafe (sparks, flooding, broken locks) — mark as Urgent for a 4‑hour response.'],
                ['Be specific', 'Room numbers and a short description help technicians bring the right tools.'],
                ['Close the loop', 'Rate resolved requests so we can keep improving campus services.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-400/15 text-xs font-semibold text-teal-600 dark:text-teal-300">{i + 1}</span>
                  <div>
                    <p className="font-medium">{t}</p>
                    <p className="mt-0.5 text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
