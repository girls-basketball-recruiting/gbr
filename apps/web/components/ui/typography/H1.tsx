import { cn } from '@workspace/ui/lib/utils'

export const H1 = ({ children, className }: { children: any; className?: string }) => {
  return (
    <h1
      className={cn('scroll-m-20 text-5xl md:text-6xl text-center font-extrabold tracking-tight text-balance text-accent-foreground', className)}
    >
      {children}
    </h1>
  )
}
