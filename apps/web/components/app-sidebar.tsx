'use client'

import {
  Home,
  Users,
  Calendar,
  School,
  LogIn,
  UserPlus as UserPlusIcon,
  ClipboardList,
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
  useSidebar,
} from '@workspace/ui/components/sidebar'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import { NavUser } from './NavUser'

function BasketballIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M20.3 12A9 9 0 0 1 12 3.5" />
      <path d="M12 20.5A9 9 0 0 0 3.7 12" />
      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
      <line x1="5.6" y1="18.4" x2="18.4" y2="5.6" />
    </svg>
  )
}

// Regex patterns for detecting coach routes
const NESTED_COACH_ROUTE_PATTERN = /^\/programs\/\d+\/coaches\/\d+/
const OLD_COACH_ROUTE_PATTERN = /^\/coaches\/\d+/

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()
  const { isMobile, setOpenMobile } = useSidebar()

  // Close sidebar on mobile when navigating
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

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
      title: 'My Prospects',
      url: '/prospects',
      icon: ClipboardList,
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
              <Link href='/' onClick={handleNavClick}>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg bg-primary text-primary-foreground'>
                    <BasketballIcon className='h-4 w-4' />
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    Girls Basketball Recruiting
                  </span>
                  <span className='truncate text-xs text-muted-foreground'>
                    Database
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
                        <Link href={item.url} onClick={handleNavClick}>
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
                    <Link href={item.url} onClick={handleNavClick}>
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
