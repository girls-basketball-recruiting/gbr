import { z } from 'zod';

export const AAU_CIRCUITS = [
  { label: 'Nike EYBL', value: 'nike-eybl' },
  { label: 'UAA', value: 'uaa' },
  { label: 'Power24', value: 'power24' },
  { label: 'Adidas 3SSB', value: 'adidas-3ssb' },
  { label: 'Select 40', value: 'select-40' },
  { label: 'New Balance Lady P32', value: 'new-balance-lady-p32' },
  { label: 'Puma NXTPro 16', value: 'puma-nxtpro-16' },
  { label: 'Elite 40', value: 'elite-40' },
  { label: 'Hoop Group', value: 'hoop-group' },
  { label: 'Nike ECYL', value: 'nike-ecyl' },
  { label: 'UA Rise', value: 'ua-rise' },
  { label: 'Crossroads', value: 'crossroads' },
  { label: 'Adidas Gold', value: 'adidas-gold' },
  { label: 'Prep Girls Hoops', value: 'prep-girls-hoops' },
  { label: 'New Balance Lady E32', value: 'new-balance-lady-e32' },
  { label: 'Puma NXT League', value: 'puma-nxt-league' },
  { label: 'Insider Exposure', value: 'insider-exposure' },
  { label: 'Hype Her Hoops', value: 'hype-her-hoops' },
  { label: 'Other', value: 'other' },
  { label: 'Independent', value: 'independent' },
]

export const AauCircuitSchema = z.enum(AAU_CIRCUITS.map(c => c.value) as [string, ...string[]]);

export type AauCircuit = z.infer<typeof AauCircuitSchema>;

export function getAAUCircuitLabel(value: string | null | undefined): string | null {
  if (!value) return null
  const circuit = AAU_CIRCUITS.find(c => c.value === value)
  return circuit ? circuit.label : value
}