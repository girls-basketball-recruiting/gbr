import { z } from 'zod';

export const GEOGRAPHIC_AREAS = [
  { label: 'Anywhere', value: 'anywhere' },
  { label: 'Northeast', value: 'northeast' },
  { label: 'Mid-Atlantic', value: 'mid-atlantic' },
  { label: 'Deep South', value: 'deep-south' },
  { label: 'Midwest', value: 'midwest' },
  { label: 'South', value: 'south' },
  { label: 'Rocky Mountain', value: 'rocky-mountain' },
  { label: 'West Coast', value: 'west-coast' },
  { label: 'Pacific Northwest', value: 'pacific-northwest' },
  { label: 'Other', value: 'other' },
]

export const GeographicAreaSchema = z.enum(GEOGRAPHIC_AREAS.map(g => g.value) as [string, ...string[]]);

export type GeographicArea = z.infer<typeof GeographicAreaSchema>;

export function getGeographicAreaLabel(value: string | null | undefined): string | null {
  if (!value) return null
  const area = GEOGRAPHIC_AREAS.find(a => a.value === value)
  return area ? area.label : value
}
