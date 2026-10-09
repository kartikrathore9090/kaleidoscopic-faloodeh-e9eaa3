import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/meta'

type Kind = 'success' | 'error' | 'info' | 'warning'
interface Toast {
  id: number
  kind: Kind
  title: string
  description?: string
}

const Ctx = createContext<{ toast: (t: Omit<Toast, 'id'>) => void } | null>(null)

const icons = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle }
const tones = {
  success: 'text-teal-500 dark:text-teal-300',
  error: 'text-rose-500 dark:text-rose-300',
  info: 'text-sky-500 dark:text-sky-300',
  warning: 'text-amber-500 dark:text-amber-300',
}
const bars = { success: 'bg-teal-400', error: 'bg-rose-400', info: 'bg-sky-400', warning: 'bg-amber-400' }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id))
  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev.slice(-3), { ...t, id }])
    setTimeout(() => dismiss(id), 4500)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2.5 sm:top-4 sm:bottom-auto" aria-live="polite">
        {toasts.map((t) => {
          const Icon = icons[t.kind]
          return (
            <div key={t.id} className="glass-strong pointer-events-auto relative flex animate-toast-in gap-3 overflow-hidden rounded-2xl p-4 pr-10">
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', tones[t.kind])} />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="absolute top-3 right-3 rounded-md p-1 text-subtle hover:bg-fg/5 hover:text-fg" aria-label="Dismiss">
                <X className="h-3.5 w-3.5" />
              </button>
              <span className={cn('absolute bottom-0 left-0 h-[2px] w-full origin-left opacity-70', bars[t.kind])} style={{ animation: 'toast-bar 4.5s linear forwards' }} />
            </div>
          )
        })}
      </div>
      <style>{`@keyframes toast-bar{from{transform:scaleX(1)}to{transform:scaleX(0)}}`}</style>
    </Ctx.Provider>
  )
}

export function useToast() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useToast must be used inside ToastProvider')
  return c.toast
}
