import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/meta'
import { GlassCard } from './ui/Glass'
import { Counter } from './ui/Counter'

export function StatCard({
  icon,
  label,
  value,
  suffix,
  decimals,
  delta,
  tone = 'teal',
  index = 0,
  spark,
}: {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  decimals?: number
  delta?: number
  tone?: 'teal' | 'sky' | 'amber' | 'rose' | 'violet'
  index?: number
  spark?: number[]
}) {
  const tones = {
    teal: 'from-teal-400/25 to-teal-400/5 text-teal-600 dark:text-teal-300 ring-teal-400/25',
    sky: 'from-sky-400/25 to-sky-400/5 text-sky-600 dark:text-sky-300 ring-sky-400/25',
    amber: 'from-amber-400/25 to-amber-400/5 text-amber-600 dark:text-amber-300 ring-amber-400/25',
    rose: 'from-rose-400/25 to-rose-400/5 text-rose-600 dark:text-rose-300 ring-rose-400/25',
    violet: 'from-violet-400/25 to-violet-400/5 text-violet-600 dark:text-violet-300 ring-violet-400/25',
  }
  const strokes = { teal: '#2dd4bf', sky: '#38bdf8', amber: '#fbbf24', rose: '#fb7185', violet: '#a78bfa' }
  return (
    <GlassCard className="relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-0.5" style={{ animation: `fade-up 0.6s ${index * 80}ms both cubic-bezier(0.22,1,0.36,1)` }}>
      <div className="flex items-start justify-between">
        <span className={cn('grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-inset', tones[tone])}>{icon}</span>
        {delta !== undefined && (
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', delta >= 0 ? 'bg-teal-400/10 text-teal-600 dark:text-teal-300' : 'bg-rose-400/10 text-rose-600 dark:text-rose-300')}>
            {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-5 font-display text-3xl font-semibold tracking-tight">
        <Counter value={value} suffix={suffix} decimals={decimals} />
      </p>
      <p className="mt-1 text-sm text-muted">{label}</p>
      {spark && <Spark data={spark} color={strokes[tone]} />}
    </GlassCard>
  )
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 100},${28 - ((d - min) / (max - min || 1)) * 24}`).join(' ')
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="pointer-events-none absolute right-0 bottom-0 h-12 w-1/2 opacity-60" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
