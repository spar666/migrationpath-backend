-- Initial Schema Migration (Manual)

-- 1. Enums
CREATE TYPE "users_role_enum" AS ENUM('admin', 'user', 'moderator');
CREATE TYPE "state_nominations_state_code_enum" AS ENUM('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT');
CREATE TYPE "state_nominations_priority_level_enum" AS ENUM('high', 'medium', 'low');
CREATE TYPE "consultation_bookings_status_enum" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE "service_packages_category_enum" AS ENUM('student', 'skilled', 'family', 'employer');
CREATE TYPE "user_quotes_status_enum" AS ENUM('draft', 'sent', 'accepted', 'expired');

-- 2. Tables

-- users
CREATE TABLE "users" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "email" character varying NOT NULL,
    "password" character varying NOT NULL,
    "full_name" character varying,
    "role" "users_role_enum" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_users" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_users_email" UNIQUE ("email")
);

-- profiles
CREATE TABLE "profiles" (
    "id" uuid NOT NULL,
    "full_name" character varying,
    "email" character varying NOT NULL,
    "phone" character varying,
    "nationality" character varying,
    "current_visa" character varying,
    "anzsco_code" character varying,
    "is_admin" boolean NOT NULL DEFAULT false,
    "avatar_url" character varying,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_profiles" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_profiles_email" UNIQUE ("email"),
    CONSTRAINT "FK_profiles_users" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- occupations_list
CREATE TABLE "occupations_list" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "occupation_name" character varying NOT NULL,
    "anzsco_code" character varying NOT NULL,
    "description" character varying,
    "assessing_authority" character varying,
    "points_value" integer NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_occupations_list" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_occupations_list_anzsco" UNIQUE ("anzsco_code")
);

-- occupation_thresholds
CREATE TABLE "occupation_thresholds" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "occupation_id" uuid NOT NULL,
    "state_code" character varying NOT NULL,
    "min_points" integer NOT NULL,
    "is_available" boolean NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_occupation_thresholds" PRIMARY KEY ("id"),
    CONSTRAINT "FK_thresholds_occupations" FOREIGN KEY ("occupation_id") REFERENCES "occupations_list"("id")
);

-- activity_log
CREATE TABLE "activity_log" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "action" character varying NOT NULL,
    "metadata" jsonb,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_activity_log" PRIMARY KEY ("id"),
    CONSTRAINT "FK_activity_log_users" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

-- invitation_trends
CREATE TABLE "invitation_trends" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "anzsco_code" character varying NOT NULL,
    "round_date" TIMESTAMP NOT NULL,
    "subclass" character varying NOT NULL,
    "min_points_invited" integer NOT NULL,
    "invitations_issued" integer NOT NULL,
    "source_url" character varying,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_invitation_trends" PRIMARY KEY ("id")
);

-- state_nominations
CREATE TABLE "state_nominations" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "state_code" "state_nominations_state_code_enum" NOT NULL,
    "anzsco_code" character varying NOT NULL,
    "is_open" boolean NOT NULL DEFAULT true,
    "priority_level" "state_nominations_priority_level_enum" NOT NULL DEFAULT 'medium',
    "additional_requirements" text,
    "last_updated" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_state_nominations" PRIMARY KEY ("id")
);

-- consultation_questionnaire
CREATE TABLE "consultation_questionnaire" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "responses" jsonb NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_consultation_questionnaire" PRIMARY KEY ("id"),
    CONSTRAINT "FK_questionnaire_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- consultation_bookings
CREATE TABLE "consultation_bookings" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "status" "consultation_bookings_status_enum" NOT NULL DEFAULT 'pending',
    "strategy_delivery" text,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_consultation_bookings" PRIMARY KEY ("id"),
    CONSTRAINT "FK_bookings_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- invitation_feed
CREATE TABLE "invitation_feed" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "occupation" character varying NOT NULL,
    "visa_class" character varying NOT NULL,
    "state" character varying NOT NULL,
    "points" integer NOT NULL,
    "days_ago" integer NOT NULL,
    "priority" boolean NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_invitation_feed" PRIMARY KEY ("id")
);

-- notification_preferences
CREATE TABLE "notification_preferences" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "email_updates" boolean NOT NULL DEFAULT true,
    "invitation_alerts" boolean NOT NULL DEFAULT true,
    "document_reminders" boolean NOT NULL DEFAULT true,
    "news_alerts" boolean NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_notification_preferences" PRIMARY KEY ("id"),
    CONSTRAINT "FK_notifications_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- points_config
CREATE TABLE "points_config" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "category" character varying NOT NULL,
    "attribute_name" character varying NOT NULL,
    "points_value" integer NOT NULL,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_points_config" PRIMARY KEY ("id")
);

-- service_packages
CREATE TABLE "service_packages" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "package_name" character varying NOT NULL,
    "visa_subclass" character varying NOT NULL,
    "category" "service_packages_category_enum" NOT NULL,
    "professional_fees" numeric(10,2) NOT NULL,
    "government_charges" numeric(10,2) NOT NULL,
    "estimated_extras" numeric(10,2) NOT NULL,
    "inclusions" text[] NOT NULL,
    "is_active" boolean NOT NULL DEFAULT true,
    "display_order" integer NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_service_packages" PRIMARY KEY ("id")
);

-- user_quotes
CREATE TABLE "user_quotes" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "package_id" uuid NOT NULL,
    "status" "user_quotes_status_enum" NOT NULL DEFAULT 'draft',
    "total_amount" numeric(10,2) NOT NULL,
    "custom_notes" text,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "expires_at" TIMESTAMP NOT NULL,
    CONSTRAINT "PK_user_quotes" PRIMARY KEY ("id"),
    CONSTRAINT "FK_quotes_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_quotes_packages" FOREIGN KEY ("package_id") REFERENCES "service_packages"("id")
);

-- universities
CREATE TABLE "universities" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" character varying NOT NULL,
    "location" character varying,
    "website" character varying,
    "logo_url" character varying,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_universities" PRIMARY KEY ("id")
);

-- campuses
CREATE TABLE "campuses" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "universityId" uuid NOT NULL,
    "name" character varying NOT NULL,
    "location" character varying,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_campuses" PRIMARY KEY ("id"),
    CONSTRAINT "FK_campuses_universities" FOREIGN KEY ("universityId") REFERENCES "universities"("id")
);

-- courses
CREATE TABLE "courses" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "campusId" uuid NOT NULL,
    "universityId" uuid NOT NULL,
    "courseTitle" character varying NOT NULL,
    "anzscoCode" character varying,
    "anzscoTitle" character varying,
    "duration" character varying,
    "qualification" character varying,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_courses" PRIMARY KEY ("id"),
    CONSTRAINT "FK_courses_campuses" FOREIGN KEY ("campusId") REFERENCES "campuses"("id"),
    CONSTRAINT "FK_courses_universities" FOREIGN KEY ("universityId") REFERENCES "universities"("id")
);
