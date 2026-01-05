import { ReactNode } from 'react'
import { H1, P } from './typography'

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
    <div className='p-8'>
      <div>
        <div className='text-center mb-8'>
          <H1 className='mb-6'>{title}</H1>
          <P className='text-lg'>{description}</P>
        </div>
        <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
          {children}
        </div>
      </div>
    </div>
  )
}
