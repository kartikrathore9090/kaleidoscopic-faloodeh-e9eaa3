import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { GraduationCap, HardHat, MoreHorizontal, Search, ShieldCheck, UserPlus, Users, UserX, UserCheck, Mail } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { StatCard } from '@/components/StatCard'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/Glass'
import { Field, Input } from '@/components/ui/Field'
import { Menu, MenuItem, Select } from '@/components/ui/Dropdown'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { RoleBadge } from '@/components/ui/Badge'
import { RowSkeleton, StatSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useAsync } from '@/lib/hooks'
import { refreshDirectory } from '@/lib/directory'
import { ROLE_META, cn, formatDate } from '@/lib/meta'
import type { Role, User } from '@/lib/types'

export const Route = createFileRoute('/app/admin/users')({
  head: () => ({ meta: [{ title: 'Users · CampusCare' }] }),
  component: UsersPage,
})

const ROLES: Role[] = ['STUDENT', 'STAFF', 'ADMIN']
const roleIcon = { STUDENT: GraduationCap, STAFF: HardHat, ADMIN: ShieldCheck }

function UsersPage() {
  const { user: me } = useAuth()
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAsync(() => api.listUsers(), [])
  const [tab, setTab] = useState<Role | 'ALL'>('ALL')
  const [q, setQ] = useState('')
  const [confirm, setConfirm] = useState<User | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (data ?? []).filter((u) => (tab === 'ALL' || u.role === tab) && (!s || `${u.name} ${u.email} ${u.department ?? ''} ${u.studentId ?? ''}`.toLowerCase().includes(s)))
  }, [data, tab, q])

  const patch = async (u: User, p: Partial<User>, msg: string) => {
    setBusy(true)
    try {
      const n = await api.updateUser(u.id, p)
      setData((d) => d?.map((x) => (x.id === n.id ? n : x)))
      refreshDirectory()
      toast({ kind: 'success', title: msg, description: `${n.name} · ${n.email}` })
    } catch (e) {
      toast({ kind: 'error', title: 'Update failed', description: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  const count = (r: Role) => (data ?? []).filter((u) => u.role === r).length

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Administration"
        title="User management"
        description="Manage students, staff and administrators, their roles and access."
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" /> Add user
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading && !data ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard index={0} icon={<Users className="h-5 w-5" />} label="Total users" value={data?.length ?? 0} />
            <StatCard index={1} tone="sky" icon={<GraduationCap className="h-5 w-5" />} label="Students" value={count('STUDENT')} />
            <StatCard index={2} tone="violet" icon={<HardHat className="h-5 w-5" />} label="Staff" value={count('STAFF')} />
            <StatCard index={3} tone="rose" icon={<UserX className="h-5 w-5" />} label="Deactivated" value={(data ?? []).filter((u) => !u.active).length} />
          </>
        )}
      </div>

      <GlassCard glow={false} className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-fg/[0.03] p-1 ring-1 ring-inset ring-line">
            {(['ALL', ...ROLES] as const).map((r) => (
              <button key={r} onClick={() => setTab(r)} className={cn('rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition', tab === r ? 'glass-strong font-medium' : 'text-muted hover:text-fg')}>
                {r === 'ALL' ? 'Everyone' : `${ROLE_META[r].label}s`}
              </button>
            ))}
          </div>
          <div className="sm:w-72">
            <Input placeholder="Search name, email, ID…" value={q} onChange={(e) => setQ(e.target.value)} icon={<Search className="h-4 w-4" />} className="h-10" />
          </div>
        </div>

        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading && !data ? (
          <RowSkeleton rows={6} />
        ) : list.length === 0 ? (
          <EmptyState icon={<Users className="h-7 w-7" />} title="No users found" description="Try another search term or role filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs text-subtle">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="w-12 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((u, i) => (
                  <tr key={u.id} className={cn('transition hover:bg-teal-400/[0.04]', !u.active && 'opacity-60')} style={{ animation: `fade-up .45s ${Math.min(i, 10) * 40}ms both` }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size={36} />
                        <div className="min-w-0">
                          <p className="font-medium">
                            {u.name} {u.id === me?.id && <span className="ml-1 text-xs text-subtle">(you)</span>}
                          </p>
                          <p className="truncate text-xs text-subtle">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-3.5 text-muted">
                      {u.department ?? '—'}
                      {u.studentId && <span className="block font-mono text-[11px] text-subtle">{u.studentId}</span>}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{formatDate(u.joinedAt, false)}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn('inline-flex items-center gap-1.5 text-xs', u.active ? 'text-teal-600 dark:text-teal-300' : 'text-subtle')}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', u.active ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.9)]' : 'bg-slate-400')} />
                        {u.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.id !== me?.id && (
                        <Menu
                          className="w-56"
                          trigger={() => (
                            <button className="grid h-8 w-8 place-items-center rounded-lg text-subtle transition hover:bg-fg/5 hover:text-fg" aria-label={`Actions for ${u.name}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          )}
                        >
                          {(close) => (
                            <>
                              <p className="px-3 pt-2 pb-1 text-[11px] tracking-wider text-subtle uppercase">Change role</p>
                              {ROLES.filter((r) => r !== u.role).map((r) => {
                                const I = roleIcon[r]
                                return (
                                  <MenuItem key={r} icon={<I className="h-4 w-4 text-subtle" />} onClick={() => { close(); patch(u, { role: r }, `Role changed to ${ROLE_META[r].label}`) }}>
                                    Make {ROLE_META[r].label}
                                  </MenuItem>
                                )
                              })}
                              <div className="my-1 h-px bg-line" />
                              <MenuItem icon={<Mail className="h-4 w-4 text-subtle" />} onClick={() => { close(); toast({ kind: 'info', title: 'Password reset sent', description: `A reset link was emailed to ${u.email}.` }) }}>
                                Send password reset
                              </MenuItem>
                              {u.active ? (
                                <MenuItem danger icon={<UserX className="h-4 w-4" />} onClick={() => { close(); setConfirm(u) }}>
                                  Deactivate
                                </MenuItem>
                              ) : (
                                <MenuItem icon={<UserCheck className="h-4 w-4 text-teal-500" />} onClick={() => { close(); patch(u, { active: true }, 'User reactivated') }}>
                                  Reactivate
                                </MenuItem>
                              )}
                            </>
                          )}
                        </Menu>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        title="Deactivate user?"
        description={confirm ? `${confirm.name} will no longer be able to sign in. Their request history is kept.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={async () => {
                if (confirm) await patch(confirm, { active: false }, 'User deactivated')
                setConfirm(null)
              }}
            >
              Deactivate
            </Button>
          </>
        }
      />

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onCreated={(u) => {
          setData((d) => (d ? [...d, u] : [u]))
          refreshDirectory()
        }}
      />
    </div>
  )
}

function InviteModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (u: User) => void }) {
  const toast = useToast()
  const [f, setF] = useState({ name: '', email: '', department: '', role: 'STAFF' as Role })
  const [err, setErr] = useState<Partial<Record<'name' | 'email', string>>>({})
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const e: typeof err = {}
    if (f.name.trim().length < 2) e.name = 'Enter a full name'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email'
    setErr(e)
    if (Object.keys(e).length) return
    setSaving(true)
    try {
      const u = await api.createUser({ ...f, department: f.department || undefined })
      onCreated(u)
      toast({ kind: 'success', title: 'Invitation sent', description: `${u.name} was added as ${ROLE_META[u.role].label}.` })
      setF({ name: '', email: '', department: '', role: 'STAFF' })
      onClose()
    } catch (x) {
      setErr({ email: (x as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a user"
      description="They'll receive an email invitation to set their password."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Send invite
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Full name" error={err.name}>
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Jordan Lee" invalid={!!err.name} />
        </Field>
        <Field label="Email" error={err.email}>
          <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="jordan@campus.edu" invalid={!!err.email} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role">
            <Select value={f.role} onChange={(role) => setF({ ...f, role })} options={ROLES.map((r) => ({ value: r, label: ROLE_META[r].label }))} className="[&>button]:h-11" />
          </Field>
          <Field label="Department">
            <Input value={f.department} onChange={(e) => setF({ ...f, department: e.target.value })} placeholder="Facilities" />
          </Field>
        </div>
      </div>
    </Modal>
  )
}
