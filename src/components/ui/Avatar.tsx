import { cn, initials } from '@/lib/meta'

const palettes = [
  'from-teal-400 to-cyan-500',
  'from-sky-400 to-indigo-500',
  'from-cyan-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-sky-500',
  'from-amber-300 to-orange-500',
]

export function Avatar({ name, size = 32, className }: { name?: string; size?: number; className?: string }) {
  const n = name ?? '?'
  const idx = [...n].reduce((a, c) => a + c.charCodeAt(0), 0) % palettes.length
  return (
    <span
      className={cn('inline-grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-white ring-2 ring-bg', palettes[idx], className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={n}
    >
      {name ? initials(n) : '?'}
    </span>
  )
}
