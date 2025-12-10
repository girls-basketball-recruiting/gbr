import { ReactNode } from 'react'

interface FormPageLayoutProps {
  title: string
  description: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
}

const maxWidthClasses = {
  sm: 'max-w-2xl', // ~672px - closest to 700px
  md: 'max-w-3xl', // ~768px
  lg: 'max-w-4xl', // ~896px
}

export function FormPageLayout({
  title,
  description,
  children,
  maxWidth = 'sm',
}: FormPageLayoutProps) {
  return (
    <div className='min-h-svh bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12'>
      <div className={`container mx-auto px-4 ${maxWidthClasses[maxWidth]}`}>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-white mb-2'>{title}</h1>
          <p className='text-slate-400'>{description}</p>
        </div>

        {children}
      </div>
    </div>
  )
}
