import { cn } from '@workspace/ui/lib/utils'

export const H2 = ({ children, className }: { children: any; className?: string }) => {
  return (
    <h2
      className={
        cn('scroll-m-20 pb-2 text-4xl font-bold tracking-tight first:mt-0 text-accent-foreground', className)
      }
    >
      {children}
    </h2>
  )
}
