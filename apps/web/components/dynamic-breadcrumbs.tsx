'use client'

import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
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
  const [entityName, setEntityName] = useState<string | null>(null)
  const [programName, setProgramName] = useState<string | null>(null)

  // Extract entity type and ID from pathname
  const pathParts = pathname.split('/').filter(Boolean)

  // Handle nested routes like /programs/[id]/coaches/[coachId]
  let entityType = pathParts[0]
  let entityId = pathParts[1] && !isNaN(Number(pathParts[1])) ? pathParts[1] : null
  let isNestedCoachRoute = false

  // Check if this is a nested coach route
  if (pathParts.length >= 4 && pathParts[0] === 'programs' && pathParts[2] === 'coaches') {
    isNestedCoachRoute = true
    entityType = 'coaches'
    entityId = pathParts[3] || null
  }

  // Fetch entity name when on a detail page
  useEffect(() => {
    if (!entityId) {
      setEntityName(null)
      setProgramName(null)
      return
    }

    const fetchEntityName = async () => {
      try {
        let name = null

        if (entityType === 'players') {
          const res = await fetch(`/api/players/${entityId}/details`)
          if (!res.ok) {
            console.error('Failed to fetch player details for breadcrumbs')
            setEntityName(null)
            return
          }
          const data = await res.json()
          if (data.player) {
            name = `${data.player.firstName || ''} ${data.player.lastName || ''}`.trim()
          }
        } else if (entityType === 'programs') {
          const res = await fetch(`/api/programs/${entityId}`)
          if (!res.ok) {
            console.error('Failed to fetch program details for breadcrumbs')
            setEntityName(null)
            return
          }
          const data = await res.json()
          name = data.program?.school
        } else if (entityType === 'coaches') {
          const res = await fetch(`/api/coaches/${entityId}/details`)
          if (!res.ok) {
            console.error('Failed to fetch coach details for breadcrumbs')
            setEntityName(null)
            return
          }
          const data = await res.json()
          if (data.coach) {
            name = `${data.coach.firstName || ''} ${data.coach.lastName || ''}`.trim()

            // For nested coach routes, also fetch the program name
            if (isNestedCoachRoute && pathParts[1]) {
              const programRes = await fetch(`/api/programs/${pathParts[1]}`)
              if (programRes.ok) {
                const programData = await programRes.json()
                setProgramName(programData.program?.school || null)
              }
            }
          }
        } else if (entityType === 'prospects') {
          const res = await fetch(`/api/prospects/${entityId}`)
          if (!res.ok) {
            console.error('Failed to fetch prospect details for breadcrumbs')
            setEntityName(null)
            return
          }
          const data = await res.json()
          if (data.prospect) {
            name = `${data.prospect.firstName || ''} ${data.prospect.lastName || ''}`.trim()
          }
        } else if (entityType === 'tournaments') {
          const res = await fetch(`/api/tournaments/${entityId}/details`)
          if (!res.ok) {
            console.error('Failed to fetch tournament details for breadcrumbs')
            setEntityName(null)
            return
          }
          const data = await res.json()
          name = data.tournament?.name
        }

        setEntityName(name)
      } catch (error) {
        console.error('Failed to fetch entity name for breadcrumbs:', error)
        setEntityName(null)
      }
    }

    fetchEntityName()
  }, [entityId, entityType, isNestedCoachRoute, pathParts])

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

  // Map path segments to readable labels
  const getSegmentLabel = (segment: string, index: number): string => {
    // Check if it's a numeric ID (player/prospect/tournament detail page)
    if (!isNaN(Number(segment))) {
      // For nested coach routes, use programName for program ID segment
      if (isNestedCoachRoute && index === 1 && programName) {
        return programName
      }

      // Use fetched entity name if available, otherwise show generic label
      if (entityName) {
        return entityName
      }

      // Fallback to generic labels while loading
      const previousSegment = pathParts[index - 1]
      if (previousSegment === 'players') return 'Player Profile'
      if (previousSegment === 'coaches') return 'Coach Profile'
      if (previousSegment === 'prospects') return 'Prospect Details'
      if (previousSegment === 'tournaments') return 'Tournament Details'
      if (previousSegment === 'programs') return 'College Program Details'
      return 'Details'
    }

    // Map known paths to readable labels
    const labelMap: Record<string, string> = {
      players: 'Browse Players',
      coaches: 'Browse Coaches',
      prospects: 'My Prospects',
      programs: 'College Programs',
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

    // Skip the 'coaches' segment when it's in a nested coach route
    // This is because /programs/[id]/coaches doesn't exist as a page
    if (isNestedCoachRoute && part === 'coaches' && index === 2) {
      return // Skip this segment
    }

    // Build the href for this segment (up to and including this part)
    const href = isLast ? undefined : '/' + pathParts.slice(0, index + 1).join('/')

    segments.push({ label, href })
  })

  // Find the back link (second to last segment with an href, or dashboard)
  const backSegment = segments.length > 1
    ? segments.slice(0, -1).reverse().find(s => s.href) || segments[0]
    : null

  return (
    <>
      {/* Mobile: Simple back link */}
      {backSegment && backSegment.href && (
        <Link
          href={backSegment.href}
          className='md:hidden inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ChevronLeft className='w-4 h-4' />
          <span>Back</span>
        </Link>
      )}

      {/* Desktop: Full breadcrumb trail */}
      <Breadcrumb className='hidden md:flex'>
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1

            return (
              <Fragment key={index}>
                {index > 0 && <BreadcrumbSeparator key={`sep-${index}`} />}
                <BreadcrumbItem key={index}>
                  {isLast || !segment.href ? (
                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={segment.href}>
                      {segment.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}
