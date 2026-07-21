import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_company_information_phones_type" AS ENUM('landline', 'mobile', 'fax');
  CREATE TYPE "public"."enum_company_information_social_links_platform" AS ENUM('linkedin', 'instagram', 'telegram', 'youtube', 'aparat', 'x', 'whatsapp', 'other');
  CREATE TYPE "public"."enum__company_information_v_version_phones_type" AS ENUM('landline', 'mobile', 'fax');
  CREATE TYPE "public"."enum__company_information_v_version_social_links_platform" AS ENUM('linkedin', 'instagram', 'telegram', 'youtube', 'aparat', 'x', 'whatsapp', 'other');
  CREATE TABLE "company_information_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "company_information_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"type" "enum_company_information_phones_type" DEFAULT 'landline',
  	"is_primary" boolean DEFAULT false
  );
  
  CREATE TABLE "company_information_phones_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "company_information_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"address" varchar NOT NULL,
  	"is_primary" boolean DEFAULT false
  );
  
  CREATE TABLE "company_information_emails_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "company_information_working_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens_at" varchar,
  	"closes_at" varchar,
  	"is_closed" boolean DEFAULT false
  );
  
  CREATE TABLE "company_information_working_hours_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "company_information_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_company_information_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "company_information_social_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "company_information" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"address_postal_code" varchar,
  	"location_latitude" numeric,
  	"location_longitude" numeric,
  	"location_map_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "company_information_locales" (
  	"legal_name" varchar NOT NULL,
  	"short_name" varchar,
  	"introduction" jsonb,
  	"mission" varchar,
  	"vision" varchar,
  	"address_full_address" varchar,
  	"address_city" varchar,
  	"address_province" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_company_information_v_version_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_company_information_v_version_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"type" "enum__company_information_v_version_phones_type" DEFAULT 'landline',
  	"is_primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_company_information_v_version_phones_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_company_information_v_version_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"address" varchar NOT NULL,
  	"is_primary" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_company_information_v_version_emails_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_company_information_v_version_working_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"opens_at" varchar,
  	"closes_at" varchar,
  	"is_closed" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_company_information_v_version_working_hours_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_company_information_v_version_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__company_information_v_version_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_company_information_v_version_social_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_company_information_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_logo_id" integer,
  	"version_address_postal_code" varchar,
  	"version_location_latitude" numeric,
  	"version_location_longitude" numeric,
  	"version_location_map_url" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_company_information_v_locales" (
  	"version_legal_name" varchar NOT NULL,
  	"version_short_name" varchar,
  	"version_introduction" jsonb,
  	"version_mission" varchar,
  	"version_vision" varchar,
  	"version_address_full_address" varchar,
  	"version_address_city" varchar,
  	"version_address_province" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "company_information_values" ADD CONSTRAINT "company_information_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_information"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_information_phones" ADD CONSTRAINT "company_information_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_information"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_information_phones_locales" ADD CONSTRAINT "company_information_phones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_information_phones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_information_emails" ADD CONSTRAINT "company_information_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_information"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_information_emails_locales" ADD CONSTRAINT "company_information_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_information_emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_information_working_hours" ADD CONSTRAINT "company_information_working_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_information"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_information_working_hours_locales" ADD CONSTRAINT "company_information_working_hours_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_information_working_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_information_social_links" ADD CONSTRAINT "company_information_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_information"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_information_social_links_locales" ADD CONSTRAINT "company_information_social_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_information_social_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_information" ADD CONSTRAINT "company_information_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "company_information_locales" ADD CONSTRAINT "company_information_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_information"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_company_information_v_version_values" ADD CONSTRAINT "_company_information_v_version_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_company_information_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_company_information_v_version_phones" ADD CONSTRAINT "_company_information_v_version_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_company_information_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_company_information_v_version_phones_locales" ADD CONSTRAINT "_company_information_v_version_phones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_company_information_v_version_phones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_company_information_v_version_emails" ADD CONSTRAINT "_company_information_v_version_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_company_information_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_company_information_v_version_emails_locales" ADD CONSTRAINT "_company_information_v_version_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_company_information_v_version_emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_company_information_v_version_working_hours" ADD CONSTRAINT "_company_information_v_version_working_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_company_information_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_company_information_v_version_working_hours_locales" ADD CONSTRAINT "_company_information_v_version_working_hours_locales_pare_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_company_information_v_version_working_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_company_information_v_version_social_links" ADD CONSTRAINT "_company_information_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_company_information_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_company_information_v_version_social_links_locales" ADD CONSTRAINT "_company_information_v_version_social_links_locales_paren_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_company_information_v_version_social_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_company_information_v" ADD CONSTRAINT "_company_information_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_company_information_v_locales" ADD CONSTRAINT "_company_information_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_company_information_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "company_information_values_order_idx" ON "company_information_values" USING btree ("_order");
  CREATE INDEX "company_information_values_parent_id_idx" ON "company_information_values" USING btree ("_parent_id");
  CREATE INDEX "company_information_values_locale_idx" ON "company_information_values" USING btree ("_locale");
  CREATE INDEX "company_information_phones_order_idx" ON "company_information_phones" USING btree ("_order");
  CREATE INDEX "company_information_phones_parent_id_idx" ON "company_information_phones" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "company_information_phones_locales_locale_parent_id_unique" ON "company_information_phones_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "company_information_emails_order_idx" ON "company_information_emails" USING btree ("_order");
  CREATE INDEX "company_information_emails_parent_id_idx" ON "company_information_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "company_information_emails_locales_locale_parent_id_unique" ON "company_information_emails_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "company_information_working_hours_order_idx" ON "company_information_working_hours" USING btree ("_order");
  CREATE INDEX "company_information_working_hours_parent_id_idx" ON "company_information_working_hours" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "company_information_working_hours_locales_locale_parent_id_u" ON "company_information_working_hours_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "company_information_social_links_order_idx" ON "company_information_social_links" USING btree ("_order");
  CREATE INDEX "company_information_social_links_parent_id_idx" ON "company_information_social_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "company_information_social_links_locales_locale_parent_id_un" ON "company_information_social_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "company_information_logo_idx" ON "company_information" USING btree ("logo_id");
  CREATE UNIQUE INDEX "company_information_locales_locale_parent_id_unique" ON "company_information_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_company_information_v_version_values_order_idx" ON "_company_information_v_version_values" USING btree ("_order");
  CREATE INDEX "_company_information_v_version_values_parent_id_idx" ON "_company_information_v_version_values" USING btree ("_parent_id");
  CREATE INDEX "_company_information_v_version_values_locale_idx" ON "_company_information_v_version_values" USING btree ("_locale");
  CREATE INDEX "_company_information_v_version_phones_order_idx" ON "_company_information_v_version_phones" USING btree ("_order");
  CREATE INDEX "_company_information_v_version_phones_parent_id_idx" ON "_company_information_v_version_phones" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_company_information_v_version_phones_locales_locale_parent_" ON "_company_information_v_version_phones_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_company_information_v_version_emails_order_idx" ON "_company_information_v_version_emails" USING btree ("_order");
  CREATE INDEX "_company_information_v_version_emails_parent_id_idx" ON "_company_information_v_version_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_company_information_v_version_emails_locales_locale_parent_" ON "_company_information_v_version_emails_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_company_information_v_version_working_hours_order_idx" ON "_company_information_v_version_working_hours" USING btree ("_order");
  CREATE INDEX "_company_information_v_version_working_hours_parent_id_idx" ON "_company_information_v_version_working_hours" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_company_information_v_version_working_hours_locales_locale_" ON "_company_information_v_version_working_hours_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_company_information_v_version_social_links_order_idx" ON "_company_information_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_company_information_v_version_social_links_parent_id_idx" ON "_company_information_v_version_social_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_company_information_v_version_social_links_locales_locale_p" ON "_company_information_v_version_social_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_company_information_v_version_version_logo_idx" ON "_company_information_v" USING btree ("version_logo_id");
  CREATE INDEX "_company_information_v_created_at_idx" ON "_company_information_v" USING btree ("created_at");
  CREATE INDEX "_company_information_v_updated_at_idx" ON "_company_information_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_company_information_v_locales_locale_parent_id_unique" ON "_company_information_v_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "company_information_values" CASCADE;
  DROP TABLE "company_information_phones" CASCADE;
  DROP TABLE "company_information_phones_locales" CASCADE;
  DROP TABLE "company_information_emails" CASCADE;
  DROP TABLE "company_information_emails_locales" CASCADE;
  DROP TABLE "company_information_working_hours" CASCADE;
  DROP TABLE "company_information_working_hours_locales" CASCADE;
  DROP TABLE "company_information_social_links" CASCADE;
  DROP TABLE "company_information_social_links_locales" CASCADE;
  DROP TABLE "company_information" CASCADE;
  DROP TABLE "company_information_locales" CASCADE;
  DROP TABLE "_company_information_v_version_values" CASCADE;
  DROP TABLE "_company_information_v_version_phones" CASCADE;
  DROP TABLE "_company_information_v_version_phones_locales" CASCADE;
  DROP TABLE "_company_information_v_version_emails" CASCADE;
  DROP TABLE "_company_information_v_version_emails_locales" CASCADE;
  DROP TABLE "_company_information_v_version_working_hours" CASCADE;
  DROP TABLE "_company_information_v_version_working_hours_locales" CASCADE;
  DROP TABLE "_company_information_v_version_social_links" CASCADE;
  DROP TABLE "_company_information_v_version_social_links_locales" CASCADE;
  DROP TABLE "_company_information_v" CASCADE;
  DROP TABLE "_company_information_v_locales" CASCADE;
  DROP TYPE "public"."enum_company_information_phones_type";
  DROP TYPE "public"."enum_company_information_social_links_platform";
  DROP TYPE "public"."enum__company_information_v_version_phones_type";
  DROP TYPE "public"."enum__company_information_v_version_social_links_platform";`)
}
