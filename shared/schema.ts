// Main schema file - uses Supabase schema with compatibility layer
// This file maps between what the app expects and what Supabase actually has

// Import the actual Supabase schema
export * from "./schema-supabase";

// Import compatibility mappings
import * as supabaseSchema from "./schema-supabase";

// CRITICAL ALIASES - Map expected names to actual Supabase tables
// The app expects 'sandwichCollections' but Supabase has 'collections'
export const sandwichCollections = supabaseSchema.collections;

// Handle other name mismatches
export const projectTasks = supabaseSchema.tasks || supabaseSchema.projectTasks;

// For tables that exist in Supabase but with different structure
export { 
  users,
  projects,
  messages,
  hosts,
  recipients,
  drivers,
  committees,
  committeeMemberships,
  conversations,
  conversationParticipants,
  meetings,
  meetingMinutes,
  agendaItems,
  driveLinks,
  weeklyReports,
  notifications,
  contacts,
  hostContacts,
  driverAgreements,
  projectAssignments,
  projectComments,
  taskCompletions,
  suggestionResponses,
} from "./schema-supabase";

// Tables that might not exist in Supabase yet - create stubs
import { pgTable, serial, text, timestamp, integer, boolean, varchar, jsonb, uuid, bigint } from "drizzle-orm/pg-core";

// These tables are expected by the app but don't exist in Supabase
// They need to be created if the features are used

export const archivedProjects = pgTable("archived_projects", {
  id: serial("id").primaryKey(),
  originalProjectId: integer("original_project_id"),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority"),
  category: text("category"),
  assigneeId: text("assignee_id"),
  assigneeName: text("assignee_name"),
  assigneeIds: text("assignee_ids").array(),
  assigneeNames: text("assignee_names").array(),
  dueDate: text("due_date"),
  startDate: text("start_date"),
  completionDate: text("completion_date"),
  progressPercentage: integer("progress_percentage"),
  notes: text("notes"),
  requirements: text("requirements").array(),
  deliverables: text("deliverables").array(),
  resources: text("resources").array(),
  blockers: text("blockers").array(),
  tags: text("tags").array(),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  budget: varchar("budget"),
  createdBy: text("created_by"),
  createdByName: text("created_by_name"),
  createdAt: timestamp("created_at").defaultNow(),
  originalCreatedAt: timestamp("original_created_at"),
  originalUpdatedAt: timestamp("original_updated_at"),
  archivedBy: text("archived_by"),
  archivedByName: text("archived_by_name"),
  archivedAt: timestamp("archived_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  changes: jsonb("changes"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  channel: text("channel").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  content: text("content").notNull(),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessageReads = pgTable("chat_message_reads", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  userId: text("user_id").notNull(),
  channel: text("channel").notNull(),
  readAt: timestamp("read_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessageLikes = pgTable("chat_message_likes", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name"),
  likedAt: timestamp("liked_at").defaultNow(),
});

export const userActivityLogs = pgTable("user_activity_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  section: text("section").notNull(),
  action: text("action").notNull(),
  details: jsonb("details"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageLikes = pgTable("message_likes", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name"),
  likedAt: timestamp("liked_at").defaultNow(),
});

// Additional tables expected by the app
export const googleSheets = pgTable("google_sheets", {
  id: serial("id").primaryKey(),
  sheetId: text("sheet_id").notNull(),
  name: text("name").notNull(),
  url: text("url"),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailMessages = pgTable("email_messages", {
  id: serial("id").primaryKey(),
  subject: text("subject"),
  body: text("body"),
  sender: text("sender"),
  recipients: text("recipients").array(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailDrafts = pgTable("email_drafts", {
  id: serial("id").primaryKey(),
  subject: text("subject"),
  body: text("body"),
  recipients: text("recipients").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const streamUsers = pgTable("stream_users", {
  id: text("id").primaryKey(),
  name: text("name"),
  role: text("role"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streamChannels = pgTable("stream_channels", {
  id: text("id").primaryKey(),
  type: text("type"),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streamMessages = pgTable("stream_messages", {
  id: text("id").primaryKey(),
  channelId: text("channel_id"),
  userId: text("user_id"),
  text: text("text"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streamThreads = pgTable("stream_threads", {
  id: text("id").primaryKey(),
  messageId: text("message_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for the app
export type SandwichCollection = typeof sandwichCollections.$inferSelect;
export type InsertSandwichCollection = typeof sandwichCollections.$inferInsert;
export type User = typeof supabaseSchema.users.$inferSelect;
export type InsertUser = typeof supabaseSchema.users.$inferInsert;
export type UpsertUser = InsertUser;
export type Project = typeof supabaseSchema.projects.$inferSelect;
export type InsertProject = typeof supabaseSchema.projects.$inferInsert;
export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = typeof projectTasks.$inferInsert;
export type ProjectComment = typeof supabaseSchema.projectComments.$inferSelect;
export type InsertProjectComment = typeof supabaseSchema.projectComments.$inferInsert;
export type ProjectAssignment = typeof supabaseSchema.projectAssignments.$inferSelect;
export type InsertProjectAssignment = typeof supabaseSchema.projectAssignments.$inferInsert;
export type TaskCompletion = typeof supabaseSchema.taskCompletions.$inferSelect;
export type InsertTaskCompletion = typeof supabaseSchema.taskCompletions.$inferInsert;
export type Message = typeof supabaseSchema.messages.$inferSelect;
export type InsertMessage = typeof supabaseSchema.messages.$inferInsert;
export type MessageLike = typeof messageLikes.$inferSelect;
export type InsertMessageLike = typeof messageLikes.$inferInsert;
export type WeeklyReport = typeof supabaseSchema.weeklyReports.$inferSelect;
export type InsertWeeklyReport = typeof supabaseSchema.weeklyReports.$inferInsert;
export type MeetingMinutes = typeof supabaseSchema.meetingMinutes.$inferSelect;
export type InsertMeetingMinutes = typeof supabaseSchema.meetingMinutes.$inferInsert;
export type DriveLink = typeof supabaseSchema.driveLinks.$inferSelect;
export type InsertDriveLink = typeof supabaseSchema.driveLinks.$inferInsert;
export type AgendaItem = typeof supabaseSchema.agendaItems.$inferSelect;
export type InsertAgendaItem = typeof supabaseSchema.agendaItems.$inferInsert;
export type Meeting = typeof supabaseSchema.meetings.$inferSelect;
export type InsertMeeting = typeof supabaseSchema.meetings.$inferInsert;
export type DriverAgreement = typeof supabaseSchema.driverAgreements.$inferSelect;
export type InsertDriverAgreement = typeof supabaseSchema.driverAgreements.$inferInsert;
export type Driver = typeof supabaseSchema.drivers.$inferSelect;
export type InsertDriver = typeof supabaseSchema.drivers.$inferInsert;
export type Host = typeof supabaseSchema.hosts.$inferSelect;
export type InsertHost = typeof supabaseSchema.hosts.$inferInsert;
export type HostContact = typeof supabaseSchema.hostContacts.$inferSelect;
export type InsertHostContact = typeof supabaseSchema.hostContacts.$inferInsert;
export type Recipient = typeof supabaseSchema.recipients.$inferSelect;
export type InsertRecipient = typeof supabaseSchema.recipients.$inferInsert;
export type Contact = typeof supabaseSchema.contacts.$inferSelect;
export type InsertContact = typeof supabaseSchema.contacts.$inferInsert;
export type Committee = typeof supabaseSchema.committees.$inferSelect;
export type InsertCommittee = typeof supabaseSchema.committees.$inferInsert;
export type CommitteeMembership = typeof supabaseSchema.committeeMemberships.$inferSelect;
export type InsertCommitteeMembership = typeof supabaseSchema.committeeMemberships.$inferInsert;
export type Notification = typeof supabaseSchema.notifications.$inferSelect;
export type InsertNotification = typeof supabaseSchema.notifications.$inferInsert;
export type Suggestion = typeof supabaseSchema.suggestions.$inferSelect;
export type InsertSuggestion = typeof supabaseSchema.suggestions.$inferInsert;
export type SuggestionResponse = typeof supabaseSchema.suggestionResponses.$inferSelect;
export type InsertSuggestionResponse = typeof supabaseSchema.suggestionResponses.$inferInsert;
export type ChatMessageLike = typeof chatMessageLikes.$inferSelect;
export type InsertChatMessageLike = typeof chatMessageLikes.$inferInsert;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type InsertUserActivityLog = typeof userActivityLogs.$inferInsert;

// Export additional types that might be needed
export type ArchivedProject = typeof archivedProjects.$inferSelect;
export type InsertArchivedProject = typeof archivedProjects.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessageRead = typeof chatMessageReads.$inferSelect;
export type InsertChatMessageRead = typeof chatMessageReads.$inferInsert;

// Schema for insertions  
export const insertGoogleSheetSchema = googleSheets;
export const insertSuggestionSchema = supabaseSchema.suggestions;
export const insertSuggestionResponseSchema = supabaseSchema.suggestionResponses;
export const insertUserActivityLogSchema = userActivityLogs;
export const insertProjectSchema = supabaseSchema.projects;
export const insertProjectTaskSchema = projectTasks;
export const insertProjectCommentSchema = supabaseSchema.projectComments;
export const insertTaskCompletionSchema = supabaseSchema.taskCompletions;
export const insertMessageSchema = supabaseSchema.messages;
export const insertWeeklyReportSchema = supabaseSchema.weeklyReports;
export const insertSandwichCollectionSchema = sandwichCollections;
export const insertMeetingMinutesSchema = supabaseSchema.meetingMinutes;
export const insertAgendaItemSchema = supabaseSchema.agendaItems;
export const insertMeetingSchema = supabaseSchema.meetings;
export const insertDriverAgreementSchema = supabaseSchema.driverAgreements;
export const insertDriverSchema = supabaseSchema.drivers;
export const insertHostSchema = supabaseSchema.hosts;
export const insertHostContactSchema = supabaseSchema.hostContacts;
export const insertRecipientSchema = supabaseSchema.recipients;
export const insertContactSchema = supabaseSchema.contacts;
export const insertAnnouncementSchema = supabaseSchema.announcements;
export const insertNotificationSchema = supabaseSchema.notifications;
export const insertCommitteeSchema = supabaseSchema.committees;
export const insertCommitteeMembershipSchema = supabaseSchema.committeeMemberships;
export const insertConversationSchema = supabaseSchema.conversations;
export const insertProjectAssignmentSchema = supabaseSchema.projectAssignments;
export const insertUserSchema = supabaseSchema.users;
export const insertDriveLinkSchema = supabaseSchema.driveLinks;