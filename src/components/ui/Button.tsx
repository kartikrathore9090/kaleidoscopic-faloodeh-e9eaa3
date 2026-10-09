import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/meta'

type Variant = 'primary' | 'glass' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-white shadow-[0_8px_30px_-8px_rgba(20,184,166,0.65)] hover:shadow-[0_10px_40px_-6px_rgba(34,211,238,0.75)] hover:brightness-110',
  glass: 'glass text-fg hover:bg-glass-strong',
  ghost: 'text-muted hover:text-fg hover:bg-fg/5',
  outline: 'ring-1 ring-inset ring-glass-border text-fg hover:ring-teal-400/50 hover:bg-teal-400/5',
  danger: 'bg-rose-500/90 text-white hover:bg-rose-500 shadow-[0_8px_24px_-10px_rgba(244,63,94,0.7)]',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-2xl',
  icon: 'h-9 w-9 rounded-xl',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex select-none items-center justify-center font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
})
