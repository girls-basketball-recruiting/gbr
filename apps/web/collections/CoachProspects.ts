import type { CollectionConfig } from 'payload'
import { getPositionOptions } from '@/lib/zod/Positions'
import { AAU_CIRCUITS } from '@/lib/zod/AauCircuits'
import { AAU_AGE_BRACKETS } from '@/lib/zod/AauAgeBrackets'
import { AREAS_OF_STUDY } from '@/lib/zod/AreasOfStudy'
import { LEVELS_OF_PLAY } from '@/lib/zod/LevelsOfPlay'
import { GEOGRAPHIC_AREAS } from '@/lib/zod/GeographicAreas'
import { DISTANCE_FROM_HOME_OPTIONS } from '@/lib/zod/DistanceFromHome'

export const CoachProspects: CollectionConfig = {
  slug: 'coach-prospects',
  admin: {
    useAsTitle: 'lastName',
    defaultColumns: ['firstName', 'lastName', 'graduationYear', 'highSchool', 'coach'],
    hidden: true, // Hidden from sidebar - accessed via Coach tabs
  },
  fields: [
    // Ownership
    {
      name: 'coach',
      type: 'relationship',
      relationTo: 'coaches',
      required: true,
      hasMany: false,
      admin: {
        description: 'The coach who created this prospect entry',
      },
    },
    // Required Fields (only name is required)
    {
      name: 'firstName',
      type: 'text',
      required: true,
      admin: {
        description: 'First name of the prospect',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      admin: {
        description: 'Last name of the prospect',
      },
    },
    // Profile Image
    {
      name: 'profileImageUrl',
      type: 'text',
      admin: {
        description: 'URL to profile image (uploaded via blob storage)',
      },
    },
    // Basic Info
    {
      name: 'graduationYear',
      type: 'number',
      admin: {
        description: 'High school graduation year (Class of)',
      },
    },
    {
      name: 'city',
      type: 'text',
      admin: {
        description: 'City',
      },
    },
    {
      name: 'state',
      type: 'text',
      admin: {
        description: 'State',
      },
    },
    {
      name: 'highSchool',
      type: 'text',
      admin: {
        description: 'High school name',
      },
    },
    {
      name: 'schoolTeamScheduleUrl',
      type: 'text',
      admin: {
        description: 'URL to school team schedule (MaxPreps, etc.)',
      },
    },
    // Athletic Profile
    {
      name: 'primaryPosition',
      type: 'select',
      options: getPositionOptions(),
      admin: {
        description: 'Primary playing position',
      },
    },
    {
      name: 'secondaryPosition',
      type: 'select',
      options: getPositionOptions(),
      admin: {
        description: 'Secondary playing position',
      },
    },
    {
      name: 'heightInInches',
      type: 'number',
      admin: {
        description: 'Height in total inches',
      },
    },
    {
      name: 'weight',
      type: 'number',
      admin: {
        description: 'Weight in pounds (lbs)',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Bio/description of the prospect',
      },
    },
    // AAU Info
    {
      name: 'aauProgramName',
      type: 'text',
      admin: {
        description: 'AAU Program name',
      },
    },
    {
      name: 'aauTeamName',
      type: 'text',
      admin: {
        description: 'AAU Team name',
      },
    },
    {
      name: 'aauCircuit',
      type: 'select',
      options: AAU_CIRCUITS,
      admin: {
        description: 'AAU Circuit/League',
      },
    },
    {
      name: 'aauCoach',
      type: 'text',
      admin: {
        description: 'AAU Coach name',
      },
    },
    {
      name: 'aauAgeBracket',
      type: 'select',
      options: AAU_AGE_BRACKETS,
      admin: {
        description: 'AAU Age Bracket',
      },
    },
    // Stats
    {
      name: 'ppg',
      type: 'number',
      admin: {
        description: 'Points per game',
      },
    },
    {
      name: 'rpg',
      type: 'number',
      admin: {
        description: 'Rebounds per game',
      },
    },
    {
      name: 'apg',
      type: 'number',
      admin: {
        description: 'Assists per game',
      },
    },
    // Academic
    {
      name: 'unweightedGpa',
      type: 'number',
      admin: {
        description: 'Unweighted GPA',
      },
    },
    {
      name: 'weightedGpa',
      type: 'number',
      admin: {
        description: 'Weighted GPA',
      },
    },
    {
      name: 'potentialAreasOfStudy',
      type: 'select',
      hasMany: true,
      options: AREAS_OF_STUDY,
      admin: {
        description: 'Potential areas of study',
      },
    },
    {
      name: 'ncaaId',
      type: 'text',
      admin: {
        description: 'NCAA Eligibility Center ID',
      },
    },
    // Awards
    {
      name: 'awards',
      type: 'array',
      maxRows: 10,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'year',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Additional details (optional)',
          },
        },
      ],
      admin: {
        description: 'Add up to 10 awards, honors, and achievements',
      },
    },
    // Highlight Videos
    {
      name: 'highlightVideoUrls',
      type: 'array',
      maxRows: 10,
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Add up to 10 highlight video URLs (YouTube, Hudl, etc.)',
      },
    },
    // Tournament Schedule
    {
      name: 'tournamentSchedule',
      type: 'relationship',
      relationTo: 'tournaments',
      hasMany: true,
      admin: {
        description: 'Tournaments this prospect will be attending',
      },
    },
    // College Preferences
    {
      name: 'desiredLevelsOfPlay',
      type: 'select',
      hasMany: true,
      options: LEVELS_OF_PLAY,
      admin: {
        description: 'Desired levels of collegiate play',
      },
    },
    {
      name: 'desiredGeographicAreas',
      type: 'select',
      hasMany: true,
      options: GEOGRAPHIC_AREAS,
      admin: {
        description: 'Desired geographic areas',
      },
    },
    {
      name: 'desiredDistanceFromHome',
      type: 'select',
      options: DISTANCE_FROM_HOME_OPTIONS,
      admin: {
        description: 'Desired distance from home',
      },
    },
    {
      name: 'interestedInMilitaryAcademies',
      type: 'checkbox',
      admin: {
        description: 'Interested in Military Academies',
      },
    },
    {
      name: 'interestedInUltraHighAcademics',
      type: 'checkbox',
      admin: {
        description: 'Interested in Ultra High Academics',
      },
    },
    {
      name: 'interestedInFaithBased',
      type: 'checkbox',
      admin: {
        description: 'Interested in Faith-Based institutions',
      },
    },
    {
      name: 'interestedInAllGirls',
      type: 'checkbox',
      admin: {
        description: 'Interested in All Girls schools',
      },
    },
    {
      name: 'interestedInHBCU',
      type: 'checkbox',
      admin: {
        description: 'Interested in HBCUs',
      },
    },
    // Contact Info
    {
      name: 'phoneNumber',
      type: 'text',
      admin: {
        description: 'Phone number for contact',
      },
    },
    {
      name: 'xHandle',
      type: 'text',
      admin: {
        description: 'X/Twitter handle',
      },
    },
    {
      name: 'instaHandle',
      type: 'text',
      admin: {
        description: 'Instagram handle',
      },
    },
    {
      name: 'tiktokHandle',
      type: 'text',
      admin: {
        description: 'TikTok handle',
      },
    },
    // Coach-specific fields
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Private notes about this prospect (only visible to you)',
      },
    },
    {
      name: 'linkedPlayer',
      type: 'relationship',
      relationTo: 'players',
      hasMany: false,
      admin: {
        description:
          'Optional: Link to registered player if they join the platform',
      },
    },
  ],
  access: {
    // Coaches can only see their own prospects
    read: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true

      // Return filter to only show prospects belonging to this coach
      return {
        coach: {
          equals: user.id,
        },
      }
    },
    // Only coaches and admins can create prospects
    create: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(
        user.roles &&
          (user.roles.includes('admin') || user.roles.includes('coach')),
      )
    },
    // Coaches can only update their own prospects
    update: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true

      return {
        coach: {
          equals: user.id,
        },
      }
    },
    // Coaches can only delete their own prospects
    delete: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true

      return {
        coach: {
          equals: user.id,
        },
      }
    },
  },
}
