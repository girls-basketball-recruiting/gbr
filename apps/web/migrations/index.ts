import * as migration_20251224_203329 from './20251224_203329';

export const migrations = [
  {
    up: migration_20251224_203329.up,
    down: migration_20251224_203329.down,
    name: '20251224_203329'
  },
];
