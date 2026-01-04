import { cn } from '@workspace/ui/lib/utils'

export const H3 = ({ children, className }: { children: any, className?: string }) => {
  return (
    <h3 className={cn('scroll-m-20 text-3xl font-semibold tracking-tight text-accent-foreground', className)}>
      {children}
    </h3>
  )
}
