import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowRight, BadgeCheck, IdCard, Lock, Mail, User } from 'lucide-react'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Select } from '@/components/ui/Dropdown'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/meta'

export const Route = createFileRoute('/register')({
  head: () => ({ meta: [{ title: 'Create account · CampusCare' }] }),
  component: Register,
})

const DEPARTMENTS = ['Computer Science', 'Electrical Eng.', 'Mechanical Eng.', 'Biotechnology', 'Business School', 'Humanities', 'Physics', 'Architecture'].map((d) => ({ value: d, label: d }))

function strength(p: string) {
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [f, setF] = useState({ name: '', email: '', studentId: '', department: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof f, string>>>({})
  const [loading, setLoading] = useState(false)
  const set = (k: keyof typeof f) => (v: string) => {
    setF((p) => ({ ...p, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }
  const pw = strength(f.password)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (f.name.trim().length < 2) errs.name = 'Please enter your full name'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) errs.email = 'Enter a valid campus email'
    if (!/^[A-Za-z0-9]{5,}$/.test(f.studentId)) errs.studentId = 'Student ID looks incomplete'
    if (!f.department) errs.department = 'Choose your department'
    if (f.password.length < 8) errs.password = 'Use at least 8 characters'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    try {
      const u = await register(f)
      toast({ kind: 'success', title: 'Account created 🎉', description: `Welcome to CampusCare, ${u.name.split(' ')[0]}.` })
      navigate({ to: '/app/student' })
    } catch (err) {
      setErrors({ email: (err as Error).message })
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join in under a minute and report your first issue right away.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <Input id="name" autoComplete="name" placeholder="Aisha Rahman" value={f.name} onChange={(e) => set('name')(e.target.value)} icon={<User className="h-4 w-4" />} invalid={!!errors.name} />
        </Field>
        <Field label="Campus email" htmlFor="remail" error={errors.email}>
          <Input id="remail" type="email" autoComplete="email" placeholder="you@campus.edu" value={f.email} onChange={(e) => set('email')(e.target.value)} icon={<Mail className="h-4 w-4" />} invalid={!!errors.email} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Student ID" htmlFor="sid" error={errors.studentId}>
            <Input id="sid" placeholder="CS21B042" value={f.studentId} onChange={(e) => set('studentId')(e.target.value.toUpperCase())} icon={<IdCard className="h-4 w-4" />} invalid={!!errors.studentId} />
          </Field>
          <Field label="Department" error={errors.department}>
            <Select value={f.department || undefined} onChange={set('department')} options={DEPARTMENTS} placeholder="Select" className="[&>button]:h-11" />
          </Field>
        </div>
        <Field label="Password" htmlFor="rpw" error={errors.password}>
          <Input id="rpw" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={f.password} onChange={(e) => set('password')(e.target.value)} icon={<Lock className="h-4 w-4" />} invalid={!!errors.password} />
          {f.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors duration-300', i < pw ? ['bg-rose-400', 'bg-amber-400', 'bg-cyan-400', 'bg-teal-400'][pw - 1] : 'bg-line')} />
                ))}
              </div>
              <span className="text-[11px] text-subtle">{['Too weak', 'Weak', 'Good', 'Strong', 'Excellent'][pw]}</span>
            </div>
          )}
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create account <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-subtle">
          <BadgeCheck className="h-3.5 w-3.5" /> Staff and admin accounts are provisioned by Campus Operations
        </p>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-teal-600 hover:underline dark:text-teal-300">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
