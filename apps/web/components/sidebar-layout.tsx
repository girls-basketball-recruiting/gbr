'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@workspace/ui/components/sidebar'
import { AppSidebar } from './app-sidebar'
import { Separator } from '@workspace/ui/components/separator'
import { DynamicBreadcrumbs } from './dynamic-breadcrumbs'
import { ThemeToggle } from './ThemeToggle'
import { AuthenticatedFooter } from './AuthenticatedFooter'
import { BriefcaseIcon, CheckCircle2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user } = useUser()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-2' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <DynamicBreadcrumbs />
          <div className='ml-auto flex items-center gap-4'>
            {user?.publicMetadata.role === 'player' ? (
              <div className='inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium'>
                <CheckCircle2 className='w-4 h-4 text-green-500' />
                Player Pro
              </div>
            ) : user?.publicMetadata.role === 'coach' ? (
              <div className='inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium'>
                <BriefcaseIcon className='w-4 h-4 text-green-500' />
                Coach Pro
              </div>
            ) : null}
            <ThemeToggle />
          </div>
        </header>
        <div className='flex flex-1 flex-col pt-10'>
          {children}
          <AuthenticatedFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
