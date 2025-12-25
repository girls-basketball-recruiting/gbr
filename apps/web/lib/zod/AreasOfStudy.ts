import { z } from 'zod';

export const AREAS_OF_STUDY = [
  { label: 'Undecided', value: 'undecided' },
  { label: 'STEM (Science, Tech, Engineering, Math)', value: 'stem' },
  { label: 'Business & Professional', value: 'business-professional' },
  { label: 'Arts & Humanities', value: 'arts-humanities' },
  { label: 'Social Science & Education', value: 'social-science-education' },
  { label: 'Health & Medicine', value: 'health-medicine' },
  { label: 'Public Service & Law', value: 'public-service-law' },
  { label: 'Other', value: 'other' },
]

export const AreaOfStudySchema = z.enum(AREAS_OF_STUDY.map(a => a.value) as [string, ...string[]]);

export type AreaOfStudy = z.infer<typeof AreaOfStudySchema>;

export function getAreaOfStudyLabel(value: string | null | undefined): string | null {
  if (!value) return null
  const area = AREAS_OF_STUDY.find(a => a.value === value)
  return area ? area.label : value
}
