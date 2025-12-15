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

export function getPositionLabel(position: BasketballPosition | string): string {
  if (isValidPosition(position)) {
    return BASKETBALL_POSITIONS[position]
  }
  return position
}

export function getPositionOptions() {
  return Object.entries(BASKETBALL_POSITIONS).map(([value, label]) => ({
    value,
    label,
  }))
}
