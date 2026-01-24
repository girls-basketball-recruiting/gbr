'use client'

import { useState, useEffect } from 'react'
import type { Player, CoachProspect, Tournament } from '@/payload-types'
import Image from 'next/image'
import { getPositionLabel } from '@/lib/zod/Positions'
import { formatHeight, formatPhoneNumber } from '@/lib/formatters'
import { getAAUCircuitLabel } from '@/lib/zod/AauCircuits'
import { getAAUAgeBracketLabel } from '@/lib/zod/AauAgeBrackets'
import { getGeographicAreaLabel } from '@/lib/zod/GeographicAreas'
import { getAreaOfStudyLabel } from '@/lib/zod/AreasOfStudy'
import { getDistanceFromHomeLabel } from '@/lib/zod/DistanceFromHome'
import { getLevelOfPlayLabel } from '@/lib/zod/LevelsOfPlay'
import { CopyableText } from './copyable-text'
import { TournamentList } from './TournamentList'
import { MailIcon, PhoneIcon, Play, ExternalLink, User, FileText, Calendar, Info, Instagram, TwitterIcon } from 'lucide-react'
import { H1, H2, H3, P, Small } from '../ui/typography'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@workspace/ui/components/tabs'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@workspace/ui/components/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { DatePicker } from '@workspace/ui/components/date-picker'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { AlertCircle, History } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

type ProfileData = Player | CoachProspect

interface ContactRecord {
  date: string
  contactType: string
  summary: string
  followUpNeeded: boolean
  followUpDate?: string
}

interface CoachNotesData {
  notes: string
  contactRecords: ContactRecord[]
  interestLevel?: string
}

interface ProfileViewProps {
  profile: ProfileData
  variant: 'player' | 'prospect'
  tournamentSchedule: Tournament[]
  headerAction?: React.ReactNode
  coachId?: string
  /** Whether the viewer can see contact information (email, phone, social handles). Typically true for coaches viewing players. */
  canViewContact?: boolean
}

function isPlayer(profile: ProfileData): profile is Player {
  return 'user' in profile && 'email' in profile
}

// Reusable section header
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
      {children}
    </h3>
  )
}

// Reusable data row for sidebar
function DataRow({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (!value) return null
  return (
    <div className='flex justify-between items-baseline gap-2'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <span className='text-sm font-bold'>{value}</span>
    </div>
  )
}

// Stats display with stylized slashes
function StatsRow({ ppg, rpg, apg }: { ppg?: number | null; rpg?: number | null; apg?: number | null }) {
  const stats = [
    { label: 'PPG', value: ppg },
    { label: 'RPG', value: rpg },
    { label: 'APG', value: apg },
  ].filter((s) => s.value != null)

  if (stats.length === 0) return null

  return (
    <div className='flex items-center justify-center gap-3'>
      {stats.map((stat, i) => (
        <div key={stat.label} className='flex items-center gap-3'>
          <div className='text-center'>
            <div className='text-2xl font-bold'>{stat.value}</div>
            <div className='text-[10px] uppercase tracking-wider text-muted-foreground font-medium'>
              {stat.label}
            </div>
          </div>
          {i < stats.length - 1 && (
            <span className='text-3xl font-extralight text-muted-foreground/40'>/</span>
          )}
        </div>
      ))}
    </div>
  )
}

// Tag pill component
function TagPill({ children, color = 'default' }: { children: React.ReactNode; color?: 'default' | 'blue' | 'purple' | 'green' | 'indigo' | 'amber' | 'pink' | 'red' }) {
  const colors = {
    default: 'bg-muted text-foreground',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-300',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-300',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-300',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

// Distance pill with unique outlined style
function DistancePill({ children }: { children: React.ReactNode }) {
  return (
    <span className='px-2.5 py-1 rounded-full text-xs font-semibold border border-primary/40 dark:border-white/30 bg-transparent text-primary dark:text-white/90'>
      {children}
    </span>
  )
}

function getVideoTitle(url: string, index: number): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return `YouTube Highlight ${index + 1}`
  if (url.includes('hudl.com')) return `Hudl Highlight ${index + 1}`
  return `Highlight Video ${index + 1}`
}

export function ProfileView({
  profile,
  variant,
  tournamentSchedule,
  headerAction,
  coachId,
  canViewContact = false,
}: ProfileViewProps) {
  const playerId = profile.id
  // Only show email/contact info if canViewContact is true
  const email = canViewContact && isPlayer(profile) ? profile.email : null
  const staticNotes = !isPlayer(profile) ? profile.notes : null

  // Coach notes state (only for prospects when coachId is available)
  const [notesData, setNotesData] = useState<CoachNotesData>({
    notes: staticNotes || '',
    contactRecords: [],
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newContact, setNewContact] = useState({
    date: new Date(),
    contactType: 'email',
    summary: '',
    followUpNeeded: false,
    followUpDate: undefined as Date | undefined,
  })

  // Fetch existing notes when coachId is available (for both player and prospect views)
  useEffect(() => {
    if (!coachId) return

    async function fetchNotes() {
      try {
        const response = await fetch(`/api/coach-notes/${coachId}/${playerId}`)
        if (response.ok) {
          const data = await response.json()
          setNotesData({
            notes: data.notes || '',
            contactRecords: data.contactRecords || [],
            interestLevel: data.interestLevel,
          })
        }
      } catch (err) {
        console.error('Error fetching notes:', err)
      }
    }
    fetchNotes()
  }, [coachId, playerId, variant])

  const handleSaveNotes = async () => {
    if (!coachId) return
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/coach-notes/${coachId}/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notesData),
      })

      if (!response.ok) {
        throw new Error('Failed to save notes')
      }

      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddContact = async () => {
    if (!coachId) return
    if (!newContact.summary) {
      setError('Please add a summary for this contact')
      return
    }

    const formattedContact = {
      date: format(newContact.date, 'yyyy-MM-dd'),
      contactType: newContact.contactType,
      summary: newContact.summary,
      followUpNeeded: newContact.followUpNeeded,
      followUpDate: newContact.followUpDate
        ? format(newContact.followUpDate, 'yyyy-MM-dd')
        : undefined,
    }

    const updatedContacts = [...notesData.contactRecords, formattedContact]
    const updatedData = { ...notesData, contactRecords: updatedContacts }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/coach-notes/${coachId}/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        throw new Error('Failed to add contact record')
      }

      setNotesData(updatedData)
      setIsAddingContact(false)
      setNewContact({
        date: new Date(),
        contactType: 'email',
        summary: '',
        followUpNeeded: false,
        followUpDate: undefined,
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add contact record',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const hasStats = profile.ppg || profile.rpg || profile.apg
  const hasPhysical = profile.heightInInches || profile.weight || profile.weightedGpa || profile.unweightedGpa
  const hasSchool = profile.highSchool || profile.city || profile.state
  const hasAAU = profile.aauProgramName || profile.aauTeamName || profile.aauCircuit || profile.aauCoach || profile.aauAgeBracket
  const hasCollegePrefs = (profile.desiredLevelsOfPlay && profile.desiredLevelsOfPlay.length > 0) ||
    (profile.desiredGeographicAreas && profile.desiredGeographicAreas.length > 0) ||
    profile.desiredDistanceFromHome ||
    (profile.potentialAreasOfStudy && profile.potentialAreasOfStudy.length > 0) ||
    profile.interestedInMilitaryAcademies ||
    profile.interestedInUltraHighAcademics ||
    profile.interestedInFaithBased ||
    profile.interestedInAllGirls ||
    profile.interestedInHBCU
  const hasSpecialInterests = profile.interestedInMilitaryAcademies ||
    profile.interestedInUltraHighAcademics ||
    profile.interestedInFaithBased ||
    profile.interestedInAllGirls ||
    profile.interestedInHBCU

  const hasSidebar = hasStats || hasPhysical || hasSchool || hasAAU || hasCollegePrefs
  const hasAboutContent = profile.bio || (profile.awards && profile.awards.length > 0) || (profile.highlightVideoUrls && profile.highlightVideoUrls.length > 0)

  // Profile image component (reused in mobile and desktop positions)
  const ProfileImage = ({ className = '' }: { className?: string }) => (
    profile.profileImageUrl ? (
      <div className={`w-full aspect-square max-w-64 rounded-xl overflow-hidden bg-accent relative mx-auto lg:mx-0 ${className}`}>
        <Image
          src={profile.profileImageUrl}
          alt={`${profile.firstName} ${profile.lastName}`}
          fill
          className='object-cover'
          priority
        />
      </div>
    ) : (
      <div className={`w-full aspect-square max-w-64 rounded-xl flex items-center justify-center mx-auto lg:mx-0 ${className} ${
        variant === 'player'
          ? 'bg-linear-to-br from-orange-500 to-orange-600'
          : 'bg-linear-to-br from-purple-500 to-purple-600'
      }`}>
        <User className='w-20 h-20 text-white/80' />
      </div>
    )
  )

  return (
    <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
      {/* Left Column: Image + Sidebar (Desktop: order-1, Mobile: order-2 for sidebar) */}
      <div className='lg:w-64 shrink-0 space-y-6 order-2 lg:order-1'>
        {/* Profile Image - Desktop only */}
        <div className='hidden lg:block'>
          <ProfileImage />
        </div>

        {/* Sidebar Info */}
        {hasSidebar && (
          <div className='space-y-6'>
            {/* Stats */}
            {hasStats && (
              <div className='p-4 rounded-xl bg-muted/50'>
                <StatsRow ppg={profile.ppg} rpg={profile.rpg} apg={profile.apg} />
              </div>
            )}

            {/* Physical & Academic */}
            {hasPhysical && (
              <div className='space-y-2'>
                <SectionHeader>Physical & Academic</SectionHeader>
                <div className='space-y-1.5'>
                  <DataRow label='Height' value={profile.heightInInches ? formatHeight(profile.heightInInches) : undefined} />
                  <DataRow label='Weight' value={profile.weight ? `${profile.weight} lbs` : undefined} />
                  <DataRow label='GPA (W)' value={profile.weightedGpa?.toFixed(2)} />
                  <DataRow label='GPA (UW)' value={profile.unweightedGpa?.toFixed(2)} />
                  {profile.ncaaId && <DataRow label='NCAA ID' value={profile.ncaaId} />}
                </div>
              </div>
            )}

            {/* High School */}
            {hasSchool && (
              <div className='space-y-2'>
                <SectionHeader>High School</SectionHeader>
                <DataRow
                  value={profile.highSchool}
                  label='Name'
                />
                <DataRow
                  value={`${profile.city}${profile.city && profile.state && ', '}${profile.state}`}
                  label='Location'
                />
                {profile.schoolTeamScheduleUrl && (
                  <div className='flex justify-between items-baseline gap-2'>
                    <span className='text-sm text-muted-foreground'>Team Schedule</span>
                    <span className='text-sm font-bold'>
                      <Link
                        href={profile.schoolTeamScheduleUrl}
                        target='_blank'
                        className='inline-flex items-center gap-1.5 text-sm text-primary hover:underline'
                      >
                        View
                        <ExternalLink className='w-3.5 h-3.5' />
                      </Link>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* AAU */}
            {hasAAU && (
              <div className='space-y-2'>
                <SectionHeader>AAU Basketball</SectionHeader>
                <div className='space-y-1.5'>
                  <DataRow label='Program' value={profile.aauProgramName} />
                  <DataRow label='Team' value={profile.aauTeamName} />
                  <DataRow label='Circuit' value={getAAUCircuitLabel(profile.aauCircuit)} />
                  <DataRow label='Age Bracket' value={getAAUAgeBracketLabel(profile.aauAgeBracket)} />
                  <DataRow label='Coach' value={profile.aauCoach} />
                </div>
              </div>
            )}

            {/* College Preferences */}
            {hasCollegePrefs && (
              <div className='space-y-3'>
                <SectionHeader>College Preferences</SectionHeader>

                {profile.desiredLevelsOfPlay && profile.desiredLevelsOfPlay.length > 0 && (
                  <div>
                    <p className='text-xs text-muted-foreground mb-1.5'>Levels</p>
                    <div className='flex flex-wrap gap-1.5'>
                      {profile.desiredLevelsOfPlay.map((level: string) => (
                        <TagPill key={level} color='blue'>
                          {getLevelOfPlayLabel(level) || level}
                        </TagPill>
                      ))}
                    </div>
                  </div>
                )}

                {profile.desiredGeographicAreas && profile.desiredGeographicAreas.length > 0 && (
                  <div>
                    <p className='text-xs text-muted-foreground mb-1.5'>Regions</p>
                    <div className='flex flex-wrap gap-1.5'>
                      {profile.desiredGeographicAreas.map((area: string) => (
                        <TagPill key={area}>
                          {getGeographicAreaLabel(area) || area}
                        </TagPill>
                      ))}
                    </div>
                  </div>
                )}

                {profile.desiredDistanceFromHome && (
                  <div>
                    <p className='text-xs text-muted-foreground mb-1.5'>Desired distance from home</p>
                    <DistancePill>
                      {getDistanceFromHomeLabel(profile.desiredDistanceFromHome)}
                    </DistancePill>
                  </div>
                )}

                {profile.potentialAreasOfStudy && profile.potentialAreasOfStudy.length > 0 && (
                  <div>
                    <p className='text-xs text-muted-foreground mb-1.5'>Areas of Study</p>
                    <div className='flex flex-wrap gap-1.5'>
                      {profile.potentialAreasOfStudy.map((area: string) => (
                        <TagPill key={area} color='purple'>
                          {getAreaOfStudyLabel(area) || area}
                        </TagPill>
                      ))}
                    </div>
                  </div>
                )}

                {hasSpecialInterests && (
                  <div>
                    <p className='text-xs text-muted-foreground mb-1.5'>Special Interests</p>
                    <div className='flex flex-wrap gap-1.5'>
                      {profile.interestedInMilitaryAcademies && <TagPill color='green'>Military Academies</TagPill>}
                      {profile.interestedInUltraHighAcademics && <TagPill color='indigo'>Ultra High Academics</TagPill>}
                      {profile.interestedInFaithBased && <TagPill color='amber'>Faith-Based</TagPill>}
                      {profile.interestedInAllGirls && <TagPill color='pink'>All-Girls Schools</TagPill>}
                      {profile.interestedInHBCU && <TagPill color='red'>HBCUs</TagPill>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Main Content (Mobile: order-1, Desktop: order-2) */}
      <div className='flex-1 min-w-0 space-y-6 order-1 lg:order-2'>
        {/* Header */}
        <div>
          <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1'>
            <H1 className='text-left'>
              {profile.firstName} {profile.lastName}
            </H1>
            {variant === 'prospect' && (
              <span className='px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-full w-fit'>
                Prospect
              </span>
            )}
          </div>

          <div className='space-y-1 mb-4'>
            {profile.primaryPosition && (
              <div className='flex flex-wrap items-center gap-2 text-lg text-muted-foreground'>
                <span className='font-medium text-foreground'>
                  {getPositionLabel(profile.primaryPosition)}
                </span>
                {profile.secondaryPosition && (
                  <>
                    <span>/</span>
                    <span className='font-medium text-foreground'>
                      {getPositionLabel(profile.secondaryPosition)}
                    </span>
                  </>
                )}
              </div>
            )}
            {profile.graduationYear && (
              <div className='text-lg text-muted-foreground'>
                Class of {profile.graduationYear}
              </div>
            )}
          </div>

          {/* Profile Image - Mobile only, shows after name */}
          <div className='lg:hidden mb-6'>
            <ProfileImage />
          </div>

          {/* Contact Links - Only show for coaches (canViewContact) or when viewing prospects */}
          {(canViewContact || variant === 'prospect') && (email || profile.phoneNumber || profile.xHandle || profile.instaHandle || profile.tiktokHandle) && (
            <div className='flex flex-col flex-wrap gap-x-4 gap-y-2 mb-4'>
              {email && (
                <CopyableText
                  icon={<MailIcon className='w-4 h-4' />}
                  text={email}
                  successMsg='Email address copied'
                  errorMsg='Failed to copy'
                />
              )}
              {profile.phoneNumber && (
                <CopyableText
                  icon={<PhoneIcon className='w-4 h-4' />}
                  text={formatPhoneNumber(profile.phoneNumber)}
                  successMsg='Phone number copied'
                  errorMsg='Failed to copy'
                />
              )}
              <div className='flex flex-col sm:flex-row gap-2 sm:gap-4'>
                {profile.xHandle && (
                  <a
                    href={`https://x.com/${profile.xHandle.replace('@', '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5 text-sm hover:text-primary transition-colors'
                  >
                    <TwitterIcon className='w-4 h-4' />
                    @{profile.xHandle.replace('@', '')}
                  </a>
                )}
                {profile.instaHandle && (
                  <a
                    href={`https://instagram.com/${profile.instaHandle.replace('@', '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5 text-sm hover:text-primary transition-colors'
                  >
                    <Instagram className='w-4 h-4' />
                    @{profile.instaHandle.replace('@', '')}
                  </a>
                )}
                {profile.tiktokHandle && (
                  <a
                    href={`https://tiktok.com/@${profile.tiktokHandle.replace('@', '')}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5 text-sm hover:text-primary transition-colors'
                  >
                    <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
                      <path d='M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z' />
                    </svg>
                    @{profile.tiktokHandle.replace('@', '')}
                  </a>
                )}
              </div>
            </div>
          )}

          {headerAction}
        </div>

        {/* Tabs */}
        <Tabs defaultValue='about' className='w-full'>
          <TabsList className={`w-full sm:w-auto grid ${coachId ? 'grid-cols-4' : 'grid-cols-2'} sm:inline-flex h-auto sm:h-9 p-1 gap-1`}>
            <TabsTrigger value='about' className='text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-1'>
              <Info className='w-3.5 h-3.5 sm:mr-1.5 hidden sm:inline' />
              About
            </TabsTrigger>
            <TabsTrigger value='schedule' className='text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-1'>
              <Calendar className='w-3.5 h-3.5 sm:mr-1.5 hidden sm:inline' />
              <span className='hidden sm:inline'>Tournament </span>Schedule
            </TabsTrigger>
            {coachId && (
              <>
                <TabsTrigger value='notes' className='text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-1'>
                  <FileText className='w-3.5 h-3.5 sm:mr-1.5 hidden sm:inline' />
                  Notes
                </TabsTrigger>
                <TabsTrigger value='contact' className='text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-1'>
                  <History className='w-3.5 h-3.5 sm:mr-1.5 hidden sm:inline' />
                  <span className='hidden sm:inline'>Contact </span>History
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* About Tab */}
          <TabsContent value='about' className='mt-6 space-y-8'>
            {/* Bio */}
            {profile.bio && (
              <div>
                <H2 className='text-sm uppercase mb-3'>About</H2>
                <P className='whitespace-pre-wrap'>{profile.bio}</P>
              </div>
            )}

            {/* Awards */}
            {profile.awards && profile.awards.length > 0 && (
              <div>
                <H2 className='text-sm uppercase mb-4'>Awards & Achievements</H2>
                <div className='space-y-4'>
                  {profile.awards.map((award: any, index: number) => (
                    <div key={index} className='border-l-2 border-primary/30 pl-4'>
                      <div className='flex items-baseline gap-2 mb-0.5'>
                        <H3 className='text-base'>{award.title}</H3>
                        {award.year && <Small>{award.year}</Small>}
                      </div>
                      {award.description && <P className='text-sm'>{award.description}</P>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlight Videos */}
            {profile.highlightVideoUrls && profile.highlightVideoUrls.length > 0 && (
              <div>
                <H2 className='text-sm uppercase mb-4'>Highlight Videos</H2>
                <div className='grid gap-2'>
                  {profile.highlightVideoUrls.map((item: any, index: number) => {
                    const url = typeof item === 'object' && item.url ? item.url : item
                    if (!url) return null

                    return (
                      <a
                        key={index}
                        href={url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='group flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center'>
                            <Play className='w-4 h-4 text-primary' />
                          </div>
                          <span className='font-medium group-hover:text-primary transition-colors'>
                            {getVideoTitle(url, index)}
                          </span>
                        </div>
                        <ExternalLink className='w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors' />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {!hasAboutContent && (
              <p className='text-muted-foreground text-center py-8'>
                No additional information available.
              </p>
            )}
          </TabsContent>

          {/* Tournament Schedule Tab */}
          <TabsContent value='schedule' className='mt-6'>
            <TournamentList tournaments={tournamentSchedule} variant='full' />
          </TabsContent>

          {/* Notes Tab (Coach view) */}
          {coachId && (
            <TabsContent value='notes' className='mt-6'>
              <Card className='p-4 sm:p-6'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
                  <h2 className='text-lg sm:text-xl font-semibold'>Your Notes</h2>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant='secondary'
                      size='sm'
                      className='w-full sm:w-auto'
                    >
                      Edit Notes
                    </Button>
                  )}
                </div>

                {error && !error.includes('summary') && (
                  <Alert variant='destructive' className='mb-4'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isEditing ? (
                  <FieldGroup>
                    <Field className='gap-1'>
                      <FieldLabel htmlFor='notes'>Notes</FieldLabel>
                      <Textarea
                        id='notes'
                        value={notesData.notes}
                        onChange={(e) =>
                          setNotesData({ ...notesData, notes: e.target.value })
                        }
                        rows={6}
                        placeholder='Add your notes and observations about this player...'
                      />
                    </Field>

                    <Field className='gap-1'>
                      <FieldLabel htmlFor='interestLevel'>Interest Level</FieldLabel>
                      <Select
                        value={notesData.interestLevel || ''}
                        onValueChange={(value) =>
                          setNotesData({ ...notesData, interestLevel: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select interest level' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='high'>High Interest</SelectItem>
                          <SelectItem value='medium'>Medium Interest</SelectItem>
                          <SelectItem value='low'>Low Interest</SelectItem>
                          <SelectItem value='watching'>Watching</SelectItem>
                          <SelectItem value='not-interested'>Not Interested</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <div className='flex flex-col sm:flex-row gap-2 pt-2'>
                      <Button
                        onClick={handleSaveNotes}
                        disabled={isSaving}
                        className='w-full sm:w-auto'
                      >
                        {isSaving ? 'Saving...' : 'Save Notes'}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant='outline'
                        className='w-full sm:w-auto'
                      >
                        Cancel
                      </Button>
                    </div>
                  </FieldGroup>
                ) : (
                  <div className='text-muted-foreground whitespace-pre-wrap'>
                    {notesData.notes ||
                      'No notes yet. Click "Edit Notes" to add notes.'}
                    {notesData.interestLevel && (
                      <div className='mt-4 pt-4 border-t'>
                        <span className='text-muted-foreground'>Interest Level: </span>
                        <span className='font-medium text-foreground capitalize'>
                          {notesData.interestLevel.replace('-', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>
          )}

          {/* Contact History Tab (Coach view) */}
          {coachId && (
            <TabsContent value='contact' className='mt-6'>
              <Card className='p-4 sm:p-6'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
                  <h2 className='text-lg sm:text-xl font-semibold'>Contact History</h2>
                  {!isAddingContact && (
                    <Button
                      onClick={() => setIsAddingContact(true)}
                      variant='secondary'
                      size='sm'
                      className='w-full sm:w-auto'
                    >
                      Add Contact
                    </Button>
                  )}
                </div>

                {/* Add Contact Form */}
                {isAddingContact && (
                  <div className='bg-muted/50 p-4 rounded-lg mb-4'>
                    <FieldGroup>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <Field className='gap-1'>
                          <FieldLabel>Date</FieldLabel>
                          <DatePicker
                            date={newContact.date}
                            onDateChange={(date) =>
                              setNewContact({ ...newContact, date: date || new Date() })
                            }
                          />
                        </Field>
                        <Field className='gap-1'>
                          <FieldLabel htmlFor='contactType'>Type</FieldLabel>
                          <Select
                            value={newContact.contactType}
                            onValueChange={(value) =>
                              setNewContact({ ...newContact, contactType: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='email'>Email</SelectItem>
                              <SelectItem value='phone'>Phone Call</SelectItem>
                              <SelectItem value='text'>Text Message</SelectItem>
                              <SelectItem value='in-person'>In-Person Meeting</SelectItem>
                              <SelectItem value='video'>Video Call</SelectItem>
                              <SelectItem value='game-visit'>Game Visit</SelectItem>
                              <SelectItem value='campus-visit'>Campus Visit</SelectItem>
                              <SelectItem value='other'>Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      <Field className='gap-1'>
                        <FieldLabel htmlFor='contactSummary'>
                          Summary
                          <span className='ml-1 text-destructive' aria-label='required'>*</span>
                        </FieldLabel>
                        <Textarea
                          id='contactSummary'
                          value={newContact.summary}
                          onChange={(e) =>
                            setNewContact({ ...newContact, summary: e.target.value })
                          }
                          rows={3}
                          placeholder='What was discussed or observed...'
                        />
                        {error && error.includes('summary') && (
                          <FieldError>{error}</FieldError>
                        )}
                      </Field>

                      <div className='flex flex-col sm:flex-row gap-2'>
                        <Button
                          onClick={handleAddContact}
                          disabled={isSaving}
                          className='w-full sm:w-auto'
                        >
                          {isSaving ? 'Saving...' : 'Save Contact'}
                        </Button>
                        <Button
                          onClick={() => {
                            setIsAddingContact(false)
                            setError(null)
                          }}
                          variant='outline'
                          className='w-full sm:w-auto'
                        >
                          Cancel
                        </Button>
                      </div>
                    </FieldGroup>
                  </div>
                )}

                {/* Contact Records List */}
                <div className='space-y-3'>
                  {notesData.contactRecords.length === 0 ? (
                    <p className='text-muted-foreground text-center py-8'>
                      No contact records yet. Click &quot;Add Contact&quot; to log your first
                      interaction.
                    </p>
                  ) : (
                    notesData.contactRecords
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() - new Date(a.date).getTime(),
                      )
                      .map((contact, index) => (
                        <div
                          key={index}
                          className='bg-muted/50 p-4 rounded-lg border'
                        >
                          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0 mb-2'>
                            <div>
                              <span className='font-medium capitalize'>
                                {contact.contactType.replace('-', ' ')}
                              </span>
                              <span className='text-muted-foreground text-sm ml-2'>
                                {new Date(contact.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className='text-muted-foreground whitespace-pre-wrap text-sm sm:text-base'>
                            {contact.summary}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
