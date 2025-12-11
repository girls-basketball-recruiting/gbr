import * as migration_20251211_171140 from './20251211_171140';

export const migrations = [
  {
    up: migration_20251211_171140.up,
    down: migration_20251211_171140.down,
    name: '20251211_171140'
  },
];
