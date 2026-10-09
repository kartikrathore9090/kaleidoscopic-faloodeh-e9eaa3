import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BellRing,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Gauge,
  MapPin,
  Menu as MenuIcon,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Users,
  Wrench,
  X,
  Zap,
  GraduationCap,
  HardHat,
  Building2,
  Check,
} from 'lucide-react'
import { Backdrop } from '@/components/Backdrop'
import { Logo, LogoMark } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/Glass'
import { Counter } from '@/components/ui/Counter'
import { StatusTimeline } from '@/components/StatusTimeline'
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { STATUS_FLOW, STATUS_META, cn } from '@/lib/meta'
import { useAuth } from '@/lib/auth'
import { ROLE_META } from '@/lib/meta'
import type { RequestStatus } from '@/lib/types'

export const Route = createFileRoute('/')({ component: Landing })

function Landing() {
  return (
    <div className="relative overflow-x-clip">
      <Backdrop />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <TrustStrip />
        <Features />
        <Lifecycle />
        <Roles />
        <Impact />
        <Testimonial />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

/* ---------------------------------------------------------------- */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const links = [
    ['Features', '#features'],
    ['How it works', '#lifecycle'],
    ['For teams', '#roles'],
    ['Impact', '#impact'],
  ]
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6">
      <nav
        className={cn(
          'mx-auto flex h-16 max-w-6xl items-center gap-6 rounded-2xl px-4 transition-all duration-500',
          scrolled ? 'glass-strong' : 'border border-transparent',
        )}
      >
        <Logo />
        <div className="ml-6 hidden items-center gap-1 md:flex">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-fg/5 hover:text-fg">
              {l}
            </a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link to={ROLE_META[user.role].home} className="hidden sm:block">
              <Button size="md">
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link to="/register" className="hidden sm:block">
                <Button>Get started</Button>
              </Link>
            </>
          )}
          <button className="glass grid h-9 w-9 place-items-center rounded-xl md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="glass-strong mx-auto mt-2 max-w-6xl animate-scale-in rounded-2xl p-3 md:hidden">
          {links.map(([l, h]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm hover:bg-fg/5">
              {l}
            </a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link to="/login">
              <Button variant="glass" className="w-full">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button className="w-full">Get started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

/* ---------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pt-36 pb-20 sm:pt-44 lg:pb-28">
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <a href="#lifecycle" className="glass inline-flex animate-fade-up items-center gap-2 rounded-full py-1 pr-3 pl-1 text-xs text-muted transition hover:text-fg">
            <span className="rounded-full bg-brand px-2 py-0.5 font-semibold text-white">New</span>
            Live status tracking for every request
            <ArrowRight className="h-3 w-3" />
          </a>
          <h1 className="mt-6 animate-fade-up font-display text-[44px] leading-[1.02] font-semibold tracking-[-0.03em] [animation-delay:80ms] sm:text-6xl lg:text-[68px]">
            Campus issues,
            <br />
            <span className="text-gradient">resolved</span> before
            <br className="hidden sm:block" /> they snowball.
          </h1>
          <p className="mt-6 max-w-lg animate-fade-up text-lg leading-relaxed text-muted [animation-delay:160ms]">
            CampusCare is the service desk your university deserves. Students report a broken light or flaky Wi‑Fi in seconds, staff get a clear queue, and operations sees every SLA at a glance.
          </p>
          <div className="mt-9 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:240ms]">
            <Link to="/register">
              <Button size="lg">
                Report an issue <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="glass">
                Try the live demo
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex animate-fade-up items-center gap-4 [animation-delay:320ms]">
            <div className="flex -space-x-2">
              {['Aisha Rahman', 'Leo Martins', 'Priya Nair', 'Marcus Chen', 'Sofia Alvarez'].map((n) => (
                <Avatar key={n} name={n} size={32} />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-muted">
                <span className="font-semibold text-fg">12,400+</span> students on campus
              </p>
            </div>
          </div>
        </div>
        <HeroPreview />
      </div>
    </section>
  )
}

function HeroPreview() {
  const [step, setStep] = useState(1)
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % STATUS_FLOW.length), 2600)
    return () => clearInterval(t)
  }, [])
  const status = STATUS_FLOW[step] as RequestStatus

  return (
    <div className="relative animate-fade-up [animation-delay:200ms] [perspective:1400px]">
      {/* floating glass shapes */}
      <div className="absolute -top-10 -right-6 h-28 w-28 animate-float rounded-[32px] bg-gradient-to-br from-teal-300/50 to-cyan-500/20 blur-[1px] ring-1 ring-white/20 backdrop-blur-xl" />
      <div className="absolute -bottom-10 -left-8 h-20 w-20 animate-float-slow rounded-full bg-gradient-to-br from-sky-400/40 to-indigo-500/20 ring-1 ring-white/20 backdrop-blur-xl [animation-delay:-3s]" />
      <div className="absolute top-1/2 -right-14 hidden h-12 w-12 animate-float rounded-2xl bg-gradient-to-br from-cyan-300/50 to-teal-500/30 ring-1 ring-white/20 [animation-delay:-6s] lg:block" />

      <GlassCard strong className="relative p-6 transition-transform duration-700 lg:[transform:rotateY(-6deg)_rotateX(3deg)] lg:hover:[transform:rotateY(0)_rotateX(0)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-subtle">
            <span className="font-mono">CC-2407</span>
            <span>·</span>
            <span>IT & Network</span>
          </div>
          <div key={status} className="animate-scale-in">
            <StatusBadge status={status} />
          </div>
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">Wi‑Fi drops every few minutes on 3rd floor</h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5" /> Central Library · Study Pods
        </p>
        <div className="mt-7">
          <StatusTimeline status={status} compact />
        </div>
        <div className="mt-7 grid grid-cols-3 gap-3">
          {[
            ['Priority', <PriorityBadge key="p" priority="HIGH" />],
            ['SLA', <span key="s" className="text-sm font-medium">24h</span>],
            ['Assignee', <span key="a" className="flex items-center gap-1.5 text-sm"><Avatar name="Sofia Alvarez" size={20} className="ring-0" /> Sofia</span>],
          ].map(([l, v]) => (
            <div key={l as string} className="rounded-2xl bg-fg/[0.03] p-3 ring-1 ring-inset ring-line">
              <p className="text-[11px] text-subtle">{l}</p>
              <div className="mt-1.5">{v}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* floating notification chips */}
      <div className="glass-strong absolute -top-6 left-4 flex animate-float items-center gap-3 rounded-2xl px-4 py-3 [animation-delay:-2s] sm:-left-10">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-400/15 text-teal-500 dark:text-teal-300">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <div className="text-xs">
          <p className="font-semibold">Projector in LH‑2 fixed</p>
          <p className="text-subtle">Resolved · 2m ago</p>
        </div>
      </div>
      <div className="glass-strong absolute right-2 -bottom-8 flex animate-float-slow items-center gap-3 rounded-2xl px-4 py-3 sm:-right-8">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-sky-400/15 text-sky-500 dark:text-sky-300">
          <Clock3 className="h-4 w-4" />
        </span>
        <div className="text-xs">
          <p className="font-semibold">Avg. first response</p>
          <p className="text-subtle">38 min this week</p>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */

function TrustStrip() {
  const names = ['Northfield University', 'St. Aurelia College', 'Kepler Institute', 'Lakeside Tech', 'Meridian State', 'Halden School of Arts']
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-10">
      <p className="text-center text-xs tracking-[0.2em] text-subtle uppercase">Trusted by facilities teams at</p>
      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
        <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-14">
          {[...names, ...names].map((n, i) => (
            <span key={i} className="flex items-center gap-2 font-display text-lg font-medium whitespace-nowrap text-muted/70">
              <Building2 className="h-4 w-4" /> {n}
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </section>
  )
}

/* ---------------------------------------------------------------- */

function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <Reveal className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.18em] text-teal-600 uppercase dark:text-teal-300">Everything in one place</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Built for the way campuses actually run.</h2>
        <p className="mt-4 text-lg text-muted">From the first report to the final sign‑off, every request has an owner, a deadline and a paper trail.</p>
      </Reveal>

      <div className="mt-14 grid gap-4 md:grid-cols-6">
        <Reveal className="md:col-span-4">
          <GlassCard className="h-full overflow-hidden p-7">
            <FeatureHead icon={<Zap className="h-5 w-5" />} title="Report in under 30 seconds" text="Pick a category, drop a location, describe it. Smart defaults set the priority and route it to the right team." />
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                [Wrench, 'Maintenance'],
                [Zap, 'Electrical'],
                [ShieldCheck, 'Security'],
                [Sparkles, 'Cleaning'],
              ].map(([I, l], i) => {
                const Icon = I as typeof Wrench
                return (
                  <div key={l as string} className={cn('flex items-center gap-2 rounded-2xl px-3 py-3 text-sm ring-1 ring-inset transition hover:-translate-y-0.5', i === 1 ? 'bg-teal-400/12 text-fg ring-teal-400/40' : 'ring-line text-muted')}>
                    <Icon className="h-4 w-4 text-teal-500 dark:text-teal-300" /> {l as string}
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </Reveal>
        <Reveal className="md:col-span-2" delay={80}>
          <GlassCard className="h-full p-7">
            <FeatureHead icon={<BellRing className="h-5 w-5" />} title="Live updates" text="Students see every status change the moment it happens — no more chasing the front desk." />
            <div className="mt-6 space-y-2">
              {(['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as RequestStatus[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2 rounded-xl bg-fg/[0.03] px-3 py-2 text-xs ring-1 ring-inset ring-line" style={{ opacity: 1 - i * 0.22 }}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_META[s].dot)} /> {STATUS_META[s].label}
                  <span className="ml-auto text-subtle">{[1, 14, 52][i]}m ago</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>
        {[
          { icon: <Gauge className="h-5 w-5" />, title: 'SLA-aware priorities', text: 'Urgent issues get a 4‑hour clock. Overdue work surfaces automatically.' },
          { icon: <UserCheck className="h-5 w-5" />, title: 'One-click assignment', text: 'Admins route work to the right technician with workload in view.' },
          { icon: <BarChart3 className="h-5 w-5" />, title: 'Operational analytics', text: 'Volume trends, resolution times and hot‑spot buildings — always current.' },
        ].map((f, i) => (
          <Reveal key={f.title} className="md:col-span-2" delay={i * 80}>
            <GlassCard className="h-full p-7 transition-transform duration-300 hover:-translate-y-1">
              <FeatureHead {...f} />
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function FeatureHead({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <>
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-teal-400/25 to-sky-500/10 text-teal-600 ring-1 ring-teal-400/30 ring-inset dark:text-teal-300">{icon}</span>
      <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 leading-relaxed text-muted">{text}</p>
    </>
  )
}

/* ---------------------------------------------------------------- */

const LIFECYCLE: Record<RequestStatus, { title: string; text: string; icon: React.ReactNode }> = {
  OPEN: { title: 'Submitted by a student', text: 'The request lands in the operations queue with category, location, priority and a ticket number.', icon: <MessageSquareText className="h-5 w-5" /> },
  ASSIGNED: { title: 'Routed to the right person', text: 'An admin assigns a technician from the matching team. The student is notified instantly.', icon: <UserCheck className="h-5 w-5" /> },
  IN_PROGRESS: { title: 'Work underway', text: 'Staff update progress and leave notes from the field, so nobody has to ask “any news?”.', icon: <Wrench className="h-5 w-5" /> },
  RESOLVED: { title: 'Fixed and documented', text: 'A resolution summary is recorded. The student confirms it’s fixed and rates the service.', icon: <ClipboardCheck className="h-5 w-5" /> },
  CLOSED: { title: 'Closed with a full history', text: 'Every step is time‑stamped for audits, SLA reports and recurring‑issue analysis.', icon: <ShieldCheck className="h-5 w-5" /> },
}

function Lifecycle() {
  const [active, setActive] = useState<RequestStatus>('IN_PROGRESS')
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!auto) return
    const t = setInterval(() => setActive((s) => STATUS_FLOW[(STATUS_FLOW.indexOf(s) + 1) % STATUS_FLOW.length]), 3200)
    return () => clearInterval(t)
  }, [auto])
  const info = LIFECYCLE[active]

  return (
    <section id="lifecycle" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium tracking-[0.18em] text-teal-600 uppercase dark:text-teal-300">The request lifecycle</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Five clear stages. Zero guesswork.</h2>
      </Reveal>
      <Reveal delay={100}>
        <GlassCard strong className="mt-14 p-6 sm:p-10">
          <div className="grid grid-cols-5 gap-2">
            {STATUS_FLOW.map((s, i) => {
              const on = s === active
              const passed = STATUS_FLOW.indexOf(active) >= i
              return (
                <button
                  key={s}
                  onClick={() => {
                    setAuto(false)
                    setActive(s)
                  }}
                  className={cn('group rounded-2xl p-2 text-center transition sm:p-4', on ? 'bg-teal-400/10 ring-1 ring-teal-400/30' : 'hover:bg-fg/[0.03]')}
                >
                  <span className={cn('mx-auto block h-1.5 rounded-full transition-all duration-500', passed ? 'bg-gradient-to-r from-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(45,212,191,0.6)]' : 'bg-line')} />
                  <span className={cn('mt-3 block text-[11px] font-medium sm:text-sm', on ? 'text-fg' : 'text-subtle group-hover:text-muted')}>{STATUS_META[s].label}</span>
                </button>
              )
            })}
          </div>
          <div key={active} className="mt-10 grid animate-fade-up items-center gap-8 md:grid-cols-[auto_1fr]">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-brand text-white shadow-[0_10px_40px_-10px_rgba(34,211,238,0.8)]">{info.icon}</span>
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">{info.title}</h3>
              <p className="mt-2 max-w-2xl text-lg leading-relaxed text-muted">{info.text}</p>
            </div>
          </div>
        </GlassCard>
      </Reveal>
    </section>
  )
}

/* ---------------------------------------------------------------- */

const ROLES = [
  {
    key: 'student',
    label: 'Students',
    icon: GraduationCap,
    title: 'Report it, track it, forget about it.',
    points: ['Guided request form with categories & locations', 'Animated status timeline for every ticket', 'Rate the fix once it’s resolved'],
  },
  {
    key: 'staff',
    label: 'Staff',
    icon: HardHat,
    title: 'A focused queue, not an overflowing inbox.',
    points: ['Only the requests assigned to you', 'Filter by status & priority, search anything', 'One-tap status updates with field notes'],
  },
  {
    key: 'admin',
    label: 'Admins',
    icon: Users,
    title: 'Operational clarity across the entire campus.',
    points: ['Live analytics, trends and SLA alerts', 'Assign & reassign with workload in view', 'Manage students, staff and roles'],
  },
]

function Roles() {
  const [tab, setTab] = useState(0)
  const r = ROLES[tab]
  return (
    <section id="roles" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="text-xs font-medium tracking-[0.18em] text-teal-600 uppercase dark:text-teal-300">One platform, three workspaces</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Made for everyone who keeps campus running.</h2>
          <div className="glass mt-8 inline-flex rounded-2xl p-1">
            {ROLES.map((x, i) => (
              <button
                key={x.key}
                onClick={() => setTab(i)}
                className={cn('relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition', tab === i ? 'bg-brand text-white shadow-lg' : 'text-muted hover:text-fg')}
              >
                <x.icon className="h-4 w-4" /> {x.label}
              </button>
            ))}
          </div>
          <div key={r.key} className="mt-8 animate-fade-up">
            <h3 className="font-display text-2xl font-semibold tracking-tight">{r.title}</h3>
            <ul className="mt-5 space-y-3">
              {r.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-muted">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-400/15 text-teal-500 dark:text-teal-300">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <RolePreview tab={tab} />
        </Reveal>
      </div>
    </section>
  )
}

function RolePreview({ tab }: { tab: number }) {
  if (tab === 2) {
    const bars = [42, 58, 35, 71, 88, 64, 77]
    return (
      <GlassCard strong className="p-6">
        <div className="grid grid-cols-3 gap-3">
          {[['Open', 38], ['Resolved', 214], ['SLA met', 96]].map(([l, v], i) => (
            <div key={l} className="rounded-2xl bg-fg/[0.03] p-4 ring-1 ring-inset ring-line">
              <p className="text-xs text-subtle">{l}</p>
              <p className="mt-1 font-display text-2xl font-semibold"><Counter value={v as number} suffix={i === 2 ? '%' : ''} /></p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex h-44 items-end gap-3">
          {bars.map((b, i) => (
            <div key={i} className="flex-1 origin-bottom rounded-t-xl bg-gradient-to-t from-teal-500/40 to-cyan-300/80" style={{ height: `${b}%`, animation: `fade-up .7s ${i * 70}ms both` }} />
          ))}
        </div>
        <p className="mt-3 text-xs text-subtle">Requests resolved per day · last 7 days</p>
      </GlassCard>
    )
  }
  const rows: [string, RequestStatus, 'HIGH' | 'URGENT' | 'MEDIUM' | 'LOW'][] =
    tab === 0
      ? [['Wi‑Fi drops on 3rd floor', 'IN_PROGRESS', 'HIGH'], ['Leaking pipe in washroom', 'ASSIGNED', 'URGENT'], ['Projector flickering', 'RESOLVED', 'MEDIUM']]
      : [['Power outage in Lab 4', 'IN_PROGRESS', 'URGENT'], ['Window latch broken', 'ASSIGNED', 'HIGH'], ['Washing machine stuck', 'ASSIGNED', 'MEDIUM'], ['Water cooler warm', 'IN_PROGRESS', 'LOW']]
  return (
    <GlassCard strong className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-5 py-4">
        <LogoMark className="h-7 w-7" />
        <p className="text-sm font-medium">{tab === 0 ? 'My requests' : 'Assigned to me'}</p>
        <span className="ml-auto rounded-full bg-fg/5 px-2 py-0.5 text-xs text-subtle">{rows.length}</span>
      </div>
      <div className="divide-y divide-line">
        {rows.map(([t, s, p], i) => (
          <div key={t} className="flex items-center gap-3 px-5 py-4" style={{ animation: `fade-up .5s ${i * 80}ms both` }}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t}</p>
              <p className="mt-0.5 font-mono text-[11px] text-subtle">CC-{2407 + i * 7}</p>
            </div>
            <PriorityBadge priority={p} />
            <StatusBadge status={s} />
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

/* ---------------------------------------------------------------- */

function Impact() {
  const stats = [
    { v: 38, s: ' min', l: 'Average first response' },
    { v: 96, s: '%', l: 'Requests resolved within SLA' },
    { v: 4.8, s: '/5', l: 'Student satisfaction', d: 1 },
    { v: 18400, s: '+', l: 'Requests resolved this year' },
  ]
  return (
    <section id="impact" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
      <Reveal>
        <GlassCard className="grid gap-8 p-8 sm:grid-cols-2 sm:p-12 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l}>
              <p className="font-display text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
                <Counter value={s.v} suffix={s.s} decimals={s.d} duration={1800} />
              </p>
              <p className="mt-2 text-sm text-muted">{s.l}</p>
            </div>
          ))}
        </GlassCard>
      </Reveal>
    </section>
  )
}

function Testimonial() {
  return (
    <section className="relative mx-auto max-w-4xl px-5 py-24 text-center">
      <Reveal>
        <p className="font-display text-2xl leading-snug font-medium tracking-tight sm:text-[32px]">
          “We used to run facilities off a shared inbox and a spreadsheet. With CampusCare our backlog dropped by <span className="text-gradient">62%</span> in one semester — and students finally stopped emailing the dean about Wi‑Fi.”
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Avatar name="Elena Ross" size={44} />
          <div className="text-left">
            <p className="font-medium">Dr. Elena Ross</p>
            <p className="text-sm text-subtle">Director of Campus Operations</p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function CTA() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] p-10 text-center sm:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-600 to-sky-700" />
          <div className="absolute -top-24 -right-24 h-72 w-72 animate-float rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-72 w-72 animate-float-slow rounded-full bg-navy-900/40 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">Ready for a calmer campus?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Open the demo as a student, staff member or admin — no setup required.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/login">
                <button className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 font-medium text-navy-900 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl">
                  Launch the demo <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link to="/register">
                <button className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white/10 px-6 font-medium text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20">
                  Create student account
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
        <Logo />
        <p className="text-sm text-subtle">© {new Date().getFullYear()} CampusCare · Campus Service Management</p>
        <div className="flex gap-5 text-sm text-muted">
          <a href="#features" className="hover:text-fg">Features</a>
          <Link to="/login" className="hover:text-fg">Sign in</Link>
          <a href="mailto:helpdesk@campus.edu" className="hover:text-fg">Contact</a>
        </div>
      </div>
    </footer>
  )
}
