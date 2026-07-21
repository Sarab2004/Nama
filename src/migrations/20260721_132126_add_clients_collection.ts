import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_clients_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__clients_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__clients_v_published_locale" AS ENUM('fa', 'en');
  CREATE TABLE "clients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"website" varchar,
  	"featured" boolean DEFAULT false,
  	"display_order" numeric,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_clients_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "clients_locales" (
  	"name" varchar,
  	"industry" varchar,
  	"short_description" varchar,
  	"description" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_clients_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_logo_id" integer,
  	"version_website" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_display_order" numeric,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__clients_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__clients_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_clients_v_locales" (
  	"version_name" varchar,
  	"version_industry" varchar,
  	"version_short_description" varchar,
  	"version_description" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "clients_id" integer;
  ALTER TABLE "clients" ADD CONSTRAINT "clients_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clients_locales" ADD CONSTRAINT "clients_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "clients_locales" ADD CONSTRAINT "clients_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_clients_v" ADD CONSTRAINT "_clients_v_parent_id_clients_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_clients_v" ADD CONSTRAINT "_clients_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_clients_v_locales" ADD CONSTRAINT "_clients_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_clients_v_locales" ADD CONSTRAINT "_clients_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_clients_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "clients_logo_idx" ON "clients" USING btree ("logo_id");
  CREATE UNIQUE INDEX "clients_slug_idx" ON "clients" USING btree ("slug");
  CREATE INDEX "clients_updated_at_idx" ON "clients" USING btree ("updated_at");
  CREATE INDEX "clients_created_at_idx" ON "clients" USING btree ("created_at");
  CREATE INDEX "clients__status_idx" ON "clients" USING btree ("_status");
  CREATE INDEX "clients_meta_meta_image_idx" ON "clients_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "clients_locales_locale_parent_id_unique" ON "clients_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_clients_v_parent_idx" ON "_clients_v" USING btree ("parent_id");
  CREATE INDEX "_clients_v_version_version_logo_idx" ON "_clients_v" USING btree ("version_logo_id");
  CREATE INDEX "_clients_v_version_version_slug_idx" ON "_clients_v" USING btree ("version_slug");
  CREATE INDEX "_clients_v_version_version_updated_at_idx" ON "_clients_v" USING btree ("version_updated_at");
  CREATE INDEX "_clients_v_version_version_created_at_idx" ON "_clients_v" USING btree ("version_created_at");
  CREATE INDEX "_clients_v_version_version__status_idx" ON "_clients_v" USING btree ("version__status");
  CREATE INDEX "_clients_v_created_at_idx" ON "_clients_v" USING btree ("created_at");
  CREATE INDEX "_clients_v_updated_at_idx" ON "_clients_v" USING btree ("updated_at");
  CREATE INDEX "_clients_v_snapshot_idx" ON "_clients_v" USING btree ("snapshot");
  CREATE INDEX "_clients_v_published_locale_idx" ON "_clients_v" USING btree ("published_locale");
  CREATE INDEX "_clients_v_latest_idx" ON "_clients_v" USING btree ("latest");
  CREATE INDEX "_clients_v_autosave_idx" ON "_clients_v" USING btree ("autosave");
  CREATE INDEX "_clients_v_version_meta_version_meta_image_idx" ON "_clients_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_clients_v_locales_locale_parent_id_unique" ON "_clients_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY ("clients_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_clients_id_idx" ON "payload_locked_documents_rels" USING btree ("clients_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "clients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "clients_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_clients_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_clients_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "clients" CASCADE;
  DROP TABLE "clients_locales" CASCADE;
  DROP TABLE "_clients_v" CASCADE;
  DROP TABLE "_clients_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_clients_fk";
  
  DROP INDEX "payload_locked_documents_rels_clients_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "clients_id";
  DROP TYPE "public"."enum_clients_status";
  DROP TYPE "public"."enum__clients_v_version_status";
  DROP TYPE "public"."enum__clients_v_published_locale";`)
}
