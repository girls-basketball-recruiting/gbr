import * as migration_20251224_203329 from './20251224_203329';
import * as migration_20260116_004713 from './20260116_004713';

export const migrations = [
  {
    up: migration_20251224_203329.up,
    down: migration_20251224_203329.down,
    name: '20251224_203329',
  },
  {
    up: migration_20260116_004713.up,
    down: migration_20260116_004713.down,
    name: '20260116_004713'
  },
];
