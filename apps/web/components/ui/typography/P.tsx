import { cn } from '@workspace/ui/lib/utils'

export const P = ({ children, className }: { children: any; className?: string }) => {
  return (
     <p className={cn(className)}>
      {children}
    </p>
  )
}
