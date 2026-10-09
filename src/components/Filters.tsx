import { Search, X } from 'lucide-react'
import { Select } from './ui/Dropdown'
import { Input } from './ui/Field'
import { CATEGORY_META, PRIORITY_META, STATUS_FLOW, STATUS_META, cn } from '@/lib/meta'
import type { Category, Priority, RequestStatus, ServiceRequest } from '@/lib/types'

export interface FilterState {
  q: string
  status: RequestStatus | 'ALL'
  priority: Priority | 'ALL'
  category: Category | 'ALL'
  sort: 'newest' | 'priority' | 'due'
}

export const defaultFilters: FilterState = { q: '', status: 'ALL', priority: 'ALL', category: 'ALL', sort: 'newest' }

export function FilterBar({ value, onChange, statuses = STATUS_FLOW, className }: { value: FilterState; onChange: (v: FilterState) => void; statuses?: RequestStatus[]; className?: string }) {
  const set = <K extends keyof FilterState>(k: K) => (v: FilterState[K]) => onChange({ ...value, [k]: v })
  const dirty = value.q || value.status !== 'ALL' || value.priority !== 'ALL' || value.category !== 'ALL'
  return (
    <div className={cn('flex flex-col gap-2.5 lg:flex-row lg:items-center', className)}>
      <div className="lg:w-72">
        <Input placeholder="Search title, ticket, location…" value={value.q} onChange={(e) => set('q')(e.target.value)} icon={<Search className="h-4 w-4" />} className="h-10" />
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
        <Select
          className="sm:w-40"
          label="Status"
          value={value.status}
          onChange={set('status')}
          options={[{ value: 'ALL', label: 'All' }, ...statuses.map((s) => ({ value: s, label: STATUS_META[s].label, icon: <span className={cn('h-2 w-2 rounded-full', STATUS_META[s].dot)} /> }))]}
        />
        <Select
          className="sm:w-40"
          label="Priority"
          value={value.priority}
          onChange={set('priority')}
          options={[{ value: 'ALL', label: 'All' }, ...(Object.keys(PRIORITY_META) as Priority[]).map((p) => ({ value: p, label: PRIORITY_META[p].label }))]}
        />
        <Select
          className="sm:w-48"
          label="Category"
          value={value.category}
          onChange={set('category')}
          options={[{ value: 'ALL', label: 'All' }, ...(Object.keys(CATEGORY_META) as Category[]).map((c) => {
            const I = CATEGORY_META[c].icon
            return { value: c, label: CATEGORY_META[c].label, icon: <I className="h-4 w-4 text-subtle" /> }
          })]}
        />
        <Select
          className="sm:w-44"
          label="Sort"
          align="right"
          value={value.sort}
          onChange={set('sort')}
          options={[
            { value: 'newest', label: 'Newest' },
            { value: 'priority', label: 'Priority' },
            { value: 'due', label: 'Due soonest' },
          ]}
        />
      </div>
      {dirty && (
        <button onClick={() => onChange({ ...defaultFilters, sort: value.sort })} className="inline-flex animate-fade-in items-center gap-1 self-start rounded-lg px-2 py-1.5 text-xs text-muted hover:bg-fg/5 hover:text-fg lg:self-center">
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}
    </div>
  )
}


export function applyFilters(list: ServiceRequest[], f: FilterState) {
  const q = f.q.trim().toLowerCase()
  const out = list.filter(
    (r) =>
      (f.status === 'ALL' || r.status === f.status) &&
      (f.priority === 'ALL' || r.priority === f.priority) &&
      (f.category === 'ALL' || r.category === f.category) &&
      (!q || `${r.title} ${r.ticketNo} ${r.location.building} ${r.location.room ?? ''}`.toLowerCase().includes(q)),
  )
  return out.sort((a, b) =>
    f.sort === 'priority'
      ? PRIORITY_META[b.priority].weight - PRIORITY_META[a.priority].weight || +new Date(b.createdAt) - +new Date(a.createdAt)
      : f.sort === 'due'
        ? +new Date(a.dueAt ?? 0) - +new Date(b.dueAt ?? 0)
        : +new Date(b.createdAt) - +new Date(a.createdAt),
  )
}
