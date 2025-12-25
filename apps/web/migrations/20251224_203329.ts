import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'player', 'coach');
  CREATE TYPE "public"."enum_players_potential_areas_of_study" AS ENUM('undecided', 'stem', 'business-professional', 'arts-humanities', 'social-science-education', 'health-medicine', 'public-service-law', 'other');
  CREATE TYPE "public"."enum_players_desired_levels_of_play" AS ENUM('any', 'ncaa-d1', 'ncaa-d2', 'ncaa-d3', 'naia', 'uscaa', 'nccaa', 'juco');
  CREATE TYPE "public"."enum_players_desired_geographic_areas" AS ENUM('anywhere', 'northeast', 'mid-atlantic', 'deep-south', 'midwest', 'south', 'rocky-mountain', 'west-coast', 'pacific-northwest', 'other');
  CREATE TYPE "public"."enum_players_primary_position" AS ENUM('point-guard', 'combo-guard', 'wing', 'stretch-4', 'power-4', 'post');
  CREATE TYPE "public"."enum_players_secondary_position" AS ENUM('point-guard', 'combo-guard', 'wing', 'stretch-4', 'power-4', 'post');
  CREATE TYPE "public"."enum_players_aau_circuit" AS ENUM('nike-eybl', 'uaa', 'power24', 'adidas-3ssb', 'select-40', 'new-balance-lady-p32', 'puma-nxtpro-16', 'elite-40', 'hoop-group', 'nike-ecyl', 'ua-rise', 'crossroads', 'adidas-gold', 'prep-girls-hoops', 'new-balance-lady-e32', 'puma-nxt-league', 'insider-exposure', 'hype-her-hoops', 'other', 'independent');
  CREATE TYPE "public"."enum_players_desired_distance_from_home" AS ENUM('anywhere', 'less-than-2', 'less-than-4', 'less-than-8');
  CREATE TYPE "public"."enum_coaches_job_title" AS ENUM('head-coach', 'associate-head-coach', 'assistant-coach', 'director-of-recruiting', 'recruiting-coordinator', 'director-of-operations', 'director-of-player-development', 'assistant-director-of-player-personnel', 'graduate-assistant', 'other');
  CREATE TYPE "public"."enum_colleges_type" AS ENUM('public', 'private');
  CREATE TYPE "public"."enum_colleges_division" AS ENUM('d1', 'd2', 'd3', 'naia', 'juco', 'other');
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
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"stripe_customer_id" varchar,
  	"stripe_subscription_id" varchar,
  	"stripe_price_id" varchar,
  	"stripe_current_period_end" timestamp(3) with time zone,
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
  
  CREATE TABLE "players_awards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"year" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "players_potential_areas_of_study" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_players_potential_areas_of_study",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "players_highlight_video_urls" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "players_desired_levels_of_play" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_players_desired_levels_of_play",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "players_desired_geographic_areas" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_players_desired_geographic_areas",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "players" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"graduation_year" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"state" varchar NOT NULL,
  	"high_school" varchar NOT NULL,
  	"height_in_inches" numeric NOT NULL,
  	"weight" numeric,
  	"unweighted_gpa" numeric,
  	"weighted_gpa" numeric,
  	"primary_position" "enum_players_primary_position" NOT NULL,
  	"secondary_position" "enum_players_secondary_position",
  	"bio" varchar,
  	"aau_program_name" varchar,
  	"aau_team_name" varchar,
  	"aau_circuit" "enum_players_aau_circuit",
  	"aau_coach" varchar,
  	"phone_number" varchar,
  	"x_handle" varchar,
  	"insta_handle" varchar,
  	"tiktok_handle" varchar,
  	"ncaa_id" varchar,
  	"profile_image_url" varchar NOT NULL,
  	"ppg" numeric,
  	"rpg" numeric,
  	"apg" numeric,
  	"desired_distance_from_home" "enum_players_desired_distance_from_home",
  	"interested_in_military_academies" boolean,
  	"interested_in_ultra_high_academics" boolean,
  	"interested_in_faith_based" boolean,
  	"interested_in_all_girls" boolean,
  	"interested_in_h_b_c_u" boolean,
  	"is_active" boolean DEFAULT true,
  	"is_committed" boolean,
  	"committed_where" varchar,
  	"deleted_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "players_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tournaments_id" integer
  );
  
  CREATE TABLE "coaches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"college_id" numeric NOT NULL,
  	"college_name" varchar NOT NULL,
  	"job_title" "enum_coaches_job_title",
  	"phone" varchar,
  	"bio" varchar,
  	"profile_image_url" varchar,
  	"deleted_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "colleges" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"school" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"state" varchar NOT NULL,
  	"type" "enum_colleges_type" NOT NULL,
  	"conference" varchar NOT NULL,
  	"division" "enum_colleges_division" NOT NULL,
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
  
  CREATE TABLE "coach_prospects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"coach_id" integer NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"uniform_number" varchar,
  	"graduation_year" numeric NOT NULL,
  	"height_in_inches" numeric,
  	"weight" numeric,
  	"high_school" varchar,
  	"aau_program" varchar,
  	"twitter_handle" varchar,
  	"phone_number" varchar,
  	"notes" varchar,
  	"linked_player_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coach_prospects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tournaments_id" integer
  );
  
  CREATE TABLE "coach_saved_players" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"coach_id" integer NOT NULL,
  	"player_id" integer NOT NULL,
  	"saved_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tournaments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"state" varchar NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"description" varchar,
  	"website" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_mcp_api_keys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"coaches_find" boolean DEFAULT false,
  	"coaches_create" boolean DEFAULT false,
  	"coaches_update" boolean DEFAULT false,
  	"coaches_delete" boolean DEFAULT false,
  	"coach_player_notes_find" boolean DEFAULT false,
  	"coach_player_notes_create" boolean DEFAULT false,
  	"coach_player_notes_update" boolean DEFAULT false,
  	"coach_player_notes_delete" boolean DEFAULT false,
  	"coach_prospects_find" boolean DEFAULT false,
  	"coach_prospects_create" boolean DEFAULT false,
  	"coach_prospects_update" boolean DEFAULT false,
  	"coach_prospects_delete" boolean DEFAULT false,
  	"coach_saved_players_find" boolean DEFAULT false,
  	"coach_saved_players_create" boolean DEFAULT false,
  	"coach_saved_players_update" boolean DEFAULT false,
  	"coach_saved_players_delete" boolean DEFAULT false,
  	"colleges_find" boolean DEFAULT false,
  	"colleges_create" boolean DEFAULT false,
  	"colleges_update" boolean DEFAULT false,
  	"colleges_delete" boolean DEFAULT false,
  	"players_find" boolean DEFAULT false,
  	"players_create" boolean DEFAULT false,
  	"players_update" boolean DEFAULT false,
  	"players_delete" boolean DEFAULT false,
  	"tournaments_find" boolean DEFAULT false,
  	"tournaments_create" boolean DEFAULT false,
  	"tournaments_update" boolean DEFAULT false,
  	"tournaments_delete" boolean DEFAULT false,
  	"users_find" boolean DEFAULT false,
  	"users_create" boolean DEFAULT false,
  	"users_update" boolean DEFAULT false,
  	"users_delete" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar
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
  	"players_id" integer,
  	"coaches_id" integer,
  	"colleges_id" integer,
  	"coach_player_notes_id" integer,
  	"coach_prospects_id" integer,
  	"coach_saved_players_id" integer,
  	"tournaments_id" integer,
  	"payload_mcp_api_keys_id" integer
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
  	"users_id" integer,
  	"payload_mcp_api_keys_id" integer
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
  ALTER TABLE "players_awards" ADD CONSTRAINT "players_awards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players_potential_areas_of_study" ADD CONSTRAINT "players_potential_areas_of_study_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players_highlight_video_urls" ADD CONSTRAINT "players_highlight_video_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players_desired_levels_of_play" ADD CONSTRAINT "players_desired_levels_of_play_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players_desired_geographic_areas" ADD CONSTRAINT "players_desired_geographic_areas_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players" ADD CONSTRAINT "players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "players_rels" ADD CONSTRAINT "players_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players_rels" ADD CONSTRAINT "players_rels_tournaments_fk" FOREIGN KEY ("tournaments_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coaches" ADD CONSTRAINT "coaches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coach_player_notes_contact_records" ADD CONSTRAINT "coach_player_notes_contact_records_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coach_player_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coach_player_notes_tags" ADD CONSTRAINT "coach_player_notes_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coach_player_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coach_player_notes" ADD CONSTRAINT "coach_player_notes_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coach_player_notes" ADD CONSTRAINT "coach_player_notes_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coach_prospects" ADD CONSTRAINT "coach_prospects_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coach_prospects" ADD CONSTRAINT "coach_prospects_linked_player_id_players_id_fk" FOREIGN KEY ("linked_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coach_prospects_rels" ADD CONSTRAINT "coach_prospects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coach_prospects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coach_prospects_rels" ADD CONSTRAINT "coach_prospects_rels_tournaments_fk" FOREIGN KEY ("tournaments_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coach_saved_players" ADD CONSTRAINT "coach_saved_players_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coach_saved_players" ADD CONSTRAINT "coach_saved_players_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coaches_fk" FOREIGN KEY ("coaches_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_colleges_fk" FOREIGN KEY ("colleges_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coach_player_notes_fk" FOREIGN KEY ("coach_player_notes_id") REFERENCES "public"."coach_player_notes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coach_prospects_fk" FOREIGN KEY ("coach_prospects_id") REFERENCES "public"."coach_prospects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coach_saved_players_fk" FOREIGN KEY ("coach_saved_players_id") REFERENCES "public"."coach_saved_players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tournaments_fk" FOREIGN KEY ("tournaments_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "users_clerk_id_idx" ON "users" USING btree ("clerk_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "players_awards_order_idx" ON "players_awards" USING btree ("_order");
  CREATE INDEX "players_awards_parent_id_idx" ON "players_awards" USING btree ("_parent_id");
  CREATE INDEX "players_potential_areas_of_study_order_idx" ON "players_potential_areas_of_study" USING btree ("order");
  CREATE INDEX "players_potential_areas_of_study_parent_idx" ON "players_potential_areas_of_study" USING btree ("parent_id");
  CREATE INDEX "players_highlight_video_urls_order_idx" ON "players_highlight_video_urls" USING btree ("_order");
  CREATE INDEX "players_highlight_video_urls_parent_id_idx" ON "players_highlight_video_urls" USING btree ("_parent_id");
  CREATE INDEX "players_desired_levels_of_play_order_idx" ON "players_desired_levels_of_play" USING btree ("order");
  CREATE INDEX "players_desired_levels_of_play_parent_idx" ON "players_desired_levels_of_play" USING btree ("parent_id");
  CREATE INDEX "players_desired_geographic_areas_order_idx" ON "players_desired_geographic_areas" USING btree ("order");
  CREATE INDEX "players_desired_geographic_areas_parent_idx" ON "players_desired_geographic_areas" USING btree ("parent_id");
  CREATE UNIQUE INDEX "players_user_idx" ON "players" USING btree ("user_id");
  CREATE INDEX "players_updated_at_idx" ON "players" USING btree ("updated_at");
  CREATE INDEX "players_created_at_idx" ON "players" USING btree ("created_at");
  CREATE INDEX "players_rels_order_idx" ON "players_rels" USING btree ("order");
  CREATE INDEX "players_rels_parent_idx" ON "players_rels" USING btree ("parent_id");
  CREATE INDEX "players_rels_path_idx" ON "players_rels" USING btree ("path");
  CREATE INDEX "players_rels_tournaments_id_idx" ON "players_rels" USING btree ("tournaments_id");
  CREATE INDEX "coaches_user_idx" ON "coaches" USING btree ("user_id");
  CREATE INDEX "coaches_updated_at_idx" ON "coaches" USING btree ("updated_at");
  CREATE INDEX "coaches_created_at_idx" ON "coaches" USING btree ("created_at");
  CREATE INDEX "colleges_school_idx" ON "colleges" USING btree ("school");
  CREATE INDEX "colleges_state_idx" ON "colleges" USING btree ("state");
  CREATE INDEX "colleges_division_idx" ON "colleges" USING btree ("division");
  CREATE INDEX "colleges_updated_at_idx" ON "colleges" USING btree ("updated_at");
  CREATE INDEX "colleges_created_at_idx" ON "colleges" USING btree ("created_at");
  CREATE INDEX "coach_player_notes_contact_records_order_idx" ON "coach_player_notes_contact_records" USING btree ("_order");
  CREATE INDEX "coach_player_notes_contact_records_parent_id_idx" ON "coach_player_notes_contact_records" USING btree ("_parent_id");
  CREATE INDEX "coach_player_notes_tags_order_idx" ON "coach_player_notes_tags" USING btree ("_order");
  CREATE INDEX "coach_player_notes_tags_parent_id_idx" ON "coach_player_notes_tags" USING btree ("_parent_id");
  CREATE INDEX "coach_player_notes_coach_idx" ON "coach_player_notes" USING btree ("coach_id");
  CREATE INDEX "coach_player_notes_player_idx" ON "coach_player_notes" USING btree ("player_id");
  CREATE INDEX "coach_player_notes_updated_at_idx" ON "coach_player_notes" USING btree ("updated_at");
  CREATE INDEX "coach_player_notes_created_at_idx" ON "coach_player_notes" USING btree ("created_at");
  CREATE UNIQUE INDEX "coach_player_idx" ON "coach_player_notes" USING btree ("coach_id","player_id");
  CREATE INDEX "coach_prospects_coach_idx" ON "coach_prospects" USING btree ("coach_id");
  CREATE INDEX "coach_prospects_linked_player_idx" ON "coach_prospects" USING btree ("linked_player_id");
  CREATE INDEX "coach_prospects_updated_at_idx" ON "coach_prospects" USING btree ("updated_at");
  CREATE INDEX "coach_prospects_created_at_idx" ON "coach_prospects" USING btree ("created_at");
  CREATE INDEX "coach_prospects_rels_order_idx" ON "coach_prospects_rels" USING btree ("order");
  CREATE INDEX "coach_prospects_rels_parent_idx" ON "coach_prospects_rels" USING btree ("parent_id");
  CREATE INDEX "coach_prospects_rels_path_idx" ON "coach_prospects_rels" USING btree ("path");
  CREATE INDEX "coach_prospects_rels_tournaments_id_idx" ON "coach_prospects_rels" USING btree ("tournaments_id");
  CREATE INDEX "coach_saved_players_coach_idx" ON "coach_saved_players" USING btree ("coach_id");
  CREATE INDEX "coach_saved_players_player_idx" ON "coach_saved_players" USING btree ("player_id");
  CREATE INDEX "coach_saved_players_updated_at_idx" ON "coach_saved_players" USING btree ("updated_at");
  CREATE INDEX "coach_saved_players_created_at_idx" ON "coach_saved_players" USING btree ("created_at");
  CREATE UNIQUE INDEX "coach_player_1_idx" ON "coach_saved_players" USING btree ("coach_id","player_id");
  CREATE INDEX "tournaments_updated_at_idx" ON "tournaments" USING btree ("updated_at");
  CREATE INDEX "tournaments_created_at_idx" ON "tournaments" USING btree ("created_at");
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_players_id_idx" ON "payload_locked_documents_rels" USING btree ("players_id");
  CREATE INDEX "payload_locked_documents_rels_coaches_id_idx" ON "payload_locked_documents_rels" USING btree ("coaches_id");
  CREATE INDEX "payload_locked_documents_rels_colleges_id_idx" ON "payload_locked_documents_rels" USING btree ("colleges_id");
  CREATE INDEX "payload_locked_documents_rels_coach_player_notes_id_idx" ON "payload_locked_documents_rels" USING btree ("coach_player_notes_id");
  CREATE INDEX "payload_locked_documents_rels_coach_prospects_id_idx" ON "payload_locked_documents_rels" USING btree ("coach_prospects_id");
  CREATE INDEX "payload_locked_documents_rels_coach_saved_players_id_idx" ON "payload_locked_documents_rels" USING btree ("coach_saved_players_id");
  CREATE INDEX "payload_locked_documents_rels_tournaments_id_idx" ON "payload_locked_documents_rels" USING btree ("tournaments_id");
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "players_awards" CASCADE;
  DROP TABLE "players_potential_areas_of_study" CASCADE;
  DROP TABLE "players_highlight_video_urls" CASCADE;
  DROP TABLE "players_desired_levels_of_play" CASCADE;
  DROP TABLE "players_desired_geographic_areas" CASCADE;
  DROP TABLE "players" CASCADE;
  DROP TABLE "players_rels" CASCADE;
  DROP TABLE "coaches" CASCADE;
  DROP TABLE "colleges" CASCADE;
  DROP TABLE "coach_player_notes_contact_records" CASCADE;
  DROP TABLE "coach_player_notes_tags" CASCADE;
  DROP TABLE "coach_player_notes" CASCADE;
  DROP TABLE "coach_prospects" CASCADE;
  DROP TABLE "coach_prospects_rels" CASCADE;
  DROP TABLE "coach_saved_players" CASCADE;
  DROP TABLE "tournaments" CASCADE;
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_players_potential_areas_of_study";
  DROP TYPE "public"."enum_players_desired_levels_of_play";
  DROP TYPE "public"."enum_players_desired_geographic_areas";
  DROP TYPE "public"."enum_players_primary_position";
  DROP TYPE "public"."enum_players_secondary_position";
  DROP TYPE "public"."enum_players_aau_circuit";
  DROP TYPE "public"."enum_players_desired_distance_from_home";
  DROP TYPE "public"."enum_coaches_job_title";
  DROP TYPE "public"."enum_colleges_type";
  DROP TYPE "public"."enum_colleges_division";
  DROP TYPE "public"."enum_coach_player_notes_contact_records_contact_type";
  DROP TYPE "public"."enum_coach_player_notes_interest_level";`)
}
