import * as migration_20260721_065055_postgres_baseline from './20260721_065055_postgres_baseline';

export const migrations = [
  {
    up: migration_20260721_065055_postgres_baseline.up,
    down: migration_20260721_065055_postgres_baseline.down,
    name: '20260721_065055_postgres_baseline'
  },
];
