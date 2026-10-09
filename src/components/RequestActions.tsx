import { useEffect, useMemo, useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Field, TextArea } from './ui/Field'
import { useToast } from './ui/Toast'
import { StatusBadge } from './ui/Badge'
import { Avatar } from './ui/Avatar'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useAsync } from '@/lib/hooks'
import { STATUS_FLOW, STATUS_META, cn } from '@/lib/meta'
import type { RequestStatus, ServiceRequest } from '@/lib/types'

/** Statuses a given role may move a request into. */
export function nextStatuses(r: ServiceRequest, role: 'STUDENT' | 'STAFF' | 'ADMIN'): RequestStatus[] {
  const i = STATUS_FLOW.indexOf(r.status)
  if (role === 'STAFF') return (['IN_PROGRESS', 'RESOLVED'] as RequestStatus[]).filter((s) => STATUS_FLOW.indexOf(s) > i)
  if (role === 'ADMIN') return STATUS_FLOW.filter((s) => s !== r.status && s !== 'ASSIGNED')
  return []
}

export function StatusModal({
  request,
  target,
  onClose,
  onDone,
}: {
  request: ServiceRequest | null
  target: RequestStatus | null
  onClose: () => void
  onDone: (r: ServiceRequest) => void
}) {
  const { user } = useAuth()
  const toast = useToast()
  const [note, setNote] = useState('')
  const [err, setErr] = useState<string>()
  const [saving, setSaving] = useState(false)
  const resolving = target === 'RESOLVED'

  useEffect(() => {
    setNote('')
    setErr(undefined)
  }, [request?.id, target])

  const save = async () => {
    if (!request || !target) return
    if (resolving && note.trim().length < 10) {
      setErr('Describe what was done so the student knows it is fixed (10+ characters).')
      return
    }
    setSaving(true)
    try {
      const r = await api.updateStatus(request.id, { status: target, note: resolving ? undefined : note, resolution: resolving ? note : undefined }, user!.id)
      toast({ kind: 'success', title: `Marked as ${STATUS_META[target].label}`, description: `${r.ticketNo} · ${r.title}` })
      onDone(r)
      onClose()
    } catch (e) {
      toast({ kind: 'error', title: 'Update failed', description: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={!!request && !!target}
      onClose={onClose}
      title={resolving ? 'Resolve request' : 'Update status'}
      description={request ? `${request.ticketNo} · ${request.title}` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Confirm
          </Button>
        </>
      }
    >
      {request && target && (
        <div className="space-y-5">
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-fg/[0.03] py-4 ring-1 ring-inset ring-line">
            <StatusBadge status={request.status} pulse={false} />
            <span className="text-subtle">→</span>
            <StatusBadge status={target} />
          </div>
          <Field label={resolving ? 'Resolution summary' : 'Note (optional)'} error={err}>
            <TextArea
              autoFocus
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                setErr(undefined)
              }}
              invalid={!!err}
              placeholder={resolving ? 'e.g. Replaced faulty access point and verified signal strength on all study pods.' : 'Add context for the student and the team…'}
            />
          </Field>
        </div>
      )}
    </Modal>
  )
}

export function AssignModal({ request, onClose, onDone }: { request: ServiceRequest | null; onClose: () => void; onDone: (r: ServiceRequest) => void }) {
  const { user } = useAuth()
  const toast = useToast()
  const { data: staff, loading } = useAsync(() => api.listUsers('STAFF'), [])
  const { data: all } = useAsync(() => api.listRequests(), [request?.id])
  const [pick, setPick] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)

  useEffect(() => setPick(request?.assignedTo), [request?.id, request?.assignedTo])

  const load = useMemo(() => {
    const m = new Map<string, number>()
    all?.forEach((r) => r.assignedTo && ['ASSIGNED', 'IN_PROGRESS'].includes(r.status) && m.set(r.assignedTo, (m.get(r.assignedTo) ?? 0) + 1))
    return m
  }, [all])

  const save = async () => {
    if (!request || !pick) return
    setSaving(true)
    try {
      const r = await api.assign(request.id, pick, user!.id)
      const who = staff?.find((s) => s.id === pick)?.name
      toast({ kind: 'success', title: `Assigned to ${who}`, description: `${r.ticketNo} · ${r.title}` })
      onDone(r)
      onClose()
    } catch (e) {
      toast({ kind: 'error', title: 'Assignment failed', description: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={!!request}
      onClose={onClose}
      title={request?.assignedTo ? 'Reassign request' : 'Assign request'}
      description={request ? `${request.ticketNo} · ${request.title}` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!pick || pick === request?.assignedTo}>
            Assign
          </Button>
        </>
      }
    >
      <div className="space-y-2" role="radiogroup">
        {loading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        {staff
          ?.filter((s) => s.active)
          .map((s) => {
            const n = load.get(s.id) ?? 0
            const on = pick === s.id
            return (
              <button
                key={s.id}
                role="radio"
                aria-checked={on}
                onClick={() => setPick(s.id)}
                className={cn('flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 ring-inset transition', on ? 'bg-teal-400/12 ring-teal-400/60' : 'ring-line hover:bg-fg/[0.03]')}
              >
                <Avatar name={s.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-subtle">{s.department}</p>
                </div>
                <div className="w-24 text-right">
                  <p className="text-xs text-muted tabular-nums">{n} active</p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-line">
                    <div className={cn('h-full rounded-full', n >= 4 ? 'bg-rose-400' : n >= 2 ? 'bg-amber-400' : 'bg-teal-400')} style={{ width: `${Math.min(n / 5, 1) * 100}%` }} />
                  </div>
                </div>
              </button>
            )
          })}
      </div>
    </Modal>
  )
}
