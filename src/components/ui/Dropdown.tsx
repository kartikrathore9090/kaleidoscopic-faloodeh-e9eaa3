import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/meta'

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onOut()
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, onOut])
}

export interface Option<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
  hint?: string
}

/** Glass listbox select. */
export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
  label,
  align = 'left',
}: {
  value: T | undefined
  onChange: (v: T) => void
  options: Option<T>[]
  placeholder?: string
  className?: string
  label?: string
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))
  const current = options.find((o) => o.value === value)

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'glass flex h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm transition hover:border-teal-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60',
          open && 'border-teal-400/50',
        )}
      >
        {label && <span className="text-subtle">{label}</span>}
        {current?.icon}
        <span className={cn('flex-1 truncate', !current && 'text-subtle')}>{current?.label ?? placeholder}</span>
        <ChevronDown className={cn('h-4 w-4 text-subtle transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <ul
          role="listbox"
          className={cn(
            'glass-strong absolute z-50 mt-2 max-h-72 min-w-full animate-scale-in overflow-y-auto rounded-2xl p-1.5 scrollbar-thin',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm whitespace-nowrap transition hover:bg-teal-400/10',
                  o.value === value && 'text-teal-600 dark:text-teal-300',
                )}
              >
                {o.icon}
                <span className="flex-1">
                  {o.label}
                  {o.hint && <span className="block text-xs text-subtle">{o.hint}</span>}
                </span>
                {o.value === value && <Check className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Generic popover menu anchored to a trigger. */
export function Menu({
  trigger,
  children,
  align = 'right',
  className,
}: {
  trigger: (open: boolean) => React.ReactNode
  children: (close: () => void) => React.ReactNode
  align?: 'left' | 'right'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      {open && (
        <div
          className={cn(
            'glass-strong absolute z-50 mt-2 animate-scale-in rounded-2xl p-1.5',
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export function MenuItem({ icon, children, onClick, danger }: { icon?: React.ReactNode; children: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition',
        danger ? 'text-rose-500 hover:bg-rose-500/10' : 'hover:bg-teal-400/10',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
