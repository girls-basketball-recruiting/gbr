'use client'

import {
  Home,
  Users,
  Calendar,
  School,
  LogIn,
  UserPlus as UserPlusIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

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
import { NavUser } from './NavUser'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()

  const role = user?.publicMetadata?.role as 'coach' | 'player' | undefined
  const isCoach = role === 'coach'
  const isPlayer = role === 'player'

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
      title: 'College Programs',
      url: '/programs',
      icon: School,
    },
    {
      title: 'AAU Tournaments',
      url: '/tournaments',
      icon: Calendar,
    },
  ]

  const playerNavItems = [
    {
      title: 'Dashboard',
      url: '/',
      icon: Home,
    },
    {
      title: 'College Programs',
      url: '/programs',
      icon: School,
    },
    {
      title: 'AAU Tournaments',
      url: '/tournaments',
      icon: Calendar,
    },
  ]

  const publicNavItems = [
    {
      title: 'Browse Players',
      url: '/players',
      icon: Users,
    },
    {
      title: 'College Programs',
      url: '/programs',
      icon: School,
    },
    {
      title: 'Tournaments',
      url: '/tournaments',
      icon: Calendar,
    },
  ]

  const authItems = [
    {
      title: 'Sign In',
      url: '/sign-in',
      icon: LogIn,
    },
    {
      title: 'Sign Up',
      url: '/register-player',
      icon: UserPlusIcon,
    },
  ]

  const navItems = isCoach
    ? coachNavItems
    : isPlayer
    ? playerNavItems
    : publicNavItems

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
      </SidebarContent>
      
      {user ? (
        <SidebarFooter><NavUser /></SidebarFooter>
      ) : (
        <SidebarGroup>
          <SidebarGroupLabel>Get Started</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {authItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
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
      <SidebarRail />
    </Sidebar>
  )
}
