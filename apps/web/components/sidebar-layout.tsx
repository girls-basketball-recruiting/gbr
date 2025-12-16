'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@workspace/ui/components/sidebar'
import { AppSidebar } from './app-sidebar'
import { Separator } from '@workspace/ui/components/separator'
import { DynamicBreadcrumbs } from './dynamic-breadcrumbs'
import { ThemeToggle } from './ThemeToggle'

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <DynamicBreadcrumbs />
          <div className='ml-auto'>
            <ThemeToggle />
          </div>
        </header>
        <div className='flex flex-1 flex-col'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
