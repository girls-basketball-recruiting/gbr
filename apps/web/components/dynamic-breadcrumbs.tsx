'use client'

import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
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

  // Extract entity type and ID from pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const entityType = pathParts[0]
  const entityId = pathParts[1] && !isNaN(Number(pathParts[1])) ? pathParts[1] : null

  // Fetch entity name when on a detail page
  useEffect(() => {
    if (!entityId) {
      setEntityName(null)
      return
    }

    const fetchEntityName = async () => {
      try {
        let name = null

        if (entityType === 'players') {
          const res = await fetch(`/api/profile/player/${entityId}`)
          const data = await res.json()
          if (data.player) {
            name = `${data.player.firstName || ''} ${data.player.lastName || ''}`.trim()
          }
        } else if (entityType === 'programs') {
          const res = await fetch(`/api/programs/${entityId}`)
          const data = await res.json()
          name = data.program?.school
        } else if (entityType === 'coach-prospects') {
          const res = await fetch(`/api/prospects/${entityId}`)
          const data = await res.json()
          name = data.prospect?.name
        } else if (entityType === 'tournaments') {
          const res = await fetch(`/api/tournaments/${entityId}`)
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
  }, [entityId, entityType])

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
      // Use fetched entity name if available, otherwise show generic label
      if (entityName) {
        return entityName
      }

      // Fallback to generic labels while loading
      const previousSegment = pathParts[index - 1]
      if (previousSegment === 'players') return 'Player Profile'
      if (previousSegment === 'coach-prospects') return 'Prospect Details'
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
            <Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator key={`sep-${index}`} />}
              <BreadcrumbItem key={index} className={index === 0 ? 'hidden md:block' : ''}>
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
  )
}
