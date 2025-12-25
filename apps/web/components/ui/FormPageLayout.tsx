import { ReactNode } from 'react'

interface FormPageLayoutProps {
  title: string
  description: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
}

const maxWidthClasses = {
  sm: 'max-w-xl', // ~576px - compact forms
  md: 'max-w-2xl', // ~672px - standard forms (close to 700px)
  lg: 'max-w-3xl', // ~768px - wider forms
}

export function FormPageLayout({
  title,
  description,
  children,
  maxWidth = 'md',
}: FormPageLayoutProps) {
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-900 p-8'>
      <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white mb-2'>{title}</h1>
          <p className='text-slate-600 dark:text-slate-400'>{description}</p>
        </div>

        {children}
      </div>
    </div>
  )
}
