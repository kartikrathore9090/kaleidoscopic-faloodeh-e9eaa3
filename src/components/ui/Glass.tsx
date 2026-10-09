import { useRef } from 'react'
import { cn } from '@/lib/meta'

/** Frosted glass card with a cursor-following glow border. */
export function GlassCard({
  className,
  children,
  glow = true,
  strong,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean; strong?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el || !glow) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn(strong ? 'glass-strong' : 'glass', 'rounded-3xl', glow && 'glow-card', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
