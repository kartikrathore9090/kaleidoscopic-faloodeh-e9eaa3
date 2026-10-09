import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, DoorOpen, MapPin, Send, Timer } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/Glass'
import { Field, Input, TextArea } from '@/components/ui/Field'
import { Select } from '@/components/ui/Dropdown'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { CategoryIcon, PriorityBadge, StatusBadge } from '@/components/ui/Badge'
import { StatusTimeline } from '@/components/StatusTimeline'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { BUILDINGS, CATEGORY_META, PRIORITY_META, cn } from '@/lib/meta'
import type { Category, Priority, ServiceRequest } from '@/lib/types'

const CATEGORIES = Object.keys(CATEGORY_META) as Category[]
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const PRIORITY_COPY: Record<Priority, string> = {
  LOW: 'Cosmetic or can wait',
  MEDIUM: 'Affects daily use',
  HIGH: 'Blocks study or work',
  URGENT: 'Safety risk right now',
}

export const Route = createFileRoute('/app/requests/new')({
  validateSearch: (s: Record<string, unknown>): { category?: Category } => ({
    category: CATEGORIES.includes(s.category as Category) ? (s.category as Category) : undefined,
  }),
  head: () => ({ meta: [{ title: 'New request · CampusCare' }] }),
  component: NewRequest,
})

type Errors = Partial<Record<'category' | 'title' | 'building' | 'description', string>>

function NewRequest() {
  const { category: initialCategory } = Route.useSearch()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [category, setCategory] = useState<Category | undefined>(initialCategory)
  const [title, setTitle] = useState('')
  const [building, setBuilding] = useState<string | undefined>()
  const [room, setRoom] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('MEDIUM')
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<ServiceRequest | null>(null)

  const clear = (k: keyof Errors) => setErrors((e) => ({ ...e, [k]: undefined }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Errors = {}
    if (!category) errs.category = 'Pick the category that fits best'
    if (title.trim().length < 6) errs.title = 'Give it a short, descriptive title (6+ characters)'
    if (!building) errs.building = 'Where on campus is this?'
    if (description.trim().length < 15) errs.description = 'Add a few more details so staff know what to bring'
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast({ kind: 'warning', title: 'A few details are missing', description: 'Check the highlighted fields.' })
      return
    }
    setSubmitting(true)
    try {
      const r = await api.createRequest({ title: title.trim(), description: description.trim(), category: category!, priority, location: { building: building!, room: room.trim() || undefined } }, user!.id)
      setCreated(r)
      toast({ kind: 'success', title: 'Request submitted', description: `${r.ticketNo} is now in the operations queue.` })
    } catch (err) {
      toast({ kind: 'error', title: 'Could not submit request', description: (err as Error).message })
    } finally {
      setSubmitting(false)
    }
  }

  const completion = [category, title.trim().length >= 6, building, description.trim().length >= 15].filter(Boolean).length

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/app/student" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <PageHeader eyebrow="New service request" title="What needs fixing?" description="The more specific you are, the faster the right person can help." />

      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Step 1: category */}
          <GlassCard glow={false} className="p-6">
            <StepHead n={1} title="Category" done={!!category} />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {CATEGORIES.map((c) => {
                const M = CATEGORY_META[c]
                const on = category === c
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => {
                      setCategory(c)
                      clear('category')
                    }}
                    className={cn(
                      'group relative rounded-2xl p-3.5 text-left ring-1 ring-inset transition duration-200 hover:-translate-y-0.5',
                      on ? 'bg-teal-400/12 ring-teal-400/60 shadow-[0_0_30px_-12px_rgba(45,212,191,0.9)]' : 'ring-line hover:bg-fg/[0.03] hover:ring-teal-400/30',
                    )}
                  >
                    {on && (
                      <span className="absolute top-2.5 right-2.5 grid h-5 w-5 animate-scale-in place-items-center rounded-full bg-brand text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                    <M.icon className={cn('h-5 w-5 transition', on ? 'text-teal-500 dark:text-teal-300' : 'text-subtle group-hover:text-teal-400')} />
                    <p className="mt-2.5 text-sm font-medium">{M.label}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-subtle">{M.hint}</p>
                  </button>
                )
              })}
            </div>
            {errors.category && <p className="mt-3 animate-fade-in text-xs text-rose-500 dark:text-rose-400">{errors.category}</p>}
          </GlassCard>

          {/* Step 2: details */}
          <GlassCard glow={false} className="space-y-5 p-6">
            <StepHead n={2} title="Details & location" done={title.trim().length >= 6 && !!building} />
            <Field label="Title" htmlFor="title" error={errors.title}>
              <Input id="title" placeholder="e.g. Wi‑Fi drops every few minutes on 3rd floor" value={title} maxLength={90} onChange={(e) => { setTitle(e.target.value); clear('title') }} invalid={!!errors.title} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Building" error={errors.building}>
                <Select
                  value={building}
                  onChange={(v) => {
                    setBuilding(v)
                    clear('building')
                  }}
                  options={BUILDINGS.map((b) => ({ value: b, label: b, icon: <Building2 className="h-4 w-4 text-subtle" /> }))}
                  placeholder="Select a building"
                  className={cn('[&>button]:h-11', errors.building && '[&>button]:border-rose-400/60')}
                />
              </Field>
              <Field label="Room / area" htmlFor="room" hint="Optional, but helpful">
                <Input id="room" placeholder="e.g. Lab 4, A‑214, 2nd floor pantry" value={room} onChange={(e) => setRoom(e.target.value)} icon={<DoorOpen className="h-4 w-4" />} />
              </Field>
            </div>
            <Field label="Description" htmlFor="desc" error={errors.description} aside={<span className={cn('text-[11px] tabular-nums', description.length > 900 ? 'text-amber-500' : 'text-subtle')}>{description.length}/1000</span>}>
              <TextArea id="desc" maxLength={1000} placeholder="What happened, since when, and anything you've already tried…" value={description} onChange={(e) => { setDescription(e.target.value); clear('description') }} invalid={!!errors.description} />
            </Field>
          </GlassCard>

          {/* Step 3: priority */}
          <GlassCard glow={false} className="p-6">
            <StepHead n={3} title="Priority" done />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" role="radiogroup">
              {PRIORITIES.map((p) => {
                const on = priority === p
                const urgent = p === 'URGENT'
                return (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      'rounded-2xl p-3.5 text-left ring-1 ring-inset transition duration-200',
                      on ? (urgent ? 'bg-rose-500/10 ring-rose-400/60' : 'bg-teal-400/12 ring-teal-400/60') : 'ring-line hover:bg-fg/[0.03]',
                    )}
                  >
                    <PriorityBadge priority={p} />
                    <p className="mt-2.5 text-[13px] text-muted">{PRIORITY_COPY[p]}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-subtle">
                      <Timer className="h-3 w-3" /> Target: {PRIORITY_META[p].sla < 24 ? `${PRIORITY_META[p].sla}h` : `${PRIORITY_META[p].sla / 24} days`}
                    </p>
                  </button>
                )
              })}
            </div>
            {priority === 'URGENT' && (
              <p className="mt-4 animate-fade-in rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-600 ring-1 ring-rose-400/25 ring-inset dark:text-rose-300">
                If anyone is in immediate danger, also call Campus Security on ext. 4000.
              </p>
            )}
          </GlassCard>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <GlassCard strong className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium tracking-[0.14em] text-subtle uppercase">Live preview</p>
              <span className="text-xs text-subtle tabular-nums">{completion}/4 complete</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-400 transition-[width] duration-500" style={{ width: `${(completion / 4) * 100}%` }} />
            </div>
            <div className="mt-5 flex items-start gap-3">
              {category ? <CategoryIcon category={category} /> : <span className="h-10 w-10 shrink-0 rounded-xl border border-dashed border-glass-border" />}
              <div className="min-w-0">
                <p className={cn('font-medium break-words', !title && 'text-subtle italic')}>{title || 'Your request title'}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-subtle">
                  <MapPin className="h-3 w-3" /> {building ?? 'Location'} {room && `· ${room}`}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <StatusBadge status="OPEN" />
              <PriorityBadge priority={priority} />
            </div>
            {description && <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-muted">{description}</p>}
            <div className="mt-6 border-t border-line pt-5">
              <StatusTimeline status="OPEN" compact />
            </div>
            <Button type="submit" size="lg" className="mt-6 w-full" loading={submitting}>
              {!submitting && <Send className="h-4 w-4" />} Submit request
            </Button>
          </GlassCard>
        </div>
      </form>

      <Modal
        open={!!created}
        onClose={() => navigate({ to: '/app/student' })}
        title="You're all set"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => navigate({ to: '/app/student' })}>
              Dashboard
            </Button>
            <Button onClick={() => created && navigate({ to: '/app/requests/$id', params: { id: created.id } })}>
              Track request <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        }
      >
        {created && (
          <div className="text-center">
            <div className="relative mx-auto grid h-20 w-20 place-items-center">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-teal-400/40" />
              <span className="relative grid h-20 w-20 animate-scale-in place-items-center rounded-full bg-brand text-white shadow-[0_0_40px_-6px_rgba(45,212,191,0.9)]">
                <CheckCircle2 className="h-9 w-9" />
              </span>
            </div>
            <p className="mt-5 font-mono text-sm text-teal-600 dark:text-teal-300">{created.ticketNo}</p>
            <p className="mt-1 font-display text-lg font-semibold">{created.title}</p>
            <p className="mt-2 text-sm text-muted">We'll notify you as soon as a technician is assigned. You can follow every step from the request page.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

function StepHead({ n, title, done }: { n: number; title: string; done?: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className={cn('grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition', done ? 'bg-brand text-white' : 'bg-fg/5 text-muted ring-1 ring-inset ring-line')}>
        {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
      </span>
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
    </div>
  )
}
