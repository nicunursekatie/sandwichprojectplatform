import { pgTable, index, bigserial, date, text, integer, jsonb, timestamp, serial, varchar, boolean, uniqueIndex, foreignKey, numeric, unique, uuid, check, pgPolicy, primaryKey, pgView, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const collections = pgTable("collections", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	collectionDate: date("collection_date").notNull(),
	hostName: text("host_name").notNull(),
	individualSandwiches: integer("individual_sandwiches").default(0).notNull(),
	groupCollections: jsonb("group_collections").default([]),
	submittedAt: timestamp("submitted_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_collections_created").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_collections_date").using("btree", table.collectionDate.asc().nullsLast().op("date_ops")),
	index("idx_collections_host").using("btree", table.hostName.asc().nullsLast().op("text_ops")),
	index("idx_collections_submitted").using("btree", table.submittedAt.asc().nullsLast().op("timestamptz_ops")),
]);

export const suggestions = pgTable("suggestions", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	category: text().default('general').notNull(),
	priority: text().default('medium').notNull(),
	status: text().default('submitted').notNull(),
	submittedBy: varchar("submitted_by", { length: 255 }).notNull(),
	submitterEmail: varchar("submitter_email", { length: 255 }),
	submitterName: text("submitter_name"),
	isAnonymous: boolean("is_anonymous").default(false).notNull(),
	upvotes: integer().default(0).notNull(),
	tags: text().array().default([""]),
	implementationNotes: text("implementation_notes"),
	estimatedEffort: text("estimated_effort"),
	assignedTo: varchar("assigned_to", { length: 255 }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_suggestions_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(deleted_at IS NULL)`),
]);

export const kudosTracking = pgTable("kudos_tracking", {
	id: serial().primaryKey().notNull(),
	senderId: text("sender_id").notNull(),
	recipientId: text("recipient_id").notNull(),
	contextType: text("context_type").notNull(),
	contextId: text("context_id").notNull(),
	messageId: integer("message_id"),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_kudos_context").using("btree", table.contextType.asc().nullsLast().op("text_ops"), table.contextId.asc().nullsLast().op("text_ops")),
	index("idx_kudos_recipient").using("btree", table.recipientId.asc().nullsLast().op("text_ops")),
	index("idx_kudos_sender").using("btree", table.senderId.asc().nullsLast().op("text_ops")),
	uniqueIndex("idx_kudos_unique").using("btree", table.senderId.asc().nullsLast().op("text_ops"), table.recipientId.asc().nullsLast().op("text_ops"), table.contextType.asc().nullsLast().op("text_ops"), table.contextId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.id],
			name: "kudos_tracking_message_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recipientId],
			foreignColumns: [users.id],
			name: "kudos_tracking_recipient_id_fkey"
		}),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "kudos_tracking_sender_id_fkey"
		}),
]);

export const announcements = pgTable("announcements", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	type: varchar().default('general').notNull(),
	priority: varchar().default('medium').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	link: text(),
	linkText: text("link_text"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
});

export const hostContacts = pgTable("host_contacts", {
	id: serial().primaryKey().notNull(),
	hostId: integer("host_id").notNull(),
	name: text().notNull(),
	role: text().notNull(),
	phone: text().notNull(),
	email: text(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
});

export const groupMemberships = pgTable("group_memberships", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	groupId: integer("group_id").notNull(),
	role: varchar({ length: 50 }).default('member'),
	isActive: boolean("is_active").default(true),
	joinedAt: timestamp("joined_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const drivers = pgTable("drivers", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	phone: text(),
	email: text(),
	address: text(),
	notes: text(),
	isActive: boolean("is_active").default(true).notNull(),
	vehicleType: text("vehicle_type"),
	licenseNumber: text("license_number"),
	availability: text().default('available'),
	zone: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	vanApproved: boolean("van_approved").default(false),
	homeAddress: text("home_address"),
	availabilityNotes: text("availability_notes"),
	emailAgreementSent: boolean("email_agreement_sent").default(false),
	voicemailLeft: boolean("voicemail_left").default(false),
	inactiveReason: text("inactive_reason"),
	hostId: integer("host_id"),
	routeDescription: text("route_description"),
	hostLocation: text("host_location"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_drivers_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(deleted_at IS NULL)`),
]);

export const driverAgreements = pgTable("driver_agreements", {
	id: serial().primaryKey().notNull(),
	submittedBy: text("submitted_by").notNull(),
	email: text().notNull(),
	phone: text().notNull(),
	licenseNumber: text("license_number").notNull(),
	vehicleInfo: text("vehicle_info").notNull(),
	emergencyContact: text("emergency_contact").notNull(),
	emergencyPhone: text("emergency_phone").notNull(),
	agreementAccepted: boolean("agreement_accepted").default(false).notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
});

export const meetingMinutes = pgTable("meeting_minutes", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	date: text().notNull(),
	summary: text().notNull(),
	color: text().default('blue').notNull(),
	fileName: text("file_name"),
	filePath: text("file_path"),
	fileType: text("file_type"),
	mimeType: text("mime_type"),
	committeeType: text("committee_type"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
});

export const sandwichCollectionsBackup = pgTable("sandwich_collections_backup", {
	id: numeric(),
	collectionDate: date("collection_date"),
	hostName: text("host_name"),
	individualSandwiches: numeric("individual_sandwiches"),
	groupCollections: text("group_collections"),
	submittedAt: text("submitted_at"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
	groupCount: numeric("group_count"),
});

export const sandwichImportStaging = pgTable("sandwich_import_staging", {
	id: integer(),
	collectionDate: text("collection_date"),
	hostName: text("host_name"),
	individualSandwiches: integer("individual_sandwiches"),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 255 }),
	createdByName: varchar("created_by_name", { length: 255 }),
	group1Name: text("group1_name"),
	group1Count: integer("group1_count"),
	group2Name: text("group2_name"),
	group2Count: integer("group2_count"),
});

export const meetings = pgTable("meetings", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	date: text().notNull(),
	time: text().notNull(),
	finalAgenda: text("final_agenda"),
	status: text().default('planning').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	type: text().notNull(),
	location: text(),
	description: text(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
});

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	type: varchar().notNull(),
	title: text().notNull(),
	body: text().notNull(),
	read: boolean().default(false).notNull(),
	relatedType: varchar("related_type"),
	relatedId: integer("related_id"),
	celebrationData: jsonb("celebration_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	sourceId: text("source_id"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("notifications_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const projectAssignments = pgTable("project_assignments", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	userId: text("user_id").notNull(),
	role: text().default('member').notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_project_assignments_project_id").using("btree", table.projectId.asc().nullsLast().op("int4_ops")),
	index("idx_project_assignments_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "fk_project_assignments_project"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_project_assignments_user"
		}).onDelete("cascade"),
	unique("project_assignments_project_user_unique").on(table.projectId, table.userId),
]);

export const sandwichCollections = pgTable("sandwich_collections", {
	id: bigint({ mode: "bigint" }).primaryKey().notNull(),
	collectionDate: date("collection_date").notNull(),
	hostName: text("host_name").notNull(),
	individualSandwiches: bigint("individual_sandwiches", { mode: "bigint" }).notNull(),
	group1Name: text("group1_name"),
	group1Count: bigint("group1_count", { mode: "bigint" }),
	group2Name: text("group2_name"),
	group2Count: bigint("group2_count", { mode: "bigint" }),
	submittedAt: jsonb("submitted_at"),
	createdBy: text("created_by"),
	createdByName: text("created_by_name"),
	submissionMethod: text("submission_method"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_sandwich_collections_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(deleted_at IS NULL)`),
]);

export const recipients = pgTable("recipients", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	phone: text().notNull(),
	email: text(),
	address: text(),
	preferences: text(),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	contactName: text("contact_name"),
	weeklyEstimate: integer("weekly_estimate"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_recipients_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(deleted_at IS NULL)`),
]);

export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
	index("idx_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const projectDocuments = pgTable("project_documents", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	fileName: text("file_name").notNull(),
	originalName: text("original_name").notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: text("mime_type").notNull(),
	uploadedBy: text("uploaded_by").notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
});

export const suggestionResponses = pgTable("suggestion_responses", {
	id: serial().primaryKey().notNull(),
	suggestionId: integer("suggestion_id").notNull(),
	message: text().notNull(),
	isAdminResponse: boolean("is_admin_response").default(false).notNull(),
	respondedBy: varchar("responded_by", { length: 255 }).notNull(),
	respondentName: text("respondent_name"),
	isInternal: boolean("is_internal").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
});

export const weeklyReports = pgTable("weekly_reports", {
	id: serial().primaryKey().notNull(),
	weekEnding: text("week_ending").notNull(),
	sandwichCount: integer("sandwich_count").notNull(),
	notes: text(),
	submittedBy: text("submitted_by").notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
});

export const messageReads = pgTable("message_reads", {
	id: serial().primaryKey().notNull(),
	messageId: integer("message_id"),
	userId: text("user_id").notNull(),
	readAt: timestamp("read_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_message_reads_message_id").using("btree", table.messageId.asc().nullsLast().op("int4_ops")),
	index("idx_message_reads_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.id],
			name: "message_reads_message_id_fkey"
		}).onDelete("cascade"),
	unique("message_reads_message_id_user_id_key").on(table.messageId, table.userId),
]);

export const projectCongratulations = pgTable("project_congratulations", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	userId: text("user_id").notNull(),
	userName: text("user_name").notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_congratulations_project_id_fkey"
		}).onDelete("cascade"),
]);

export const sandwichCollectionsBackupBeforeMigration = pgTable("sandwich_collections_backup_before_migration", {
	id: numeric(),
	collectionDate: text("collection_date"),
	hostName: text("host_name"),
	individualSandwiches: numeric("individual_sandwiches"),
	groupCollections: text("group_collections"),
	submittedAt: text("submitted_at"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
	groupCount: numeric("group_count"),
});

export const tasks = pgTable("tasks", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: varchar({ length: 32 }).default('pending'),
	priority: varchar({ length: 32 }),
	dueDate: date("due_date"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	orderNum: integer("order_num").default(0),
	assigneeIds: varchar("assignee_ids").array(),
});

export const users = pgTable("users", {
	id: varchar().primaryKey().notNull(),
	email: varchar(),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	profileImageUrl: varchar("profile_image_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	role: varchar().default('volunteer'),
	permissions: jsonb().default([]),
	isActive: boolean("is_active").default(true),
	metadata: jsonb(),
	displayName: varchar("display_name"),
	password: varchar({ length: 255 }),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	authId: uuid("auth_id"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_users_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(deleted_at IS NULL)`),
	foreignKey({
			columns: [table.authId],
			foreignColumns: [table.id],
			name: "users_auth_id_fkey"
		}),
	unique("users_email_unique").on(table.email),
]);

export const committees = pgTable("committees", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(true),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	unique("committees_name_key").on(table.name),
]);

export const projectComments = pgTable("project_comments", {
	id: serial().primaryKey().notNull(),
	content: text().notNull(),
	authorName: text("author_name").notNull(),
	commentType: varchar("comment_type", { length: 50 }).default('general').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	projectId: integer("project_id").notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_comments_project_id_fkey"
		}).onDelete("cascade"),
]);

export const committeeMemberships = pgTable("committee_memberships", {
	id: serial().primaryKey().notNull(),
	committeeId: integer("committee_id"),
	userId: varchar("user_id", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	role: varchar({ length: 100 }).default('member'),
	permissions: text().array(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	isActive: boolean("is_active").default(true).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.committeeId],
			foreignColumns: [committees.id],
			name: "committee_memberships_committee_id_fkey"
		}).onDelete("cascade"),
	unique("committee_memberships_committee_id_user_id_key").on(table.committeeId, table.userId),
]);

export const conversations = pgTable("conversations", {
	id: serial().primaryKey().notNull(),
	type: varchar({ length: 20 }).notNull(),
	name: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	check("conversations_type_check", sql`(type)::text = ANY (ARRAY[('direct'::character varying)::text, ('group'::character varying)::text, ('channel'::character varying)::text])`),
]);

export const projectTasks = pgTable("project_tasks", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	priority: varchar({ length: 50 }).default('medium').notNull(),
	assigneeName: text("assignee_name"),
	dueDate: text("due_date"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	orderNum: integer("order_num").default(0).notNull(),
	projectId: integer("project_id").notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	order: integer().default(0).notNull(),
	attachments: text(),
	assigneeId: text("assignee_id"),
	assigneeIds: text("assignee_ids").array(),
	assigneeNames: text("assignee_names").array(),
	completedBy: text("completed_by"),
	completedByName: text("completed_by_name"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_project_tasks_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(deleted_at IS NULL)`),
	index("idx_project_tasks_project_id").using("btree", table.projectId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "fk_project_tasks_project"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_tasks_project_id_fkey"
		}).onDelete("cascade"),
]);

export const taskCompletions = pgTable("task_completions", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id").notNull(),
	userId: text("user_id").notNull(),
	userName: text("user_name").notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }).defaultNow().notNull(),
	notes: text(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_task_completions_task_id").using("btree", table.taskId.asc().nullsLast().op("int4_ops")),
	index("idx_task_completions_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [projectTasks.id],
			name: "fk_task_completions_task"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_task_completions_user"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [projectTasks.id],
			name: "task_completions_task_id_fkey"
		}).onDelete("cascade"),
	unique("task_completions_task_id_user_id_key").on(table.taskId, table.userId),
]);

export const driveLinks = pgTable("drive_links", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	url: text().notNull(),
	icon: text().notNull(),
	iconColor: text("icon_color").notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
});

export const contacts = pgTable("contacts", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	phone: text(),
	email: text(),
	role: text().default('volunteer'),
	notes: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	organization: text(),
	address: text(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_contacts_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(deleted_at IS NULL)`),
]);

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	status: text().notNull(),
	assigneeId: integer("assignee_id"),
	assigneeName: text("assignee_name"),
	color: text().default('blue').notNull(),
	priority: text().default('medium').notNull(),
	category: text().default('general').notNull(),
	dueDate: text("due_date"),
	startDate: text("start_date"),
	completionDate: text("completion_date"),
	progressPercentage: integer("progress_percentage").default(0).notNull(),
	notes: text(),
	tags: text(),
	estimatedHours: integer("estimated_hours"),
	actualHours: integer("actual_hours"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	requirements: text(),
	deliverables: text(),
	resources: text(),
	blockers: text(),
	budget: numeric({ precision: 10, scale:  2 }),
	risklevel: varchar({ length: 50 }),
	stakeholders: text(),
	milestones: text(),
	assigneeIds: jsonb("assignee_ids").default([]),
	assigneeNames: text("assignee_names"),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
	riskLevel: varchar(),
	endDate: date(),
}, (table) => [
	index("idx_projects_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(deleted_at IS NULL)`),
]);

export const kudos = pgTable("kudos", {
	id: serial().primaryKey().notNull(),
	senderId: varchar("sender_id", { length: 64 }).notNull(),
	recipientId: varchar("recipient_id", { length: 64 }).notNull(),
	taskId: integer("task_id"),
	message: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "kudos_task_id_fkey"
		}).onDelete("cascade"),
]);

export const taskAssignments = pgTable("task_assignments", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id").notNull(),
	userId: text("user_id").notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_task_assignments_task_id").using("btree", table.taskId.asc().nullsLast().op("int4_ops")),
	index("idx_task_assignments_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [projectTasks.id],
			name: "task_assignments_task_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "task_assignments_user_id_fkey"
		}),
	unique("task_assignments_task_user_unique").on(table.taskId, table.userId),
]);

export const messageRecipients = pgTable("message_recipients", {
	id: serial().primaryKey().notNull(),
	messageId: integer("message_id"),
	recipientId: text("recipient_id").notNull(),
	read: boolean().default(false).notNull(),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
	notificationSent: boolean("notification_sent").default(false).notNull(),
	emailSentAt: timestamp("email_sent_at", { withTimezone: true, mode: 'string' }),
	contextAccessRevoked: boolean("context_access_revoked").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	uniqueIndex("idx_message_recipients_unique").using("btree", table.messageId.asc().nullsLast().op("int4_ops"), table.recipientId.asc().nullsLast().op("int4_ops")),
	index("idx_message_recipients_unread").using("btree", table.recipientId.asc().nullsLast().op("bool_ops"), table.read.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.id],
			name: "message_recipients_message_id_fkey"
		}).onDelete("cascade"),
]);

export const messageThreads = pgTable("message_threads", {
	id: serial().primaryKey().notNull(),
	rootMessageId: integer("root_message_id"),
	messageId: integer("message_id"),
	parentMessageId: integer("parent_message_id"),
	depth: integer().default(0).notNull(),
	path: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	uniqueIndex("idx_message_threads_unique").using("btree", table.messageId.asc().nullsLast().op("int4_ops")),
	index("idx_thread_path").using("btree", table.path.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.messageId],
			foreignColumns: [messages.id],
			name: "message_threads_message_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentMessageId],
			foreignColumns: [messages.id],
			name: "message_threads_parent_message_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.rootMessageId],
			foreignColumns: [messages.id],
			name: "message_threads_root_message_id_fkey"
		}).onDelete("cascade"),
]);

export const agendaItems = pgTable("agenda_items", {
	id: serial().primaryKey().notNull(),
	submittedBy: text("submitted_by").notNull(),
	title: text().notNull(),
	description: text(),
	status: text().default('pending').notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow().notNull(),
	meetingId: integer("meeting_id").default(1).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
});

export const hosts = pgTable("hosts", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text(),
	phone: text(),
	status: text().default('active').notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	address: text(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_hosts_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(deleted_at IS NULL)`),
	check("hosts_name_not_empty", sql`(name IS NOT NULL) AND (TRIM(BOTH FROM name) <> ''::text)`),
]);

export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	conversationId: integer("conversation_id"),
	userId: text("user_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	sender: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
	metadata: jsonb().default({}),
	contextType: text("context_type"),
	senderId: text("sender_id").notNull(),
	contextId: text("context_id"),
	editedAt: timestamp("edited_at", { mode: 'string' }),
	editedContent: text("edited_content"),
	messageType: varchar("message_type", { length: 20 }).default('chat'),
	replyToId: integer("reply_to_id"),
	recipientId: text("recipient_id"),
	subject: text(),
	priority: varchar({ length: 10 }).default('normal'),
	status: varchar({ length: 20 }).default('sent'),
	isRead: boolean("is_read").default(false),
	readAt: timestamp("read_at", { mode: 'string' }),
}, (table) => [
	index("idx_messages_conversation_id").using("btree", table.conversationId.asc().nullsLast().op("int4_ops")),
	index("idx_messages_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_messages_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(deleted_at IS NULL)`),
	index("idx_messages_is_read").using("btree", table.isRead.asc().nullsLast().op("bool_ops")),
	index("idx_messages_message_type").using("btree", table.messageType.asc().nullsLast().op("text_ops")),
	index("idx_messages_recipient_id").using("btree", table.recipientId.asc().nullsLast().op("text_ops")),
	index("idx_messages_recipient_is_read").using("btree", table.recipientId.asc().nullsLast().op("bool_ops"), table.isRead.asc().nullsLast().op("bool_ops")).where(sql`(recipient_id IS NOT NULL)`),
	index("idx_messages_reply_to_id").using("btree", table.replyToId.asc().nullsLast().op("int4_ops")),
	index("idx_messages_user_id_is_read").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.isRead.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "messages_conversation_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recipientId],
			foreignColumns: [users.id],
			name: "messages_recipient_id_fkey"
		}),
	foreignKey({
			columns: [table.replyToId],
			foreignColumns: [table.id],
			name: "messages_reply_to_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "messages_user_id_fkey"
		}),
	pgPolicy("Users can view messages they sent or received", { as: "permissive", for: "select", to: ["public"], using: sql`((user_id = (auth.uid())::text) OR (recipient_id = (auth.uid())::text) OR (recipient_id IS NULL))` }),
	pgPolicy("Users can insert their own messages", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Users can update messages they received to mark as read", { as: "permissive", for: "update", to: ["public"] }),
]);

export const hostedFiles = pgTable("hosted_files", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	fileName: text("file_name").notNull(),
	originalName: text("original_name").notNull(),
	filePath: text("file_path").notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: text("mime_type").notNull(),
	category: text().default('general').notNull(),
	uploadedBy: text("uploaded_by").notNull(),
	isPublic: boolean("is_public").default(true).notNull(),
	downloadCount: integer("download_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
});

export const workLogs = pgTable("work_logs", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	description: text().notNull(),
	hours: integer().default(0).notNull(),
	minutes: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	status: varchar({ length: 20 }).default('pending'),
	approvedBy: varchar("approved_by"),
	approvedAt: timestamp("approved_at", { withTimezone: true, mode: 'string' }),
	visibility: varchar({ length: 20 }).default('private'),
	sharedWith: jsonb("shared_with").default([]),
	department: varchar({ length: 50 }),
	teamId: varchar("team_id", { length: 50 }),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_work_logs_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_work_logs_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "work_logs_approved_by_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "work_logs_user_id_fkey"
		}).onDelete("cascade"),
]);

export const deletionAudit = pgTable("deletion_audit", {
	id: serial().primaryKey().notNull(),
	tableName: varchar("table_name", { length: 255 }).notNull(),
	recordId: varchar("record_id", { length: 255 }).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedBy: varchar("deleted_by", { length: 255 }).notNull(),
	deletionReason: text("deletion_reason"),
	recordData: jsonb("record_data"),
	canRestore: boolean("can_restore").default(true),
	restoredAt: timestamp("restored_at", { withTimezone: true, mode: 'string' }),
	restoredBy: varchar("restored_by", { length: 255 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_deletion_audit_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_deletion_audit_deleted_by").using("btree", table.deletedBy.asc().nullsLast().op("text_ops")),
	index("idx_deletion_audit_table_record").using("btree", table.tableName.asc().nullsLast().op("text_ops"), table.recordId.asc().nullsLast().op("text_ops")),
]);

export const conversationParticipants = pgTable("conversation_participants", {
	conversationId: integer("conversation_id").notNull(),
	userId: text("user_id").notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	lastReadAt: timestamp("last_read_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	deletedBy: varchar("deleted_by", { length: 255 }),
}, (table) => [
	index("idx_conversation_participants_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [conversations.id],
			name: "conversation_participants_conversation_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.conversationId, table.userId], name: "conversation_participants_pkey"}),
]);
export const collectionStats = pgView("collection_stats", {	hostName: text("host_name"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalCollections: bigint("total_collections", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalIndividual: bigint("total_individual", { mode: "number" }),
	totalGroup: numeric("total_group"),
	firstCollection: date("first_collection"),
	latestCollection: date("latest_collection"),
	totalSandwiches: numeric("total_sandwiches"),
}).as(sql`SELECT host_name, count(*) AS total_collections, sum(individual_sandwiches) AS total_individual, sum( CASE WHEN jsonb_array_length(group_collections) > 0 THEN ( SELECT sum((elem.value ->> 'count'::text)::integer) AS sum FROM jsonb_array_elements(collections.group_collections) elem(value) WHERE (elem.value ->> 'count'::text) IS NOT NULL) ELSE 0::bigint END) AS total_group, min(collection_date) AS first_collection, max(collection_date) AS latest_collection, sum(individual_sandwiches)::numeric + sum( CASE WHEN jsonb_array_length(group_collections) > 0 THEN ( SELECT sum((elem.value ->> 'count'::text)::integer) AS sum FROM jsonb_array_elements(collections.group_collections) elem(value) WHERE (elem.value ->> 'count'::text) IS NOT NULL) ELSE 0::bigint END) AS total_sandwiches FROM collections GROUP BY host_name ORDER BY (sum(individual_sandwiches)::numeric + sum( CASE WHEN jsonb_array_length(group_collections) > 0 THEN ( SELECT sum((elem.value ->> 'count'::text)::integer) AS sum FROM jsonb_array_elements(collections.group_collections) elem(value) WHERE (elem.value ->> 'count'::text) IS NOT NULL) ELSE 0::bigint END)) DESC`);