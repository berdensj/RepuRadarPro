CREATE TABLE "agencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"domain" text,
	"logo_url" text,
	"primary_color" text DEFAULT '#3b82f6',
	"secondary_color" text DEFAULT '#1e40af',
	"custom_css" text,
	"custom_js" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agencies_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "agency_clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"agency_id" integer NOT NULL,
	"client_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"alert_type" text NOT NULL,
	"content" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"competitor_id" integer NOT NULL,
	"report_date" timestamp DEFAULT now() NOT NULL,
	"average_rating" real,
	"review_count" integer,
	"sentiment" jsonb,
	"keyword_analysis" jsonb,
	"strengths" jsonb,
	"weaknesses" jsonb
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"google_url" text,
	"yelp_url" text,
	"other_urls" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"phone" text,
	"google_place_id" text,
	"yelp_business_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"average_rating" real,
	"total_reviews" integer,
	"positive_percentage" real,
	"keyword_trends" jsonb
);
--> statement-breakpoint
CREATE TABLE "review_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"location_id" integer,
	"customer_name" text NOT NULL,
	"customer_email" text,
	"customer_phone" text,
	"template_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"template_type" text DEFAULT 'email' NOT NULL,
	"is_hipaa_safe" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"location_id" integer,
	"reviewer_name" text NOT NULL,
	"platform" text NOT NULL,
	"rating" real NOT NULL,
	"review_text" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"response" text,
	"external_id" text,
	"sentiment_score" real,
	"keywords" jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"profile_picture" text,
	"plan" text DEFAULT 'Free' NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
