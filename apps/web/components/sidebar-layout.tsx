'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@workspace/ui/components/sidebar'
import { AppSidebar } from './app-sidebar'
import { Separator } from '@workspace/ui/components/separator'
import { DynamicBreadcrumbs } from './dynamic-breadcrumbs'
import { ThemeToggle } from './ThemeToggle'
import { AuthenticatedFooter } from './AuthenticatedFooter'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <DynamicBreadcrumbs />
          <div className='ml-auto'>
            <ThemeToggle />
          </div>
        </header>
        <div className='flex flex-1 flex-col px-10 lg:px-0 pt-10'>
          {children}
          <AuthenticatedFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
