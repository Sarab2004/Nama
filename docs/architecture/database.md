# Database Foundation

Nama uses PostgreSQL through Payload's official `@payloadcms/db-postgres` adapter. PostgreSQL provides a production-grade relational database with a version-controlled schema migration workflow. The former local SQLite file is intentionally retained and ignored by Git; it is not used by the application after this change.

## Local development

1. Copy `.env.example` to `.env` and replace all placeholder secret values with local-only values.
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Install dependencies: `pnpm install`.
4. Start the application: `pnpm dev`.

The Compose service runs the official `postgres:17` image, persists data in the `postgres_data` named volume, and exposes PostgreSQL only on `127.0.0.1`.

Payload enables Drizzle push mode automatically in Development. It keeps the local development database synchronized with the Payload config. Treat this database as a sandbox: do not run `pnpm db:migrate` against a Development database that push mode has already synchronized.

To reset only the local development database, stop the service and remove the named volume:

```bash
docker compose down -v
docker compose up -d postgres
```

This permanently removes local PostgreSQL data only. Never use it for staging or production.

## Migrations

After completing a schema change locally, create a migration and commit it:

```bash
pnpm db:migrate:create
```

Payload stores migrations in `src/migrations`. Review the generated SQL before committing it. Check migration state with:

```bash
pnpm db:migrate:status
```

Run outstanding migrations with:

```bash
pnpm db:migrate
```

`pnpm db:migrate:down` rolls back the latest migration batch and should be used only with a deliberate recovery plan. `payload migrate:fresh` and reset-style commands are destructive and must never be run against staging or production.

## Staging and production

Staging and production schemas change only through committed migrations. Configure their `DATABASE_URL`, `PAYLOAD_SECRET`, `CRON_SECRET`, and other secrets in the hosting provider's Secret Manager or environment settings; never commit real connection strings or passwords.

Run `pnpm run ci` before deploying the new application version. It executes outstanding migrations first and only then builds the application. A failed migration stops the command, so the build and deployment must not be considered successful.

The current SQLite database has not been modified, migrated, or deleted. A future data migration must use an explicit backup plus a reviewed export/import process through the Payload Local API; do not assume that SQLite content can be copied directly into PostgreSQL.
