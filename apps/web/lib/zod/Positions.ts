import { z } from 'zod';

// Legacy positions (kept for backward compatibility)
export const LEGACY_BASKETBALL_POSITIONS = {
  'point-guard': 'Point Guard',
  'shooting-guard': 'Shooting Guard',
  'small-forward': 'Small Forward',
  'power-forward': 'Power Forward',
  center: 'Center',
} as const;

export const LegacyBasketballPositionSchema = z.enum(Object.keys(LEGACY_BASKETBALL_POSITIONS) as [keyof typeof LEGACY_BASKETBALL_POSITIONS, ...Array<keyof typeof LEGACY_BASKETBALL_POSITIONS>]);

export type LegacyBasketballPosition = z.infer<typeof LegacyBasketballPositionSchema>;

// Current positions (as per new questionnaire)
export const BASKETBALL_POSITIONS = {
  'point-guard': 'Point Guard',
  'combo-guard': 'Combo Guard',
  'wing': 'Wing',
  'stretch-4': 'Stretch 4',
  'power-4': 'Power 4',
  'post': 'Post',
} as const;

export const BasketballPositionSchema = z.enum(Object.keys(BASKETBALL_POSITIONS) as [keyof typeof BASKETBALL_POSITIONS, ...Array<keyof typeof BASKETBALL_POSITIONS>]);

export type BasketballPosition = z.infer<typeof BasketballPositionSchema>;

// Combined type for backward compatibility
export const AnyBasketballPositionSchema = z.union([
  LegacyBasketballPositionSchema,
  BasketballPositionSchema,
]);

export type AnyBasketballPosition = z.infer<typeof AnyBasketballPositionSchema>;

export function isValidPosition(value: string): value is AnyBasketballPosition {
  return value in BASKETBALL_POSITIONS || value in LEGACY_BASKETBALL_POSITIONS
}

export function getPositionLabel(position: AnyBasketballPosition | string): string {
  if (position in BASKETBALL_POSITIONS) {
    return BASKETBALL_POSITIONS[position as BasketballPosition]
  }
  if (position in LEGACY_BASKETBALL_POSITIONS) {
    return LEGACY_BASKETBALL_POSITIONS[position as LegacyBasketballPosition]
  }
  return position
}

export function getPositionOptions() {
  return Object.entries(BASKETBALL_POSITIONS).map(([value, label]) => ({
    value,
    label,
  }))
}

export function getLegacyPositionOptions() {
  return Object.entries(LEGACY_BASKETBALL_POSITIONS).map(([value, label]) => ({
    value,
    label,
  }))
}
