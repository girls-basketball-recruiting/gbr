import { cn } from '@workspace/ui/lib/utils'

export const MutedText = ({ children, className }: { children: any; className?: string }) => {
  return (
     <p className={cn('text-muted-foreground text-base', className)}>
      {children}
    </p>
  )
}
