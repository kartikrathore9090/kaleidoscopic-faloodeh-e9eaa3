/** Ambient blurred gradient orbs + grid + grain. Fixed, non-interactive. */
export function Backdrop({ grid = true }: { grid?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[520px] w-[520px] animate-float-slow rounded-full blur-[110px]" style={{ background: 'var(--orb-a)' }} />
      <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] animate-float rounded-full blur-[130px]" style={{ background: 'var(--orb-b)', animationDelay: '-4s' }} />
      <div className="absolute -bottom-48 left-1/4 h-[480px] w-[480px] animate-float-slow rounded-full blur-[120px]" style={{ background: 'var(--orb-c)', animationDelay: '-8s' }} />
      {grid && <div className="grid-bg absolute inset-0" />}
      <div className="grain" />
    </div>
  )
}
