import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/meta'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn('relative grid h-9 w-9 place-items-center rounded-xl bg-navy-800 shadow-[0_0_24px_-4px_rgba(45,212,191,0.6)] ring-1 ring-teal-300/30', className)}>
      <svg viewBox="0 0 32 32" className="h-6 w-6">
        <defs>
          <linearGradient id="lg-cc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5eead4" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <path d="M22 9.6a8.6 8.6 0 1 0 0 12.8" fill="none" stroke="url(#lg-cc)" strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2.8" fill="#5eead4" />
      </svg>
    </span>
  )
}

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5">
      <LogoMark className="transition-transform duration-300 group-hover:rotate-[-8deg]" />
      <span className="font-display text-[19px] font-semibold tracking-tight">
        Campus<span className="text-gradient">Care</span>
      </span>
    </Link>
  )
}
