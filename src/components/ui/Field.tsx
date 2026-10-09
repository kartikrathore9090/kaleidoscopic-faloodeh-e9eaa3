import { forwardRef } from 'react'
import { cn } from '@/lib/meta'

const inputBase =
  'glass w-full rounded-xl px-3.5 text-sm text-fg placeholder:text-subtle transition focus:outline-none focus:border-teal-400/60 focus:ring-4 focus:ring-teal-400/15'

export function Field({ label, error, hint, children, htmlFor, aside }: { label: string; error?: string; hint?: string; children: React.ReactNode; htmlFor?: string; aside?: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[13px] font-medium">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? <p className="mt-1.5 animate-fade-in text-xs text-rose-500 dark:text-rose-400">{error}</p> : hint ? <p className="mt-1.5 text-xs text-subtle">{hint}</p> : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode; invalid?: boolean }>(
  function Input({ className, icon, invalid, ...props }, ref) {
    return (
      <div className="relative">
        {icon && <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle">{icon}</span>}
        <input ref={ref} className={cn(inputBase, 'h-11', icon && 'pl-10', invalid && 'border-rose-400/60', className)} {...props} />
      </div>
    )
  },
)

export const TextArea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function TextArea({ className, invalid, ...props }, ref) {
    return <textarea ref={ref} className={cn(inputBase, 'min-h-[120px] resize-y py-3 leading-relaxed', invalid && 'border-rose-400/60', className)} {...props} />
  },
)
