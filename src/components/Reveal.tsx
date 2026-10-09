import { useReveal } from '@/lib/hooks'
import { cn } from '@/lib/meta'

export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: { children: React.ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'li' }) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <Tag ref={ref as never} className={cn('reveal', className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  )
}
