import { z } from 'zod';

export const LEVELS_OF_PLAY = [
  { label: 'Any', value: 'any' },
  { label: 'NCAA D1', value: 'ncaa-d1' },
  { label: 'NCAA D2', value: 'ncaa-d2' },
  { label: 'NCAA D3', value: 'ncaa-d3' },
  { label: 'NAIA', value: 'naia' },
  { label: 'USCAA', value: 'uscaa' },
  { label: 'NCCAA', value: 'nccaa' },
  { label: 'JUCO', value: 'juco' },
]

export const divisionLabels: Record<string, string> = {
  d1: 'NCAA D1',
  d2: 'NCAA D2',
  d3: 'NCAA D3',
  naia: 'NAIA',
  juco: 'JUCO',
  other: 'Other',
}

export const LevelOfPlaySchema = z.enum(LEVELS_OF_PLAY.map(l => l.value) as [string, ...string[]]);

export type LevelOfPlay = z.infer<typeof LevelOfPlaySchema>;

export function getLevelOfPlayLabel(value: string | null | undefined): string | null {
  if (!value) return null
  const level = LEVELS_OF_PLAY.find(l => l.value === value)
  return level ? level.label : value
}
