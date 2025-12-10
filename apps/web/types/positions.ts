export type BasketballPosition =
  | 'point-guard'
  | 'shooting-guard'
  | 'small-forward'
  | 'power-forward'
  | 'center'

export const BASKETBALL_POSITIONS: Record<BasketballPosition, string> = {
  'point-guard': 'Point Guard',
  'shooting-guard': 'Shooting Guard',
  'small-forward': 'Small Forward',
  'power-forward': 'Power Forward',
  center: 'Center',
}

export function isValidPosition(value: string): value is BasketballPosition {
  return value in BASKETBALL_POSITIONS
}
