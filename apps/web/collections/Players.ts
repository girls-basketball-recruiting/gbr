import type { CollectionConfig } from 'payload'
import { getPositionOptions } from '@/lib/zod/Positions'
import { AAU_CIRCUITS } from '@/lib/zod/AauCircuits'
import { AREAS_OF_STUDY } from '@/lib/zod/AreasOfStudy'
import { LEVELS_OF_PLAY } from '@/lib/zod/LevelsOfPlay'
import { GEOGRAPHIC_AREAS } from '@/lib/zod/GeographicAreas'
import { DISTANCE_FROM_HOME_OPTIONS } from '@/lib/zod/DistanceFromHome'
import { baseUserFields } from './shared/baseFields'

export const Players: CollectionConfig = {
  slug: 'players',
  admin: {
    useAsTitle: 'user',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      unique: true,
      admin: {
        description: 'Link to the Clerk user account',
      },
    },
    ...baseUserFields,
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Email address (denormalized from user for easier querying)',
      },
    },
    {
      name: 'graduationYear',
      type: 'text',
      required: true,
      admin: {
        description: 'High school graduation year (e.g., "2025")',
      },
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
    {
      name: 'state',
      type: 'text',
      required: true,
    },
    {
      name: 'highSchool',
      type: 'text',
      required: true,
    },
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
          admin: {
            description: 'Year received (optional)',
          },
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
    {
      name: 'heightInInches',
      type: 'number',
      required: true,
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
      name: 'primaryPosition',
      type: 'select',
      options: getPositionOptions(),
      required: true,
    },
    {
      name: 'secondaryPosition',
      type: 'select',
      options: getPositionOptions(),
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description:
          'Tell coaches about yourself, your playing style, and goals',
      },
    },
    // AAU Info Section
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
    // Contact Info Section
    {
      name: 'phoneNumber',
      type: 'text',
      admin: {
        description: 'Contact phone number',
      },
    },
    {
      name: 'xHandle',
      type: 'text',
      admin: {
        description: 'X handle',
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
    {
      name: 'ncaaId',
      type: 'text',
      admin: {
        description: 'NCAA Eligibility Center ID',
      },
    },
    {
      name: 'profileImageUrl',
      required: true,
      type: 'text',
    },
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
    {
      name: 'tournamentSchedule',
      type: 'relationship',
      relationTo: 'tournaments',
      hasMany: true,
      admin: {
        description:
          'Select tournaments you will be attending',
      },
    },
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
    // Potential School Info Section
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
    // Status Section
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Is this player profile active?',
      },
    },
    {
      name: 'isCommitted',
      type: 'checkbox',
      admin: {
        description: 'Has the player committed to a school?',
      },
    },
    {
      name: 'committedWhere',
      type: 'text',
      admin: {
        description: 'School the player has committed to (if applicable)',
        condition: (data) => Boolean(data?.isCommitted),
      },
    },
    {
      name: 'deletedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Soft delete timestamp - if set, profile is archived',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        return data
      },
    ],
  },
  access: {
    // Admins can do everything
    admin: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
    // Coaches can read player profiles
    read: () => true,
    // Only players and admins can create
    create: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(
        user.roles &&
        (user.roles.includes('admin') || user.roles.includes('player')),
      )
    },
    // Players can update their own profile, admins can update all
    update: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      if (user.roles && user.roles.includes('admin')) return true
      // Players can only update their own profile
      return {
        user: {
          equals: user.id,
        },
      }
    },
    // Only admins can delete
    delete: ({ req: { user } }) => {
      if (!user || user.collection !== 'users') return false
      return Boolean(user.roles && user.roles.includes('admin'))
    },
  },
}
