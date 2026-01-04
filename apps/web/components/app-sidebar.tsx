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
import { P, Small } from './ui/typography'

// Regex patterns for detecting coach routes
const NESTED_COACH_ROUTE_PATTERN = /^\/programs\/\d+\/coaches\/\d+/
const OLD_COACH_ROUTE_PATTERN = /^\/coaches\/\d+/

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()

  const role = user?.publicMetadata?.role as 'coach' | 'player'
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
    {
      title: 'Browse Players',
      url: '/players',
      icon: Users,
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
                <div className='grid flex-1'>
                  <P className='text-sm font-semibold text-accent-foreground'>
                    Girls Basketball Recruiting
                  </P>
                  <Small className='text-xs font-bold text-muted-foreground'>
                    Database
                  </Small>
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
                {navItems.map((item) => {
                  // Check if this nav item should be active
                  let isActive = pathname === item.url || pathname.startsWith(item.url + '/')

                  // Special case: /programs/[id]/coaches/[id] should highlight "College Programs"
                  // Also keep the old /coaches/[id] pattern for backwards compatibility during transition
                  if (item.url === '/programs') {
                    const isNestedCoachRoute = NESTED_COACH_ROUTE_PATTERN.test(pathname)
                    const isOldCoachRoute = OLD_COACH_ROUTE_PATTERN.test(pathname)
                    if (isNestedCoachRoute || isOldCoachRoute) {
                      isActive = true
                    }
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
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
