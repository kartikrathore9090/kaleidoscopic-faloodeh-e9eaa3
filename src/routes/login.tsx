import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, GraduationCap, HardHat, Lock, Mail, ShieldCheck } from 'lucide-react'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth'
import { DEMO_PASSWORD } from '@/lib/fixtures'
import { isMockApi } from '@/lib/api'
import { ROLE_META, cn } from '@/lib/meta'

export const Route = createFileRoute('/login')({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof s.redirect === 'string' && s.redirect.startsWith('/app') ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: 'Sign in · CampusCare' }] }),
  component: Login,
})

const DEMOS = [
  { email: 'aisha@campus.edu', role: 'Student', name: 'Aisha Rahman', icon: GraduationCap },
  { email: 'marcus@campus.edu', role: 'Staff', name: 'Marcus Chen', icon: HardHat },
  { email: 'admin@campus.edu', role: 'Admin', name: 'Dr. Elena Ross', icon: ShieldCheck },
]

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e?: React.FormEvent, demoEmail?: string) => {
    e?.preventDefault()
    const em = demoEmail ?? email
    const pw = demoEmail ? DEMO_PASSWORD : password
    if (!em || !pw) {
      setError('Enter your email and password to continue.')
      return
    }
    setError(null)
    setLoading(demoEmail ?? 'form')
    try {
      const u = await login(em, pw)
      toast({ kind: 'success', title: `Welcome back, ${u.name.split(' ')[0]}!`, description: `Signed in to the ${ROLE_META[u.role].label.toLowerCase()} workspace.` })
      navigate({ to: redirect ?? ROLE_META[u.role].home })
    } catch (err) {
      setError((err as Error).message)
      setLoading(null)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to report, track and resolve campus requests.">
      {isMockApi && (
        <div className="mb-8">
          <p className="mb-3 text-xs font-medium tracking-[0.14em] text-subtle uppercase">One-click demo</p>
          <div className="grid grid-cols-3 gap-2.5">
            {DEMOS.map((d) => (
              <button
                key={d.email}
                onClick={() => submit(undefined, d.email)}
                disabled={!!loading}
                className={cn(
                  'glass glow-card group rounded-2xl p-3 text-left transition hover:-translate-y-0.5 disabled:opacity-60',
                  loading === d.email && 'border-teal-400/60',
                )}
              >
                <d.icon className={cn('h-5 w-5 text-teal-500 transition group-hover:scale-110 dark:text-teal-300', loading === d.email && 'animate-pulse')} />
                <p className="mt-2 text-sm font-medium">{d.role}</p>
                <p className="truncate text-[11px] text-subtle">{d.name}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-3 text-xs text-subtle">
            <span className="h-px flex-1 bg-line" /> or sign in with email <span className="h-px flex-1 bg-line" />
          </div>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Campus email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" placeholder="you@campus.edu" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="h-4 w-4" />} invalid={!!error} />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          aside={
            <button type="button" className="text-xs text-teal-600 hover:underline dark:text-teal-300" onClick={() => toast({ kind: 'info', title: 'Password reset', description: 'Reset links will be emailed once the campus SSO is connected.' })}>
              Forgot?
            </button>
          }
        >
          <div className="relative">
            <Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="h-4 w-4" />} invalid={!!error} className="pr-11" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-subtle hover:text-fg" aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        {error && <p className="animate-fade-in rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-600 ring-1 ring-rose-400/25 ring-inset dark:text-rose-300">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading === 'form'} disabled={!!loading}>
          Sign in <ArrowRight className="h-4 w-4" />
        </Button>
        {isMockApi && <p className="text-center text-xs text-subtle">Demo password for all sample accounts: <span className="font-mono text-muted">{DEMO_PASSWORD}</span></p>}
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        New to CampusCare?{' '}
        <Link to="/register" className="font-medium text-teal-600 hover:underline dark:text-teal-300">
          Create a student account
        </Link>
      </p>
    </AuthLayout>
  )
}
