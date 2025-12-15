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
    <div className='p-8'>
      <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-white mb-2'>{title}</h1>
          <p className='text-slate-400'>{description}</p>
        </div>

        {children}
      </div>
    </div>
  )
}
