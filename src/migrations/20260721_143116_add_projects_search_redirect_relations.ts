import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Idempotent: local/dev DBs may already have these columns from push mode.
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'redirects_rels'
          AND column_name = 'projects_id'
      ) THEN
        ALTER TABLE "redirects_rels" ADD COLUMN "projects_id" integer;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search_rels'
          AND column_name = 'projects_id'
      ) THEN
        ALTER TABLE "search_rels" ADD COLUMN "projects_id" integer;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'redirects_rels_projects_fk'
      ) THEN
        ALTER TABLE "redirects_rels"
          ADD CONSTRAINT "redirects_rels_projects_fk"
          FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'search_rels_projects_fk'
      ) THEN
        ALTER TABLE "search_rels"
          ADD CONSTRAINT "search_rels_projects_fk"
          FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'redirects_rels_projects_id_idx'
          AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "redirects_rels_projects_id_idx"
          ON "redirects_rels" USING btree ("projects_id");
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'search_rels_projects_id_idx'
          AND n.nspname = 'public'
      ) THEN
        CREATE INDEX "search_rels_projects_id_idx"
          ON "search_rels" USING btree ("projects_id");
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'redirects_rels_projects_fk'
      ) THEN
        ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_projects_fk";
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'search_rels_projects_fk'
      ) THEN
        ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_projects_fk";
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'redirects_rels_projects_id_idx'
          AND n.nspname = 'public'
      ) THEN
        DROP INDEX "redirects_rels_projects_id_idx";
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'search_rels_projects_id_idx'
          AND n.nspname = 'public'
      ) THEN
        DROP INDEX "search_rels_projects_id_idx";
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'redirects_rels'
          AND column_name = 'projects_id'
      ) THEN
        ALTER TABLE "redirects_rels" DROP COLUMN "projects_id";
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'search_rels'
          AND column_name = 'projects_id'
      ) THEN
        ALTER TABLE "search_rels" DROP COLUMN "projects_id";
      END IF;
    END $$;
  `)
}
