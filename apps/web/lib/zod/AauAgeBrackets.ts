import { z } from 'zod';

export const AAU_AGE_BRACKETS = [
  { label: 'U17', value: 'u17' },
  { label: 'U16', value: 'u16' },
  { label: 'U15', value: 'u15' },
  { label: 'U14', value: 'u14' },
]

export const AauAgeBracketSchema = z.enum(AAU_AGE_BRACKETS.map(c => c.value) as [string, ...string[]]);

export type AauAgeBracket = z.infer<typeof AauAgeBracketSchema>;

export function getAAUAgeBracketLabel(value: string | null | undefined): string | null {
  if (!value) return null
  const bracket = AAU_AGE_BRACKETS.find(b => b.value === value)
  return bracket ? bracket.label : value
}
