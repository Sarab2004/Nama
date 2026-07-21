import * as migration_20260721_065055_postgres_baseline from './20260721_065055_postgres_baseline';
import * as migration_20260721_081204_add_services_collection from './20260721_081204_add_services_collection';
import * as migration_20260721_081404_add_services_redirect_relation from './20260721_081404_add_services_redirect_relation';

export const migrations = [
  {
    up: migration_20260721_065055_postgres_baseline.up,
    down: migration_20260721_065055_postgres_baseline.down,
    name: '20260721_065055_postgres_baseline',
  },
  {
    up: migration_20260721_081204_add_services_collection.up,
    down: migration_20260721_081204_add_services_collection.down,
    name: '20260721_081204_add_services_collection',
  },
  {
    up: migration_20260721_081404_add_services_redirect_relation.up,
    down: migration_20260721_081404_add_services_redirect_relation.down,
    name: '20260721_081404_add_services_redirect_relation'
  },
];
