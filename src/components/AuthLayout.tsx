import { CheckCircle2, Clock3, ShieldCheck } from 'lucide-react'
import { Backdrop } from './Backdrop'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import { StatusTimeline } from './StatusTimeline'
import { GlassCard } from './ui/Glass'

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <Backdrop />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col px-5 py-6 sm:px-10">
          <div className="flex items-center justify-between">
            <Logo />
            <ThemeToggle />
          </div>
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <div className="animate-fade-up">
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-2 text-muted">{subtitle}</p>
            </div>
            <div className="mt-8 animate-fade-up [animation-delay:100ms]">{children}</div>
          </div>
        </div>
        <div className="relative hidden items-center justify-center p-10 lg:flex">
          <div className="absolute inset-4 rounded-[36px] bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-sky-600/20 ring-1 ring-glass-border" />
          <div className="relative w-full max-w-md animate-fade-up space-y-5 [animation-delay:200ms]">
            <GlassCard strong className="p-6">
              <p className="text-xs text-subtle">Live request · CC-2407</p>
              <p className="mt-1 font-display text-lg font-semibold">Wi‑Fi drops on 3rd floor</p>
              <div className="mt-6">
                <StatusTimeline status="IN_PROGRESS" compact />
              </div>
            </GlassCard>
            <div className="grid grid-cols-2 gap-5">
              <GlassCard className="animate-float p-5 [animation-delay:-2s]">
                <Clock3 className="h-5 w-5 text-cyan-400" />
                <p className="mt-3 font-display text-2xl font-semibold">38m</p>
                <p className="text-xs text-muted">Avg. first response</p>
              </GlassCard>
              <GlassCard className="animate-float-slow p-5">
                <CheckCircle2 className="h-5 w-5 text-teal-400" />
                <p className="mt-3 font-display text-2xl font-semibold">96%</p>
                <p className="text-xs text-muted">Resolved within SLA</p>
              </GlassCard>
            </div>
            <p className="flex items-center justify-center gap-2 pt-2 text-xs text-subtle">
              <ShieldCheck className="h-3.5 w-3.5" /> Secured with your campus credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
