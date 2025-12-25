import { z } from 'zod';

// Specific coach positions from data source
export const COACH_POSITIONS_SPECIFIC = [
  { label: 'Head Coach', value: 'head-coach' },
  { label: 'Associate Head Coach', value: 'associate-head-coach' },
  { label: 'Assistant Coach', value: 'assistant-coach' },
  { label: 'Director of Recruiting', value: 'director-of-recruiting' },
  { label: 'Recruiting Coordinator', value: 'recruiting-coordinator' },
  { label: 'Director of Operations', value: 'director-of-operations' },
  { label: 'Director of Player Development', value: 'director-of-player-development' },
  { label: 'Assistant Director of Player Personnel', value: 'assistant-director-of-player-personnel' },
  { label: 'Graduate Assistant', value: 'graduate-assistant' },
  { label: 'Other', value: 'other' },
] as const

// Generic/simplified coach positions (for future use if needed)
export const COACH_POSITIONS_GENERIC = [
  { label: 'Head Coach', value: 'head-coach' },
  { label: 'Assistant Coach', value: 'assistant-coach' },
  { label: 'Recruiting Staff', value: 'recruiting-staff' },
  { label: 'Operations Staff', value: 'operations-staff' },
  { label: 'Player Development', value: 'player-development' },
  { label: 'Graduate Assistant', value: 'graduate-assistant' },
] as const

// Currently active positions (change this to switch between specific/generic)
export const ACTIVE_COACH_POSITIONS = COACH_POSITIONS_SPECIFIC

export const CoachPositionSchema = z.enum(ACTIVE_COACH_POSITIONS.map(p => p.value) as [string, ...string[]]);

export type CoachPosition = z.infer<typeof CoachPositionSchema>;

// Utility function to get label from value
export function getCoachPositionLabel(value: string | null | undefined): string | null {
  if (!value) return null
  const position = ACTIVE_COACH_POSITIONS.find(p => p.value === value)
  return position ? position.label : value
}
