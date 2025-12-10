import {
  MigrateUpArgs,
  MigrateDownArgs,
  sql,
} from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'player', 'coach');
  CREATE TYPE "public"."enum_players_primary_position" AS ENUM('point-guard', 'shooting-guard', 'small-forward', 'power-forward', 'center');
  CREATE TYPE "public"."enum_players_secondary_position" AS ENUM('point-guard', 'shooting-guard', 'small-forward', 'power-forward', 'center');
  CREATE TYPE "public"."enum_coaches_division" AS ENUM('d1', 'd2', 'd3', 'naia', 'juco', 'other');
  CREATE TYPE "public"."enum_coaches_region" AS ENUM('new-england', 'mid-atlantic', 'southeast', 'southwest', 'midwest', 'mountain-west', 'west-coast', 'pacific-northwest');
  CREATE TYPE "public"."enum_coach_player_notes_contact_records_contact_type" AS ENUM('email', 'phone', 'text', 'in-person', 'video', 'game-visit', 'campus-visit', 'other');
  CREATE TYPE "public"."enum_coach_player_notes_interest_level" AS ENUM('high', 'medium', 'low', 'watching', 'not-interested');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"clerk_id" varchar,
  	"first_name" varchar,
  	"last_name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "players" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"graduation_year" numeric NOT NULL,
  	"city" varchar,
  	"state" varchar,
  	"high_school" varchar NOT NULL,
  	"height" varchar,
  	"weighted_gpa" numeric,
  	"unweighted_gpa" numeric,
  	"primary_position" "enum_players_primary_position" NOT NULL,
  	"secondary_position" "enum_players_secondary_position",
  	"bio" varchar,
  	"profile_image_id" integer,
  	"highlight_video" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coaches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"university" varchar NOT NULL,
  	"program_name" varchar,
  	"position" varchar,
  	"division" "enum_coaches_division",
  	"state" varchar,
  	"region" "enum_coaches_region",
  	"email" varchar,
  	"phone" varchar,
  	"bio" varchar,
  	"profile_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coach_player_notes_contact_records" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"contact_type" "enum_coach_player_notes_contact_records_contact_type" NOT NULL,
  	"summary" varchar NOT NULL,
  	"follow_up_needed" boolean DEFAULT false,
  	"follow_up_date" timestamp(3) with time zone
  );
  
  CREATE TABLE "coach_player_notes_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "coach_player_notes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"coach_id" integer NOT NULL,
  	"player_id" integer NOT NULL,
  	"notes" varchar,
  	"interest_level" "enum_coach_player_notes_interest_level",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "saved_players" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"coach_id" integer NOT NULL,
  	"player_id" integer NOT NULL,
  	"saved_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"players_id" integer,
  	"coaches_id" integer,
  	"coach_player_notes_id" integer,
  	"saved_players_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players" ADD CONSTRAINT "players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "players" ADD CONSTRAINT "players_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coaches" ADD CONSTRAINT "coaches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coaches" ADD CONSTRAINT "coaches_profile_image_id_media_id_fk" FOREIGN KEY ("profile_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coach_player_notes_contact_records" ADD CONSTRAINT "coach_player_notes_contact_records_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coach_player_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coach_player_notes_tags" ADD CONSTRAINT "coach_player_notes_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coach_player_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coach_player_notes" ADD CONSTRAINT "coach_player_notes_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coach_player_notes" ADD CONSTRAINT "coach_player_notes_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "saved_players" ADD CONSTRAINT "saved_players_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "saved_players" ADD CONSTRAINT "saved_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coaches_fk" FOREIGN KEY ("coaches_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coach_player_notes_fk" FOREIGN KEY ("coach_player_notes_id") REFERENCES "public"."coach_player_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_saved_players_fk" FOREIGN KEY ("saved_players_id") REFERENCES "public"."saved_players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "users_clerk_id_idx" ON "users" USING btree ("clerk_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "players_user_idx" ON "players" USING btree ("user_id");
  CREATE INDEX "players_profile_image_idx" ON "players" USING btree ("profile_image_id");
  CREATE INDEX "players_updated_at_idx" ON "players" USING btree ("updated_at");
  CREATE INDEX "players_created_at_idx" ON "players" USING btree ("created_at");
  CREATE INDEX "coaches_user_idx" ON "coaches" USING btree ("user_id");
  CREATE INDEX "coaches_profile_image_idx" ON "coaches" USING btree ("profile_image_id");
  CREATE INDEX "coaches_updated_at_idx" ON "coaches" USING btree ("updated_at");
  CREATE INDEX "coaches_created_at_idx" ON "coaches" USING btree ("created_at");
  CREATE INDEX "coach_player_notes_contact_records_order_idx" ON "coach_player_notes_contact_records" USING btree ("_order");
  CREATE INDEX "coach_player_notes_contact_records_parent_id_idx" ON "coach_player_notes_contact_records" USING btree ("_parent_id");
  CREATE INDEX "coach_player_notes_tags_order_idx" ON "coach_player_notes_tags" USING btree ("_order");
  CREATE INDEX "coach_player_notes_tags_parent_id_idx" ON "coach_player_notes_tags" USING btree ("_parent_id");
  CREATE INDEX "coach_player_notes_coach_idx" ON "coach_player_notes" USING btree ("coach_id");
  CREATE INDEX "coach_player_notes_player_idx" ON "coach_player_notes" USING btree ("player_id");
  CREATE INDEX "coach_player_notes_updated_at_idx" ON "coach_player_notes" USING btree ("updated_at");
  CREATE INDEX "coach_player_notes_created_at_idx" ON "coach_player_notes" USING btree ("created_at");
  CREATE UNIQUE INDEX "coach_player_idx" ON "coach_player_notes" USING btree ("coach_id","player_id");
  CREATE INDEX "saved_players_coach_idx" ON "saved_players" USING btree ("coach_id");
  CREATE INDEX "saved_players_player_idx" ON "saved_players" USING btree ("player_id");
  CREATE INDEX "saved_players_updated_at_idx" ON "saved_players" USING btree ("updated_at");
  CREATE INDEX "saved_players_created_at_idx" ON "saved_players" USING btree ("created_at");
  CREATE UNIQUE INDEX "coach_player_1_idx" ON "saved_players" USING btree ("coach_id","player_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_players_id_idx" ON "payload_locked_documents_rels" USING btree ("players_id");
  CREATE INDEX "payload_locked_documents_rels_coaches_id_idx" ON "payload_locked_documents_rels" USING btree ("coaches_id");
  CREATE INDEX "payload_locked_documents_rels_coach_player_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("coach_player_notes_id");
  CREATE INDEX "payload_locked_documents_rels_saved_players_id_idx" ON "payload_locked_documents_rels" USING btree ("saved_players_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "players" CASCADE;
  DROP TABLE "coaches" CASCADE;
  DROP TABLE "coach_player_notes_contact_records" CASCADE;
  DROP TABLE "coach_player_notes_tags" CASCADE;
  DROP TABLE "coach_player_notes" CASCADE;
  DROP TABLE "saved_players" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_players_primary_position";
  DROP TYPE "public"."enum_players_secondary_position";
  DROP TYPE "public"."enum_coaches_division";
  DROP TYPE "public"."enum_coaches_region";
  DROP TYPE "public"."enum_coach_player_notes_contact_records_contact_type";
  DROP TYPE "public"."enum_coach_player_notes_interest_level";`)
}
