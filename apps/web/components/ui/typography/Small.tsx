import { cn } from '@workspace/ui/lib/utils'

export const Small = ({ children, className }: { children: any; className?: string }) => {
  return (
     <small className={cn('text-sm leading-none font-medium', className)}>
      {children}
    </small>
  )
}
