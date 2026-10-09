import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  PlusCircle,
  Search,
  Settings2,
  Users,
  X,
  Command,
  Loader2,
  Repeat,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { api, isMockApi } from '@/lib/api'
import { ROLE_META, cn, timeAgo, type AppPath } from '@/lib/meta'
import type { Role, ServiceRequest } from '@/lib/types'
import { useAsync, useDebounced } from '@/lib/hooks'
import { Backdrop } from './Backdrop'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { Avatar } from './ui/Avatar'
import { Menu, MenuItem } from './ui/Dropdown'
import { RoleBadge, StatusBadge, CategoryIcon } from './ui/Badge'
import { Modal } from './ui/Modal'
import { DEMO_PASSWORD } from '@/lib/fixtures'
import { useToast } from './ui/Toast'

type NavItem = { to: AppPath; label: string; icon: React.ComponentType<{ className?: string }> }

const NAV: Record<Role, NavItem[]> = {
  STUDENT: [
    { to: '/app/student', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/requests/new', label: 'New request', icon: PlusCircle },
  ],
  STAFF: [{ to: '/app/staff', label: 'My queue', icon: ClipboardList }],
  ADMIN: [
    { to: '/app/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/app/admin/users', label: 'Users', icon: Users },
    { to: '/app/staff', label: 'Staff view', icon: ClipboardList },
  ],
}

// Which roles may open a given app section.
const ACCESS: [string, Role[]][] = [
  ['/app/admin', ['ADMIN']],
  ['/app/staff', ['STAFF', 'ADMIN']],
  ['/app/student', ['STUDENT']],
  ['/app/requests/new', ['STUDENT']],
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname.replace(/(.)\/$/, '$1') })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    if (ready && !user) navigate({ to: '/login', search: { redirect: pathname } as never })
  }, [ready, user, navigate, pathname])

  useEffect(() => {
    if (!user) return
    const rule = ACCESS.find(([p]) => pathname.startsWith(p))
    if (rule && !rule[1].includes(user.role)) navigate({ to: ROLE_META[user.role].home })
  }, [user, pathname, navigate])

  useEffect(() => setMobileOpen(false), [pathname])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  if (!ready || !user) return <ShellLoading />

  const nav = NAV[user.role]
  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-8">
        <Logo to={ROLE_META[user.role].home} />
      </div>
      <p className="px-6 pb-2 text-[11px] font-medium tracking-[0.14em] text-subtle uppercase">{ROLE_META[user.role].label} workspace</p>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => {
          const active = pathname === n.to || (n.to !== '/app/admin' && pathname.startsWith(n.to + '/'))
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                active ? 'bg-teal-400/12 font-medium text-fg' : 'text-muted hover:bg-fg/[0.04] hover:text-fg',
              )}
            >
              {active && <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-teal-300 to-sky-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />}
              <n.icon className={cn('h-[18px] w-[18px] transition', active ? 'text-teal-500 dark:text-teal-300' : 'group-hover:text-teal-400')} />
              {n.label}
            </Link>
          )
        })}
      </nav>
      <div className="m-3 rounded-2xl bg-gradient-to-br from-teal-400/15 via-cyan-400/10 to-sky-500/10 p-4 ring-1 ring-inset ring-teal-400/20">
        <p className="text-sm font-medium">Campus Helpdesk</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">Emergencies (fire, medical, security): call ext. 4000 — available 24/7.</p>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen">
      <Backdrop grid={false} />
      {/* desktop sidebar */}
      <aside className="glass fixed inset-y-3 left-3 z-30 hidden w-64 rounded-3xl lg:block">{sidebar}</aside>
      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-navy-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="glass-strong absolute inset-y-0 left-0 w-72 animate-[fade-in_.25s_ease] rounded-r-3xl">
            <button className="absolute top-6 right-4 rounded-lg p-1.5 text-muted" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="relative z-10 lg:pl-[17.5rem]">
        <header className="sticky top-0 z-20 px-3 pt-3 lg:pr-3 lg:pl-0">
          <div className="glass flex h-16 items-center gap-3 rounded-2xl px-3 sm:px-4">
            <button className="rounded-lg p-2 text-muted hover:text-fg lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <MenuIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-fg/[0.04] px-3 text-sm text-subtle ring-1 ring-inset ring-line transition hover:ring-teal-400/40 sm:max-w-md"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="truncate">Search requests, tickets, locations…</span>
              <kbd className="ml-auto hidden items-center gap-0.5 rounded-md bg-fg/5 px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex">
                <Command className="h-3 w-3" />K
              </kbd>
            </button>
            <div className="ml-auto flex items-center gap-2">
              {isMockApi && <span className="hidden rounded-full bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 ring-1 ring-amber-400/25 ring-inset xl:inline dark:text-amber-300">Demo data</span>}
              <ThemeToggle />
              <Notifications />
              <UserMenu />
            </div>
          </div>
        </header>
        <main key={pathname} className="animate-fade-up px-3 pt-6 pb-16 sm:px-6 lg:pr-6 lg:pl-3">
          {children}
        </main>
      </div>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

function ShellLoading() {
  return (
    <div className="relative grid min-h-screen place-items-center">
      <Backdrop grid={false} />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-2xl bg-teal-400/30 blur-xl" />
          <div className="glass relative grid h-14 w-14 place-items-center rounded-2xl">
            <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
          </div>
        </div>
        <p className="text-sm text-muted">Preparing your workspace…</p>
      </div>
    </div>
  )
}

function UserMenu() {
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  if (!user) return null

  const switchTo = async (email: string) => {
    const u = await login(email, DEMO_PASSWORD)
    toast({ kind: 'info', title: `Signed in as ${u.name}`, description: `${ROLE_META[u.role].label} workspace` })
    navigate({ to: ROLE_META[u.role].home })
  }

  return (
    <Menu
      className="w-64"
      trigger={(open) => (
        <button className={cn('flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-fg/5', open && 'bg-fg/5')}>
          <Avatar name={user.name} size={32} />
          <span className="hidden text-left leading-tight md:block">
            <span className="block text-sm font-medium">{user.name.split(' ')[0]}</span>
            <span className="block text-[11px] text-subtle">{ROLE_META[user.role].label}</span>
          </span>
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar name={user.name} size={38} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-subtle">{user.email}</p>
            </div>
          </div>
          <div className="px-3 pb-2">
            <RoleBadge role={user.role} />
          </div>
          <div className="my-1 h-px bg-line" />
          {isMockApi && (
            <>
              <p className="px-3 pt-2 pb-1 text-[11px] tracking-wider text-subtle uppercase">Switch demo role</p>
              {[
                ['aisha@campus.edu', 'Student · Aisha'],
                ['marcus@campus.edu', 'Staff · Marcus'],
                ['admin@campus.edu', 'Admin · Dr. Ross'],
              ].map(([email, label]) => (
                <MenuItem key={email} icon={<Repeat className="h-4 w-4 text-subtle" />} onClick={() => { close(); switchTo(email) }}>
                  {label}
                </MenuItem>
              ))}
              <div className="my-1 h-px bg-line" />
            </>
          )}
          <MenuItem icon={<Settings2 className="h-4 w-4 text-subtle" />} onClick={() => { close(); toast({ kind: 'info', title: 'Settings coming soon', description: 'Profile and notification preferences are on the roadmap.' }) }}>
            Settings
          </MenuItem>
          <MenuItem
            danger
            icon={<LogOut className="h-4 w-4" />}
            onClick={() => {
              close()
              logout()
              navigate({ to: '/' })
            }}
          >
            Sign out
          </MenuItem>
        </>
      )}
    </Menu>
  )
}

function Notifications() {
  const { user } = useAuth()
  const [seen, setSeen] = useState(false)
  const { data } = useAsync(
    () => api.listRequests(user?.role === 'STUDENT' ? { createdBy: user.id } : user?.role === 'STAFF' ? { assignedTo: user.id } : {}),
    [user?.id],
  )
  const items = useMemo(
    () =>
      (data ?? [])
        .flatMap((r) => r.activity.filter((a) => a.actorId !== user?.id).map((a) => ({ r, a })))
        .sort((x, y) => +new Date(y.a.at) - +new Date(x.a.at))
        .slice(0, 6),
    [data, user?.id],
  )
  const unread = seen ? 0 : Math.min(items.length, 3)

  return (
    <Menu
      className="w-[min(360px,calc(100vw-1.5rem))]"
      trigger={() => (
        <button onClick={() => setSeen(true)} className="glass relative grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:text-fg" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(244,63,94,0.7)]">{unread}</span>
          )}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between px-3 py-2.5">
            <p className="text-sm font-semibold">Notifications</p>
            <span className="text-xs text-subtle">Latest activity</span>
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {items.length === 0 && <p className="px-3 py-8 text-center text-sm text-subtle">You're all caught up ✨</p>}
            {items.map(({ r, a }) => (
              <Link key={a.id} to="/app/requests/$id" params={{ id: r.id }} onClick={close} className="flex gap-3 rounded-xl px-3 py-2.5 transition hover:bg-teal-400/10">
                <CategoryIcon category={r.category} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{r.title}</p>
                  <p className="truncate text-xs text-subtle">
                    {a.type === 'COMMENT' ? 'New comment' : a.message} · {timeAgo(a.at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Menu>
  )
}

function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const dq = useDebounced(q, 200)
  const [results, setResults] = useState<ServiceRequest[] | null>(null)

  useEffect(() => {
    if (!open || !user) return
    let live = true
    setResults(null)
    api
      .listRequests({ q: dq, ...(user.role === 'STUDENT' ? { createdBy: user.id } : user.role === 'STAFF' ? { assignedTo: user.id } : {}) })
      .then((r) => live && setResults(r.slice(0, 7)))
    return () => {
      live = false
    }
  }, [dq, open, user])

  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  return (
    <Modal open={open} onClose={onClose} title="Search" description="Find any request by title, ticket number or location.">
      <div className="relative">
        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Wi-Fi, CC-2407, Library"
          className="glass h-12 w-full rounded-2xl pr-4 pl-10 text-sm focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/15 focus:outline-none"
        />
      </div>
      <div className="mt-4 space-y-1">
        {results === null &&
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
        {results?.length === 0 && <p className="py-8 text-center text-sm text-subtle">No requests match “{dq}”.</p>}
        {results?.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              onClose()
              navigate({ to: '/app/requests/$id', params: { id: r.id } })
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-teal-400/10"
          >
            <CategoryIcon category={r.category} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{r.title}</span>
              <span className="block font-mono text-[11px] text-subtle">{r.ticketNo} · {r.location.building}</span>
            </span>
            <StatusBadge status={r.status} pulse={false} />
          </button>
        ))}
      </div>
    </Modal>
  )
}

/** Standard page header used by all app screens. */
export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: React.ReactNode; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-medium tracking-[0.16em] text-teal-600 uppercase dark:text-teal-300">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-[34px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
