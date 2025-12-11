'use client'

import * as React from 'react'
import {
  Home,
  Users,
  UserPlus,
  Calendar,
  Settings,
  ChevronUp,
  User2,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@workspace/ui/components/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string
    email?: string
    role?: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const isCoach = user?.role === 'coach'
  const isPlayer = user?.role === 'player'

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/' })
  }

  // Navigation items for coaches
  const coachNavItems = [
    {
      title: 'Dashboard',
      url: '/',
      icon: Home,
    },
    {
      title: 'Browse Players',
      url: '/players',
      icon: Users,
    },
    {
      title: 'My Prospects',
      url: '/prospects',
      icon: UserPlus,
    },
    {
      title: 'Tournaments',
      url: '/tournaments',
      icon: Calendar,
    },
  ]

  // Navigation items for players
  const playerNavItems = [
    {
      title: 'Dashboard',
      url: '/',
      icon: Home,
    },
    {
      title: 'Coaches',
      url: '/coaches',
      icon: Users,
    },
    {
      title: 'Tournaments',
      url: '/tournaments',
      icon: Calendar,
    },
  ]

  const navItems = isCoach ? coachNavItems : isPlayer ? playerNavItems : []

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white'>
                  <span className='font-bold'>GB</span>
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    Girls Basketball Recruiting
                  </span>
                  <span className='truncate text-xs'>
                    {isCoach ? 'Coach Portal' : isPlayer ? 'Player Portal' : 'Portal'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/profile/edit'}
                  tooltip='Edit Profile'
                >
                  <Link href='/profile/edit'>
                    <Settings />
                    <span>Edit Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-slate-700 text-white'>
                    <User2 className='size-4' />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {user?.name || 'User'}
                    </span>
                    <span className='truncate text-xs'>{user?.email}</span>
                  </div>
                  <ChevronUp className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href='/profile/edit'>
                    <Settings className='mr-2 size-4' />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className='mr-2 size-4' />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
