import { relations } from "drizzle-orm/relations";
import { messages, kudosTracking, users, projects, projectAssignments, messageReads, projectCongratulations, usersInAuth, projectComments, committees, committeeMemberships, projectTasks, taskCompletions, tasks, kudos, taskAssignments, messageRecipients, messageThreads, conversations, workLogs, conversationParticipants } from "./schema";

export const kudosTrackingRelations = relations(kudosTracking, ({one}) => ({
	message: one(messages, {
		fields: [kudosTracking.messageId],
		references: [messages.id]
	}),
	user_recipientId: one(users, {
		fields: [kudosTracking.recipientId],
		references: [users.id],
		relationName: "kudosTracking_recipientId_users_id"
	}),
	user_senderId: one(users, {
		fields: [kudosTracking.senderId],
		references: [users.id],
		relationName: "kudosTracking_senderId_users_id"
	}),
}));

export const messagesRelations = relations(messages, ({one, many}) => ({
	kudosTrackings: many(kudosTracking),
	messageReads: many(messageReads),
	messageRecipients: many(messageRecipients),
	messageThreads_messageId: many(messageThreads, {
		relationName: "messageThreads_messageId_messages_id"
	}),
	messageThreads_parentMessageId: many(messageThreads, {
		relationName: "messageThreads_parentMessageId_messages_id"
	}),
	messageThreads_rootMessageId: many(messageThreads, {
		relationName: "messageThreads_rootMessageId_messages_id"
	}),
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	user_recipientId: one(users, {
		fields: [messages.recipientId],
		references: [users.id],
		relationName: "messages_recipientId_users_id"
	}),
	message: one(messages, {
		fields: [messages.replyToId],
		references: [messages.id],
		relationName: "messages_replyToId_messages_id"
	}),
	messages: many(messages, {
		relationName: "messages_replyToId_messages_id"
	}),
	user_userId: one(users, {
		fields: [messages.userId],
		references: [users.id],
		relationName: "messages_userId_users_id"
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	kudosTrackings_recipientId: many(kudosTracking, {
		relationName: "kudosTracking_recipientId_users_id"
	}),
	kudosTrackings_senderId: many(kudosTracking, {
		relationName: "kudosTracking_senderId_users_id"
	}),
	projectAssignments: many(projectAssignments),
	usersInAuth: one(usersInAuth, {
		fields: [users.authId],
		references: [usersInAuth.id]
	}),
	taskCompletions: many(taskCompletions),
	taskAssignments: many(taskAssignments),
	messages_recipientId: many(messages, {
		relationName: "messages_recipientId_users_id"
	}),
	messages_userId: many(messages, {
		relationName: "messages_userId_users_id"
	}),
	workLogs_approvedBy: many(workLogs, {
		relationName: "workLogs_approvedBy_users_id"
	}),
	workLogs_userId: many(workLogs, {
		relationName: "workLogs_userId_users_id"
	}),
}));

export const projectAssignmentsRelations = relations(projectAssignments, ({one}) => ({
	project: one(projects, {
		fields: [projectAssignments.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [projectAssignments.userId],
		references: [users.id]
	}),
}));

export const projectsRelations = relations(projects, ({many}) => ({
	projectAssignments: many(projectAssignments),
	projectCongratulations: many(projectCongratulations),
	projectComments: many(projectComments),
	projectTasks_projectId: many(projectTasks, {
		relationName: "projectTasks_projectId_projects_id"
	}),
	projectTasks_projectId: many(projectTasks, {
		relationName: "projectTasks_projectId_projects_id"
	}),
}));

export const messageReadsRelations = relations(messageReads, ({one}) => ({
	message: one(messages, {
		fields: [messageReads.messageId],
		references: [messages.id]
	}),
}));

export const projectCongratulationsRelations = relations(projectCongratulations, ({one}) => ({
	project: one(projects, {
		fields: [projectCongratulations.projectId],
		references: [projects.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	users: many(users),
}));

export const projectCommentsRelations = relations(projectComments, ({one}) => ({
	project: one(projects, {
		fields: [projectComments.projectId],
		references: [projects.id]
	}),
}));

export const committeeMembershipsRelations = relations(committeeMemberships, ({one}) => ({
	committee: one(committees, {
		fields: [committeeMemberships.committeeId],
		references: [committees.id]
	}),
}));

export const committeesRelations = relations(committees, ({many}) => ({
	committeeMemberships: many(committeeMemberships),
}));

export const projectTasksRelations = relations(projectTasks, ({one, many}) => ({
	project_projectId: one(projects, {
		fields: [projectTasks.projectId],
		references: [projects.id],
		relationName: "projectTasks_projectId_projects_id"
	}),
	project_projectId: one(projects, {
		fields: [projectTasks.projectId],
		references: [projects.id],
		relationName: "projectTasks_projectId_projects_id"
	}),
	taskCompletions_taskId: many(taskCompletions, {
		relationName: "taskCompletions_taskId_projectTasks_id"
	}),
	taskCompletions_taskId: many(taskCompletions, {
		relationName: "taskCompletions_taskId_projectTasks_id"
	}),
	taskAssignments: many(taskAssignments),
}));

export const taskCompletionsRelations = relations(taskCompletions, ({one}) => ({
	projectTask_taskId: one(projectTasks, {
		fields: [taskCompletions.taskId],
		references: [projectTasks.id],
		relationName: "taskCompletions_taskId_projectTasks_id"
	}),
	user: one(users, {
		fields: [taskCompletions.userId],
		references: [users.id]
	}),
	projectTask_taskId: one(projectTasks, {
		fields: [taskCompletions.taskId],
		references: [projectTasks.id],
		relationName: "taskCompletions_taskId_projectTasks_id"
	}),
}));

export const kudosRelations = relations(kudos, ({one}) => ({
	task: one(tasks, {
		fields: [kudos.taskId],
		references: [tasks.id]
	}),
}));

export const tasksRelations = relations(tasks, ({many}) => ({
	kudos: many(kudos),
}));

export const taskAssignmentsRelations = relations(taskAssignments, ({one}) => ({
	projectTask: one(projectTasks, {
		fields: [taskAssignments.taskId],
		references: [projectTasks.id]
	}),
	user: one(users, {
		fields: [taskAssignments.userId],
		references: [users.id]
	}),
}));

export const messageRecipientsRelations = relations(messageRecipients, ({one}) => ({
	message: one(messages, {
		fields: [messageRecipients.messageId],
		references: [messages.id]
	}),
}));

export const messageThreadsRelations = relations(messageThreads, ({one}) => ({
	message_messageId: one(messages, {
		fields: [messageThreads.messageId],
		references: [messages.id],
		relationName: "messageThreads_messageId_messages_id"
	}),
	message_parentMessageId: one(messages, {
		fields: [messageThreads.parentMessageId],
		references: [messages.id],
		relationName: "messageThreads_parentMessageId_messages_id"
	}),
	message_rootMessageId: one(messages, {
		fields: [messageThreads.rootMessageId],
		references: [messages.id],
		relationName: "messageThreads_rootMessageId_messages_id"
	}),
}));

export const conversationsRelations = relations(conversations, ({many}) => ({
	messages: many(messages),
	conversationParticipants: many(conversationParticipants),
}));

export const workLogsRelations = relations(workLogs, ({one}) => ({
	user_approvedBy: one(users, {
		fields: [workLogs.approvedBy],
		references: [users.id],
		relationName: "workLogs_approvedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [workLogs.userId],
		references: [users.id],
		relationName: "workLogs_userId_users_id"
	}),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({one}) => ({
	conversation: one(conversations, {
		fields: [conversationParticipants.conversationId],
		references: [conversations.id]
	}),
}));