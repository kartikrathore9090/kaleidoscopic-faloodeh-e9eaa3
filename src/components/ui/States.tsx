import { Link } from '@tanstack/react-router'
import { AlertOctagon, Compass, Inbox, RotateCw } from 'lucide-react'
import { Button } from './Button'
import { Backdrop } from '../Backdrop'

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-3xl bg-teal-400/25 blur-2xl" />
        <div className="glass relative grid h-16 w-16 place-items-center rounded-3xl text-teal-500 dark:text-teal-300">{icon ?? <Inbox className="h-7 w-7" />}</div>
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertOctagon className="h-7 w-7 text-rose-400" />}
      title="Something went wrong"
      description={error.message || 'We could not load this data. Check your connection and try again.'}
      action={
        onRetry && (
          <Button variant="glass" onClick={onRetry}>
            <RotateCw className="h-4 w-4" /> Try again
          </Button>
        )
      }
    />
  )
}

export function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center px-6">
      <Backdrop />
      <div className="relative z-10 text-center">
        <p className="font-display text-[120px] leading-none font-bold text-gradient sm:text-[180px]">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">This corridor leads nowhere</h1>
        <p className="mt-2 text-muted">The page you were looking for has moved or never existed.</p>
        <Link to="/" className="mt-8 inline-block">
          <Button size="lg">
            <Compass className="h-4 w-4" /> Back to campus
          </Button>
        </Link>
      </div>
    </div>
  )
}
