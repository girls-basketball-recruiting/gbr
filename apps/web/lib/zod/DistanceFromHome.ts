import { z } from 'zod';

export const DISTANCE_FROM_HOME_OPTIONS = [
  { label: 'Anywhere', value: 'anywhere' },
  { label: 'Less than 2 hours', value: 'less-than-2' },
  { label: 'Less than 4 hours', value: 'less-than-4' },
  { label: 'Less than 8 hours', value: 'less-than-8' },
]

export const DistanceFromHomeSchema = z.enum(DISTANCE_FROM_HOME_OPTIONS.map(d => d.value) as [string, ...string[]]);

export type DistanceFromHome = z.infer<typeof DistanceFromHomeSchema>;

export function getDistanceFromHomeLabel(value: string | null | undefined): string | null {
  if (!value) return null
  const distance = DISTANCE_FROM_HOME_OPTIONS.find(d => d.value === value)
  return distance ? distance.label : value
}
