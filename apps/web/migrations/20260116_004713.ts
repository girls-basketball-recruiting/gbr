import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Create types if they don't exist
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_coach_prospects_potential_areas_of_study" AS ENUM('undecided', 'stem', 'business-professional', 'arts-humanities', 'social-science-education', 'health-medicine', 'public-service-law', 'other');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_coach_prospects_desired_levels_of_play" AS ENUM('any', 'ncaa-d1', 'ncaa-d2', 'ncaa-d3', 'naia', 'uscaa', 'nccaa', 'juco');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_coach_prospects_desired_geographic_areas" AS ENUM('anywhere', 'northeast', 'mid-atlantic', 'deep-south', 'midwest', 'south', 'rocky-mountain', 'west-coast', 'pacific-northwest', 'other');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_coach_prospects_primary_position" AS ENUM('point-guard', 'combo-guard', 'wing', 'stretch-4', 'power-4', 'post');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_coach_prospects_secondary_position" AS ENUM('point-guard', 'combo-guard', 'wing', 'stretch-4', 'power-4', 'post');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_coach_prospects_aau_circuit" AS ENUM('adidas-3ssb', 'adidas-gold', 'crossroads', 'elite-40', 'hoop-group', 'hype-her-hoops', 'insider-exposure', 'new-balance-lady-e32', 'new-balance-lady-p32', 'nike-ecyl', 'nike-eybl', 'power24', 'prep-girls-hoops', 'puma-nxt-league', 'puma-nxtpro-16', 'select-40', 'ua-rise', 'uaa', 'independent', 'other');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_coach_prospects_desired_distance_from_home" AS ENUM('anywhere', 'less-than-2', 'less-than-4', 'less-than-8');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_invitations_role" AS ENUM('player', 'coach');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create tables if they don't exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "players_completed_steps" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "step" numeric NOT NULL
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "coaches_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "tournaments_id" integer
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "coach_prospects_potential_areas_of_study" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_coach_prospects_potential_areas_of_study",
      "id" serial PRIMARY KEY NOT NULL
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "coach_prospects_awards" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "year" varchar NOT NULL,
      "description" varchar
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "coach_prospects_highlight_video_urls" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "url" varchar NOT NULL
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "coach_prospects_desired_levels_of_play" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_coach_prospects_desired_levels_of_play",
      "id" serial PRIMARY KEY NOT NULL
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "coach_prospects_desired_geographic_areas" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_coach_prospects_desired_geographic_areas",
      "id" serial PRIMARY KEY NOT NULL
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "player_saved_programs" (
      "id" serial PRIMARY KEY NOT NULL,
      "player_id" integer NOT NULL,
      "college_id" integer NOT NULL,
      "notes" varchar,
      "saved_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "invitations" (
      "id" serial PRIMARY KEY NOT NULL,
      "token" varchar NOT NULL,
      "role" "enum_invitations_role" NOT NULL,
      "promo_code" varchar DEFAULT 'FIRST_YEAR_FREE' NOT NULL,
      "invited_email" varchar,
      "invited_by_id" integer NOT NULL,
      "expires_at" timestamp(3) with time zone,
      "redeemed_at" timestamp(3) with time zone,
      "redeemed_by_id" integer,
      "invitation_url" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  // Drop MCP table if it exists
  await db.execute(sql`
    DROP TABLE IF EXISTS "payload_mcp_api_keys" CASCADE;
  `)

  // Drop constraints if they exist (ignore errors)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_payload_mcp_api_keys_fk";
    EXCEPTION WHEN undefined_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_payload_mcp_api_keys_fk";
    EXCEPTION WHEN undefined_object THEN null;
    END $$;
  `)

  // Update enum type for players.aau_circuit
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "players" ALTER COLUMN "aau_circuit" SET DATA TYPE text;
      DROP TYPE IF EXISTS "public"."enum_players_aau_circuit";
      CREATE TYPE "public"."enum_players_aau_circuit" AS ENUM('adidas-3ssb', 'adidas-gold', 'crossroads', 'elite-40', 'hoop-group', 'hype-her-hoops', 'insider-exposure', 'new-balance-lady-e32', 'new-balance-lady-p32', 'nike-ecyl', 'nike-eybl', 'power24', 'prep-girls-hoops', 'puma-nxt-league', 'puma-nxtpro-16', 'select-40', 'ua-rise', 'uaa', 'independent', 'other');
      ALTER TABLE "players" ALTER COLUMN "aau_circuit" SET DATA TYPE "public"."enum_players_aau_circuit" USING "aau_circuit"::"public"."enum_players_aau_circuit";
    EXCEPTION WHEN others THEN null;
    END $$;
  `)

  // Drop indexes if they exist
  await db.execute(sql`DROP INDEX IF EXISTS "payload_locked_documents_rels_payload_mcp_api_keys_id_idx";`)
  await db.execute(sql`DROP INDEX IF EXISTS "payload_preferences_rels_payload_mcp_api_keys_id_idx";`)

  // Alter columns (ignore if already done)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "players_awards" ALTER COLUMN "year" SET NOT NULL;
    EXCEPTION WHEN others THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "players" ALTER COLUMN "height_in_inches" DROP NOT NULL;
    EXCEPTION WHEN others THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "players" ALTER COLUMN "primary_position" DROP NOT NULL;
    EXCEPTION WHEN others THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "players" ALTER COLUMN "profile_image_url" DROP NOT NULL;
    EXCEPTION WHEN others THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coaches" ALTER COLUMN "job_title" SET NOT NULL;
    EXCEPTION WHEN others THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ALTER COLUMN "graduation_year" DROP NOT NULL;
    EXCEPTION WHEN others THEN null;
    END $$;
  `)

  // Add columns if they don't exist
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coaches" ADD COLUMN "city" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coaches" ADD COLUMN "state" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "profile_image_url" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "city" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "state" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "primary_position" "enum_coach_prospects_primary_position";
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "secondary_position" "enum_coach_prospects_secondary_position";
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "bio" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "aau_program_name" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "aau_team_name" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "aau_circuit" "enum_coach_prospects_aau_circuit";
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "aau_coach" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "ppg" numeric;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "rpg" numeric;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "apg" numeric;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "unweighted_gpa" numeric;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "weighted_gpa" numeric;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "ncaa_id" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "desired_distance_from_home" "enum_coach_prospects_desired_distance_from_home";
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "interested_in_military_academies" boolean;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "interested_in_ultra_high_academics" boolean;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "interested_in_faith_based" boolean;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "interested_in_all_girls" boolean;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "interested_in_h_b_c_u" boolean;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "x_handle" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "insta_handle" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" ADD COLUMN "tiktok_handle" varchar;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "player_saved_programs_id" integer;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "invitations_id" integer;
    EXCEPTION WHEN duplicate_column THEN null;
    END $$;
  `)

  // Add foreign keys (ignore if already exist)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "players_completed_steps" ADD CONSTRAINT "players_completed_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coaches_rels" ADD CONSTRAINT "coaches_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coaches"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coaches_rels" ADD CONSTRAINT "coaches_rels_tournaments_fk" FOREIGN KEY ("tournaments_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects_potential_areas_of_study" ADD CONSTRAINT "coach_prospects_potential_areas_of_study_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coach_prospects"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects_awards" ADD CONSTRAINT "coach_prospects_awards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coach_prospects"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects_highlight_video_urls" ADD CONSTRAINT "coach_prospects_highlight_video_urls_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coach_prospects"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects_desired_levels_of_play" ADD CONSTRAINT "coach_prospects_desired_levels_of_play_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coach_prospects"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects_desired_geographic_areas" ADD CONSTRAINT "coach_prospects_desired_geographic_areas_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coach_prospects"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "player_saved_programs" ADD CONSTRAINT "player_saved_programs_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "player_saved_programs" ADD CONSTRAINT "player_saved_programs_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "invitations" ADD CONSTRAINT "invitations_redeemed_by_id_users_id_fk" FOREIGN KEY ("redeemed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_player_saved_programs_fk" FOREIGN KEY ("player_saved_programs_id") REFERENCES "public"."player_saved_programs"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invitations_fk" FOREIGN KEY ("invitations_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create indexes (ignore if already exist)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "players_completed_steps_order_idx" ON "players_completed_steps" USING btree ("_order");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "players_completed_steps_parent_id_idx" ON "players_completed_steps" USING btree ("_parent_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coaches_rels_order_idx" ON "coaches_rels" USING btree ("order");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coaches_rels_parent_idx" ON "coaches_rels" USING btree ("parent_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coaches_rels_path_idx" ON "coaches_rels" USING btree ("path");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coaches_rels_tournaments_id_idx" ON "coaches_rels" USING btree ("tournaments_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coach_prospects_potential_areas_of_study_order_idx" ON "coach_prospects_potential_areas_of_study" USING btree ("order");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coach_prospects_potential_areas_of_study_parent_idx" ON "coach_prospects_potential_areas_of_study" USING btree ("parent_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coach_prospects_awards_order_idx" ON "coach_prospects_awards" USING btree ("_order");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coach_prospects_awards_parent_id_idx" ON "coach_prospects_awards" USING btree ("_parent_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coach_prospects_highlight_video_urls_order_idx" ON "coach_prospects_highlight_video_urls" USING btree ("_order");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coach_prospects_highlight_video_urls_parent_id_idx" ON "coach_prospects_highlight_video_urls" USING btree ("_parent_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coach_prospects_desired_levels_of_play_order_idx" ON "coach_prospects_desired_levels_of_play" USING btree ("order");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coach_prospects_desired_levels_of_play_parent_idx" ON "coach_prospects_desired_levels_of_play" USING btree ("parent_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coach_prospects_desired_geographic_areas_order_idx" ON "coach_prospects_desired_geographic_areas" USING btree ("order");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "coach_prospects_desired_geographic_areas_parent_idx" ON "coach_prospects_desired_geographic_areas" USING btree ("parent_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "player_saved_programs_player_idx" ON "player_saved_programs" USING btree ("player_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "player_saved_programs_college_idx" ON "player_saved_programs" USING btree ("college_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "player_saved_programs_updated_at_idx" ON "player_saved_programs" USING btree ("updated_at");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "player_saved_programs_created_at_idx" ON "player_saved_programs" USING btree ("created_at");`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "player_college_idx" ON "player_saved_programs" USING btree ("player_id","college_id");`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "invitations_token_idx" ON "invitations" USING btree ("token");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "invitations_invited_by_idx" ON "invitations" USING btree ("invited_by_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "invitations_redeemed_by_idx" ON "invitations" USING btree ("redeemed_by_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "invitations_updated_at_idx" ON "invitations" USING btree ("updated_at");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "invitations_created_at_idx" ON "invitations" USING btree ("created_at");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_player_saved_programs_id_idx" ON "payload_locked_documents_rels" USING btree ("player_saved_programs_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_invitations_id_idx" ON "payload_locked_documents_rels" USING btree ("invitations_id");`)

  // Drop old columns if they exist
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" DROP COLUMN "uniform_number";
    EXCEPTION WHEN undefined_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" DROP COLUMN "aau_program";
    EXCEPTION WHEN undefined_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "coach_prospects" DROP COLUMN "twitter_handle";
    EXCEPTION WHEN undefined_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_mcp_api_keys_id";
    EXCEPTION WHEN undefined_column THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" DROP COLUMN "payload_mcp_api_keys_id";
    EXCEPTION WHEN undefined_column THEN null;
    END $$;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Down migration not idempotent - keeping original for reference
  await db.execute(sql`
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

  ALTER TABLE "players_completed_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "coaches_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "coach_prospects_potential_areas_of_study" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "coach_prospects_awards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "coach_prospects_highlight_video_urls" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "coach_prospects_desired_levels_of_play" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "coach_prospects_desired_geographic_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "player_saved_programs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "invitations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "players_completed_steps" CASCADE;
  DROP TABLE "coaches_rels" CASCADE;
  DROP TABLE "coach_prospects_potential_areas_of_study" CASCADE;
  DROP TABLE "coach_prospects_awards" CASCADE;
  DROP TABLE "coach_prospects_highlight_video_urls" CASCADE;
  DROP TABLE "coach_prospects_desired_levels_of_play" CASCADE;
  DROP TABLE "coach_prospects_desired_geographic_areas" CASCADE;
  DROP TABLE "player_saved_programs" CASCADE;
  DROP TABLE "invitations" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_player_saved_programs_fk";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_invitations_fk";

  ALTER TABLE "players" ALTER COLUMN "aau_circuit" SET DATA TYPE text;
  DROP TYPE "public"."enum_players_aau_circuit";
  CREATE TYPE "public"."enum_players_aau_circuit" AS ENUM('nike-eybl', 'uaa', 'power24', 'adidas-3ssb', 'select-40', 'new-balance-lady-p32', 'puma-nxtpro-16', 'elite-40', 'hoop-group', 'nike-ecyl', 'ua-rise', 'crossroads', 'adidas-gold', 'prep-girls-hoops', 'new-balance-lady-e32', 'puma-nxt-league', 'insider-exposure', 'hype-her-hoops', 'other', 'independent');
  ALTER TABLE "players" ALTER COLUMN "aau_circuit" SET DATA TYPE "public"."enum_players_aau_circuit" USING "aau_circuit"::"public"."enum_players_aau_circuit";
  DROP INDEX "payload_locked_documents_rels_player_saved_programs_id_idx";
  DROP INDEX "payload_locked_documents_rels_invitations_id_idx";
  ALTER TABLE "players_awards" ALTER COLUMN "year" DROP NOT NULL;
  ALTER TABLE "players" ALTER COLUMN "height_in_inches" SET NOT NULL;
  ALTER TABLE "players" ALTER COLUMN "primary_position" SET NOT NULL;
  ALTER TABLE "players" ALTER COLUMN "profile_image_url" SET NOT NULL;
  ALTER TABLE "coaches" ALTER COLUMN "job_title" DROP NOT NULL;
  ALTER TABLE "coach_prospects" ALTER COLUMN "graduation_year" SET NOT NULL;
  ALTER TABLE "coach_prospects" ADD COLUMN "uniform_number" varchar;
  ALTER TABLE "coach_prospects" ADD COLUMN "aau_program" varchar;
  ALTER TABLE "coach_prospects" ADD COLUMN "twitter_handle" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");
  ALTER TABLE "coaches" DROP COLUMN "city";
  ALTER TABLE "coaches" DROP COLUMN "state";
  ALTER TABLE "coach_prospects" DROP COLUMN "profile_image_url";
  ALTER TABLE "coach_prospects" DROP COLUMN "city";
  ALTER TABLE "coach_prospects" DROP COLUMN "state";
  ALTER TABLE "coach_prospects" DROP COLUMN "primary_position";
  ALTER TABLE "coach_prospects" DROP COLUMN "secondary_position";
  ALTER TABLE "coach_prospects" DROP COLUMN "bio";
  ALTER TABLE "coach_prospects" DROP COLUMN "aau_program_name";
  ALTER TABLE "coach_prospects" DROP COLUMN "aau_team_name";
  ALTER TABLE "coach_prospects" DROP COLUMN "aau_circuit";
  ALTER TABLE "coach_prospects" DROP COLUMN "aau_coach";
  ALTER TABLE "coach_prospects" DROP COLUMN "ppg";
  ALTER TABLE "coach_prospects" DROP COLUMN "rpg";
  ALTER TABLE "coach_prospects" DROP COLUMN "apg";
  ALTER TABLE "coach_prospects" DROP COLUMN "unweighted_gpa";
  ALTER TABLE "coach_prospects" DROP COLUMN "weighted_gpa";
  ALTER TABLE "coach_prospects" DROP COLUMN "ncaa_id";
  ALTER TABLE "coach_prospects" DROP COLUMN "desired_distance_from_home";
  ALTER TABLE "coach_prospects" DROP COLUMN "interested_in_military_academies";
  ALTER TABLE "coach_prospects" DROP COLUMN "interested_in_ultra_high_academics";
  ALTER TABLE "coach_prospects" DROP COLUMN "interested_in_faith_based";
  ALTER TABLE "coach_prospects" DROP COLUMN "interested_in_all_girls";
  ALTER TABLE "coach_prospects" DROP COLUMN "interested_in_h_b_c_u";
  ALTER TABLE "coach_prospects" DROP COLUMN "x_handle";
  ALTER TABLE "coach_prospects" DROP COLUMN "insta_handle";
  ALTER TABLE "coach_prospects" DROP COLUMN "tiktok_handle";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "player_saved_programs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "invitations_id";
  DROP TYPE "public"."enum_coach_prospects_potential_areas_of_study";
  DROP TYPE "public"."enum_coach_prospects_desired_levels_of_play";
  DROP TYPE "public"."enum_coach_prospects_desired_geographic_areas";
  DROP TYPE "public"."enum_coach_prospects_primary_position";
  DROP TYPE "public"."enum_coach_prospects_secondary_position";
  DROP TYPE "public"."enum_coach_prospects_aau_circuit";
  DROP TYPE "public"."enum_coach_prospects_desired_distance_from_home";
  DROP TYPE "public"."enum_invitations_role";`)
}
