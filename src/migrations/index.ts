import * as migration_20260721_065055_postgres_baseline from './20260721_065055_postgres_baseline';
import * as migration_20260721_081204_add_services_collection from './20260721_081204_add_services_collection';
import * as migration_20260721_081404_add_services_redirect_relation from './20260721_081404_add_services_redirect_relation';
import * as migration_20260721_095301_add_company_information_global from './20260721_095301_add_company_information_global';
import * as migration_20260721_132126_add_clients_collection from './20260721_132126_add_clients_collection';
import * as migration_20260721_134737_add_projects_collection from './20260721_134737_add_projects_collection';
import * as migration_20260721_143116_add_projects_search_redirect_relations from './20260721_143116_add_projects_search_redirect_relations';
import * as migration_20260722_100954_add_clients_search_redirect_relations from './20260722_100954_add_clients_search_redirect_relations';

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
    name: '20260721_081404_add_services_redirect_relation',
  },
  {
    up: migration_20260721_095301_add_company_information_global.up,
    down: migration_20260721_095301_add_company_information_global.down,
    name: '20260721_095301_add_company_information_global',
  },
  {
    up: migration_20260721_132126_add_clients_collection.up,
    down: migration_20260721_132126_add_clients_collection.down,
    name: '20260721_132126_add_clients_collection',
  },
  {
    up: migration_20260721_134737_add_projects_collection.up,
    down: migration_20260721_134737_add_projects_collection.down,
    name: '20260721_134737_add_projects_collection',
  },
  {
    up: migration_20260721_143116_add_projects_search_redirect_relations.up,
    down: migration_20260721_143116_add_projects_search_redirect_relations.down,
    name: '20260721_143116_add_projects_search_redirect_relations',
  },
  {
    up: migration_20260722_100954_add_clients_search_redirect_relations.up,
    down: migration_20260722_100954_add_clients_search_redirect_relations.down,
    name: '20260722_100954_add_clients_search_redirect_relations'
  },
];
