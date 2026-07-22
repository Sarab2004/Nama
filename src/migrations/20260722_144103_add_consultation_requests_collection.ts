import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds consultation-requests collection + Page Builder block tables.
 * Company About/Contact block tables already exist in production DBs (shipped without a
 * prior migration entry); they are intentionally omitted here to avoid CREATE TABLE conflicts.
 * The companion .json snapshot still reflects the full schema for future migrate:create diffs.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_pages_blocks_consultation_request_inquiry_type" AS ENUM('service-consultation', 'project-inquiry', 'partnership', 'general', 'other');
  CREATE TYPE "public"."enum_pages_blocks_consultation_request_appearance" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum__pages_v_blocks_consultation_request_inquiry_type" AS ENUM('service-consultation', 'project-inquiry', 'partnership', 'general', 'other');
  CREATE TYPE "public"."enum__pages_v_blocks_consultation_request_appearance" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum_consultation_requests_preferred_contact_method" AS ENUM('phone', 'email', 'either');
  CREATE TYPE "public"."enum_consultation_requests_inquiry_type" AS ENUM('service-consultation', 'project-inquiry', 'partnership', 'general', 'other');
  CREATE TYPE "public"."enum_consultation_requests_locale" AS ENUM('fa', 'en');
  CREATE TYPE "public"."enum_consultation_requests_source_type" AS ENUM('contact-page', 'service', 'project', 'client', 'page', 'other');
  CREATE TYPE "public"."enum_consultation_requests_status" AS ENUM('new', 'contacted', 'qualified', 'in-progress', 'converted', 'closed', 'spam');

  CREATE TABLE "pages_blocks_consultation_request" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"show_company_field" boolean DEFAULT true,
  	"show_job_title_field" boolean DEFAULT true,
  	"allow_service_selection" boolean DEFAULT true,
  	"default_service_id" integer,
  	"inquiry_type" "enum_pages_blocks_consultation_request_inquiry_type" DEFAULT 'general',
  	"success_message" varchar,
  	"appearance" "enum_pages_blocks_consultation_request_appearance" DEFAULT 'full',
  	"block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_consultation_request" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"show_company_field" boolean DEFAULT true,
  	"show_job_title_field" boolean DEFAULT true,
  	"allow_service_selection" boolean DEFAULT true,
  	"default_service_id" integer,
  	"inquiry_type" "enum__pages_v_blocks_consultation_request_inquiry_type" DEFAULT 'general',
  	"success_message" varchar,
  	"appearance" "enum__pages_v_blocks_consultation_request_appearance" DEFAULT 'full',
  	"_uuid" varchar,
  	"block_name" varchar
  );

  CREATE TABLE "consultation_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"full_name" varchar NOT NULL,
  	"company_name" varchar,
  	"job_title" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"preferred_contact_method" "enum_consultation_requests_preferred_contact_method" DEFAULT 'either',
  	"preferred_contact_time" varchar,
  	"inquiry_type" "enum_consultation_requests_inquiry_type" DEFAULT 'general',
  	"related_project_id" integer,
  	"message" varchar NOT NULL,
  	"consent_to_contact" boolean DEFAULT false NOT NULL,
  	"consent_text" varchar,
  	"locale" "enum_consultation_requests_locale" DEFAULT 'fa' NOT NULL,
  	"source_path" varchar,
  	"source_type" "enum_consultation_requests_source_type" DEFAULT 'other',
  	"referrer" varchar,
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"utm_term" varchar,
  	"utm_content" varchar,
  	"status" "enum_consultation_requests_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer,
  	"internal_notes" varchar,
  	"submitted_at" timestamp(3) with time zone,
  	"contacted_at" timestamp(3) with time zone,
  	"closed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "consultation_requests_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"services_id" integer
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "consultation_requests_id" integer;

  ALTER TABLE "pages_blocks_consultation_request" ADD CONSTRAINT "pages_blocks_consultation_request_default_service_id_services_id_fk" FOREIGN KEY ("default_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_consultation_request" ADD CONSTRAINT "pages_blocks_consultation_request_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_consultation_request" ADD CONSTRAINT "_pages_v_blocks_consultation_request_default_service_id_services_id_fk" FOREIGN KEY ("default_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_consultation_request" ADD CONSTRAINT "_pages_v_blocks_consultation_request_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "consultation_requests_rels" ADD CONSTRAINT "consultation_requests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."consultation_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consultation_requests_rels" ADD CONSTRAINT "consultation_requests_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;

  CREATE INDEX "pages_blocks_consultation_request_order_idx" ON "pages_blocks_consultation_request" USING btree ("_order");
  CREATE INDEX "pages_blocks_consultation_request_parent_id_idx" ON "pages_blocks_consultation_request" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_consultation_request_path_idx" ON "pages_blocks_consultation_request" USING btree ("_path");
  CREATE INDEX "pages_blocks_consultation_request_locale_idx" ON "pages_blocks_consultation_request" USING btree ("_locale");
  CREATE INDEX "pages_blocks_consultation_request_default_service_idx" ON "pages_blocks_consultation_request" USING btree ("default_service_id");
  CREATE INDEX "_pages_v_blocks_consultation_request_order_idx" ON "_pages_v_blocks_consultation_request" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_consultation_request_parent_id_idx" ON "_pages_v_blocks_consultation_request" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_consultation_request_path_idx" ON "_pages_v_blocks_consultation_request" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_consultation_request_locale_idx" ON "_pages_v_blocks_consultation_request" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_consultation_request_default_service_idx" ON "_pages_v_blocks_consultation_request" USING btree ("default_service_id");
  CREATE INDEX "consultation_requests_related_project_idx" ON "consultation_requests" USING btree ("related_project_id");
  CREATE INDEX "consultation_requests_assigned_to_idx" ON "consultation_requests" USING btree ("assigned_to_id");
  CREATE INDEX "consultation_requests_status_idx" ON "consultation_requests" USING btree ("status");
  CREATE INDEX "consultation_requests_submitted_at_idx" ON "consultation_requests" USING btree ("submitted_at");
  CREATE INDEX "consultation_requests_updated_at_idx" ON "consultation_requests" USING btree ("updated_at");
  CREATE INDEX "consultation_requests_created_at_idx" ON "consultation_requests" USING btree ("created_at");
  CREATE INDEX "consultation_requests_rels_order_idx" ON "consultation_requests_rels" USING btree ("order");
  CREATE INDEX "consultation_requests_rels_parent_idx" ON "consultation_requests_rels" USING btree ("parent_id");
  CREATE INDEX "consultation_requests_rels_path_idx" ON "consultation_requests_rels" USING btree ("path");
  CREATE INDEX "consultation_requests_rels_services_id_idx" ON "consultation_requests_rels" USING btree ("services_id");

  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_consultation_requests_fk" FOREIGN KEY ("consultation_requests_id") REFERENCES "public"."consultation_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_consultation_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("consultation_requests_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages_blocks_consultation_request" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_consultation_request" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "consultation_requests" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "consultation_requests_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_consultation_request" CASCADE;
  DROP TABLE "_pages_v_blocks_consultation_request" CASCADE;
  DROP TABLE "consultation_requests" CASCADE;
  DROP TABLE "consultation_requests_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_consultation_requests_fk";
  DROP INDEX "payload_locked_documents_rels_consultation_requests_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "consultation_requests_id";
  DROP TYPE "public"."enum_pages_blocks_consultation_request_inquiry_type";
  DROP TYPE "public"."enum_pages_blocks_consultation_request_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_consultation_request_inquiry_type";
  DROP TYPE "public"."enum__pages_v_blocks_consultation_request_appearance";
  DROP TYPE "public"."enum_consultation_requests_preferred_contact_method";
  DROP TYPE "public"."enum_consultation_requests_inquiry_type";
  DROP TYPE "public"."enum_consultation_requests_locale";
  DROP TYPE "public"."enum_consultation_requests_source_type";
  DROP TYPE "public"."enum_consultation_requests_status";
  `)
}
