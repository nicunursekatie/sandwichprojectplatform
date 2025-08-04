-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "collections" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"collection_date" date NOT NULL,
	"host_name" text NOT NULL,
	"individual_sandwiches" integer DEFAULT 0 NOT NULL,
	"group_collections" jsonb DEFAULT '[]'::jsonb,
	"submitted_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"submitted_by" varchar(255) NOT NULL,
	"submitter_email" varchar(255),
	"submitter_name" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"tags" text[] DEFAULT '{""}',
	"implementation_notes" text,
	"estimated_effort" text,
	"assigned_to" varchar(255),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "kudos_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"context_type" text NOT NULL,
	"context_id" text NOT NULL,
	"message_id" integer,
	"sent_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" varchar DEFAULT 'general' NOT NULL,
	"priority" varchar DEFAULT 'medium' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"link" text,
	"link_text" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "host_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"host_id" integer NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "group_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"group_id" integer NOT NULL,
	"role" varchar(50) DEFAULT 'member',
	"is_active" boolean DEFAULT true,
	"joined_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"address" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"vehicle_type" text,
	"license_number" text,
	"availability" text DEFAULT 'available',
	"zone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"van_approved" boolean DEFAULT false,
	"home_address" text,
	"availability_notes" text,
	"email_agreement_sent" boolean DEFAULT false,
	"voicemail_left" boolean DEFAULT false,
	"inactive_reason" text,
	"host_id" integer,
	"route_description" text,
	"host_location" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "driver_agreements" (
	"id" serial PRIMARY KEY NOT NULL,
	"submitted_by" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"license_number" text NOT NULL,
	"vehicle_info" text NOT NULL,
	"emergency_contact" text NOT NULL,
	"emergency_phone" text NOT NULL,
	"agreement_accepted" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "meeting_minutes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"summary" text NOT NULL,
	"color" text DEFAULT 'blue' NOT NULL,
	"file_name" text,
	"file_path" text,
	"file_type" text,
	"mime_type" text,
	"committee_type" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "sandwich_collections_backup" (
	"id" numeric,
	"collection_date" date,
	"host_name" text,
	"individual_sandwiches" numeric,
	"group_collections" text,
	"submitted_at" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	"group_count" numeric
);
--> statement-breakpoint
CREATE TABLE "sandwich_import_staging" (
	"id" integer,
	"collection_date" text,
	"host_name" text,
	"individual_sandwiches" integer,
	"submitted_at" timestamp DEFAULT now(),
	"created_by" varchar(255),
	"created_by_name" varchar(255),
	"group1_name" text,
	"group1_count" integer,
	"group2_name" text,
	"group2_count" integer
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"final_agenda" text,
	"status" text DEFAULT 'planning' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"location" text,
	"description" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"related_type" varchar,
	"related_id" integer,
	"celebration_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"source_id" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "project_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	CONSTRAINT "project_assignments_project_user_unique" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "sandwich_collections" (
	"id" numeric PRIMARY KEY NOT NULL,
	"collection_date" text,
	"host_name" text NOT NULL,
	"individual_sandwiches" numeric NOT NULL,
	"group_collections" text NOT NULL,
	"submitted_at" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	"group_count" numeric
);
--> statement-breakpoint
CREATE TABLE "recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"preferences" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"contact_name" text,
	"weekly_estimate" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "suggestion_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"suggestion_id" integer NOT NULL,
	"message" text NOT NULL,
	"is_admin_response" boolean DEFAULT false NOT NULL,
	"responded_by" varchar(255) NOT NULL,
	"respondent_name" text,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "weekly_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"week_ending" text NOT NULL,
	"sandwich_count" integer NOT NULL,
	"notes" text,
	"submitted_by" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "message_reads" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer,
	"user_id" text NOT NULL,
	"read_at" timestamp DEFAULT now(),
	CONSTRAINT "message_reads_message_id_user_id_key" UNIQUE("message_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "project_congratulations" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sandwich_collections_backup_before_migration" (
	"id" numeric,
	"collection_date" text,
	"host_name" text,
	"individual_sandwiches" numeric,
	"group_collections" text,
	"submitted_at" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	"group_count" numeric
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(32) DEFAULT 'pending',
	"priority" varchar(32),
	"due_date" date,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"order_num" integer DEFAULT 0,
	"assignee_ids" varchar[]
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"role" varchar DEFAULT 'volunteer',
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"display_name" varchar,
	"password" varchar(255),
	"last_login_at" timestamp,
	"auth_id" uuid,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "committees" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	CONSTRAINT "committees_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "project_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"author_name" text NOT NULL,
	"comment_type" varchar(50) DEFAULT 'general' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"project_id" integer NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "committee_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"committee_id" integer,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"role" varchar(100) DEFAULT 'member',
	"permissions" text[],
	"joined_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	CONSTRAINT "committee_memberships_committee_id_user_id_key" UNIQUE("committee_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(20) NOT NULL,
	"name" varchar(255),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	CONSTRAINT "conversations_type_check" CHECK ((type)::text = ANY (ARRAY[('direct'::character varying)::text, ('group'::character varying)::text, ('channel'::character varying)::text]))
);
--> statement-breakpoint
CREATE TABLE "project_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"priority" varchar(50) DEFAULT 'medium' NOT NULL,
	"assignee_name" text,
	"due_date" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"order_num" integer DEFAULT 0 NOT NULL,
	"project_id" integer NOT NULL,
	"completed_at" timestamp,
	"order" integer DEFAULT 0 NOT NULL,
	"attachments" text,
	"assignee_id" text,
	"assignee_ids" text[],
	"assignee_names" text[],
	"completed_by" text,
	"completed_by_name" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "task_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	CONSTRAINT "task_completions_task_id_user_id_key" UNIQUE("task_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "drive_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"url" text NOT NULL,
	"icon" text NOT NULL,
	"icon_color" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"role" text DEFAULT 'volunteer',
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"organization" text,
	"address" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text NOT NULL,
	"assignee_id" integer,
	"assignee_name" text,
	"color" text DEFAULT 'blue' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"due_date" text,
	"start_date" text,
	"completion_date" text,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"tags" text,
	"estimated_hours" integer,
	"actual_hours" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"requirements" text,
	"deliverables" text,
	"resources" text,
	"blockers" text,
	"budget" numeric(10, 2),
	"risklevel" varchar(50),
	"stakeholders" text,
	"milestones" text,
	"assignee_ids" jsonb DEFAULT '[]'::jsonb,
	"assignee_names" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	"startDate" date,
	"completionDate" date,
	"estimatedHours" integer,
	"progressPercentage" integer,
	"riskLevel" varchar,
	"endDate" date,
	"dueDate" date,
	"assigneeName" text GENERATED ALWAYS AS (assignee_name) STORED
);
--> statement-breakpoint
CREATE TABLE "kudos" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" varchar(64) NOT NULL,
	"recipient_id" varchar(64) NOT NULL,
	"task_id" integer,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	CONSTRAINT "task_assignments_task_user_unique" UNIQUE("task_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "message_recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer,
	"recipient_id" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"notification_sent" boolean DEFAULT false NOT NULL,
	"email_sent_at" timestamp with time zone,
	"context_access_revoked" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "message_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"root_message_id" integer,
	"message_id" integer,
	"parent_message_id" integer,
	"depth" integer DEFAULT 0 NOT NULL,
	"path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "agenda_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"submitted_by" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"meeting_id" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "hosts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"address" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	CONSTRAINT "hosts_name_not_empty" CHECK ((name IS NOT NULL) AND (TRIM(BOTH FROM name) <> ''::text))
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"sender" text,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"context_type" text,
	"sender_id" text DEFAULT '' NOT NULL,
	"context_id" text,
	"edited_at" timestamp,
	"edited_content" text,
	"message_type" varchar(20) DEFAULT 'chat',
	"reply_to_id" integer,
	"recipient_id" text,
	"subject" text,
	"priority" varchar(10) DEFAULT 'normal',
	"status" varchar(20) DEFAULT 'sent',
	"is_read" boolean DEFAULT false,
	"read_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "hosted_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"uploaded_by" text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "work_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"description" text NOT NULL,
	"hours" integer DEFAULT 0 NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"status" varchar(20) DEFAULT 'pending',
	"approved_by" varchar,
	"approved_at" timestamp with time zone,
	"visibility" varchar(20) DEFAULT 'private',
	"shared_with" jsonb DEFAULT '[]'::jsonb,
	"department" varchar(50),
	"team_id" varchar(50),
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "deletion_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_name" varchar(255) NOT NULL,
	"record_id" varchar(255) NOT NULL,
	"deleted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_by" varchar(255) NOT NULL,
	"deletion_reason" text,
	"record_data" jsonb,
	"can_restore" boolean DEFAULT true,
	"restored_at" timestamp with time zone,
	"restored_by" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"conversation_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"last_read_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone,
	"deleted_by" varchar(255),
	CONSTRAINT "conversation_participants_pkey" PRIMARY KEY("conversation_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "kudos_tracking" ADD CONSTRAINT "kudos_tracking_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kudos_tracking" ADD CONSTRAINT "kudos_tracking_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kudos_tracking" ADD CONSTRAINT "kudos_tracking_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignments" ADD CONSTRAINT "fk_project_assignments_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_assignments" ADD CONSTRAINT "fk_project_assignments_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_congratulations" ADD CONSTRAINT "project_congratulations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_memberships" ADD CONSTRAINT "committee_memberships_committee_id_fkey" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "fk_project_tasks_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "fk_task_completions_task" FOREIGN KEY ("task_id") REFERENCES "public"."project_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "fk_task_completions_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."project_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kudos" ADD CONSTRAINT "kudos_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."project_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignments" ADD CONSTRAINT "task_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_recipients" ADD CONSTRAINT "message_recipients_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_root_message_id_fkey" FOREIGN KEY ("root_message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_collections_created" ON "collections" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_collections_date" ON "collections" USING btree ("collection_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_collections_host" ON "collections" USING btree ("host_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_collections_submitted" ON "collections" USING btree ("submitted_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_suggestions_deleted_at" ON "suggestions" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_kudos_context" ON "kudos_tracking" USING btree ("context_type" text_ops,"context_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_kudos_recipient" ON "kudos_tracking" USING btree ("recipient_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_kudos_sender" ON "kudos_tracking" USING btree ("sender_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_kudos_unique" ON "kudos_tracking" USING btree ("sender_id" text_ops,"recipient_id" text_ops,"context_type" text_ops,"context_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_drivers_deleted_at" ON "drivers" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_project_assignments_project_id" ON "project_assignments" USING btree ("project_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_project_assignments_user_id" ON "project_assignments" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sandwich_collections_deleted_at" ON "sandwich_collections" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_recipients_deleted_at" ON "recipients" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_session_expire" ON "sessions" USING btree ("expire" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_message_reads_message_id" ON "message_reads" USING btree ("message_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_message_reads_user_id" ON "message_reads" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_deleted_at" ON "users" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_project_tasks_deleted_at" ON "project_tasks" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_project_tasks_project_id" ON "project_tasks" USING btree ("project_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_task_completions_task_id" ON "task_completions" USING btree ("task_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_task_completions_user_id" ON "task_completions" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_contacts_deleted_at" ON "contacts" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_projects_deleted_at" ON "projects" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_task_assignments_task_id" ON "task_assignments" USING btree ("task_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_task_assignments_user_id" ON "task_assignments" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_message_recipients_unique" ON "message_recipients" USING btree ("message_id" int4_ops,"recipient_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_message_recipients_unread" ON "message_recipients" USING btree ("recipient_id" bool_ops,"read" bool_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_message_threads_unique" ON "message_threads" USING btree ("message_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_thread_path" ON "message_threads" USING btree ("path" text_ops);--> statement-breakpoint
CREATE INDEX "idx_hosts_deleted_at" ON "hosts" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_id" ON "messages" USING btree ("conversation_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "messages" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_deleted_at" ON "messages" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_messages_is_read" ON "messages" USING btree ("is_read" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_message_type" ON "messages" USING btree ("message_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_recipient_id" ON "messages" USING btree ("recipient_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_recipient_is_read" ON "messages" USING btree ("recipient_id" bool_ops,"is_read" bool_ops) WHERE (recipient_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_messages_reply_to_id" ON "messages" USING btree ("reply_to_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_user_id_is_read" ON "messages" USING btree ("user_id" text_ops,"is_read" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_work_logs_status" ON "work_logs" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_work_logs_user_id" ON "work_logs" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_deletion_audit_deleted_at" ON "deletion_audit" USING btree ("deleted_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_deletion_audit_deleted_by" ON "deletion_audit" USING btree ("deleted_by" text_ops);--> statement-breakpoint
CREATE INDEX "idx_deletion_audit_table_record" ON "deletion_audit" USING btree ("table_name" text_ops,"record_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_conversation_participants_user_id" ON "conversation_participants" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE VIEW "public"."collection_stats" AS (SELECT host_name, count(*) AS total_collections, sum(individual_sandwiches) AS total_individual, sum( CASE WHEN jsonb_array_length(group_collections) > 0 THEN ( SELECT sum((elem.value ->> 'count'::text)::integer) AS sum FROM jsonb_array_elements(collections.group_collections) elem(value) WHERE (elem.value ->> 'count'::text) IS NOT NULL) ELSE 0::bigint END) AS total_group, min(collection_date) AS first_collection, max(collection_date) AS latest_collection, sum(individual_sandwiches)::numeric + sum( CASE WHEN jsonb_array_length(group_collections) > 0 THEN ( SELECT sum((elem.value ->> 'count'::text)::integer) AS sum FROM jsonb_array_elements(collections.group_collections) elem(value) WHERE (elem.value ->> 'count'::text) IS NOT NULL) ELSE 0::bigint END) AS total_sandwiches FROM collections GROUP BY host_name ORDER BY (sum(individual_sandwiches)::numeric + sum( CASE WHEN jsonb_array_length(group_collections) > 0 THEN ( SELECT sum((elem.value ->> 'count'::text)::integer) AS sum FROM jsonb_array_elements(collections.group_collections) elem(value) WHERE (elem.value ->> 'count'::text) IS NOT NULL) ELSE 0::bigint END)) DESC);--> statement-breakpoint
CREATE POLICY "Users can view messages they sent or received" ON "messages" AS PERMISSIVE FOR SELECT TO public USING (((user_id = (auth.uid())::text) OR (recipient_id = (auth.uid())::text) OR (recipient_id IS NULL)));--> statement-breakpoint
CREATE POLICY "Users can insert their own messages" ON "messages" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update messages they received to mark as read" ON "messages" AS PERMISSIVE FOR UPDATE TO public;
*/