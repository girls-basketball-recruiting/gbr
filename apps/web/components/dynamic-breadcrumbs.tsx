'use client'

import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb'

interface BreadcrumbSegment {
  label: string
  href?: string
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname()

  // If on the dashboard, show just "Dashboard"
  if (pathname === '/') {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // Build breadcrumb segments based on pathname
  const segments: BreadcrumbSegment[] = [
    { label: 'Dashboard', href: '/' },
  ]

  const pathParts = pathname.split('/').filter(Boolean)

  // Map path segments to readable labels
  const getSegmentLabel = (segment: string, index: number): string => {
    // Check if it's a numeric ID (player/prospect/tournament detail page)
    if (!isNaN(Number(segment))) {
      // Get the previous segment to determine what this ID represents
      const previousSegment = pathParts[index - 1]
      if (previousSegment === 'players') return 'Player Profile'
      if (previousSegment === 'prospects') return 'Prospect Details'
      if (previousSegment === 'tournaments') return 'Tournament Details'
      return 'Details'
    }

    // Map known paths to readable labels
    const labelMap: Record<string, string> = {
      players: 'Browse Players',
      coaches: 'Browse Coaches',
      prospects: 'My Prospects',
      tournaments: 'Tournaments',
      profile: 'My Profile',
      edit: 'Edit Profile',
      create: 'Create',
      onboarding: 'Onboarding',
      player: 'Player Setup',
      coach: 'Coach Setup',
    }

    return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  // Build breadcrumb segments from path
  pathParts.forEach((part, index) => {
    const label = getSegmentLabel(part, index)
    const isLast = index === pathParts.length - 1

    // Build the href for this segment (up to and including this part)
    const href = isLast ? undefined : '/' + pathParts.slice(0, index + 1).join('/')

    segments.push({ label, href })
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1

          return (
            <div key={index} className='flex items-center'>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className={index === 0 ? 'hidden md:block' : ''}>
                {isLast || !segment.href ? (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={segment.href}>
                    {segment.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
