// Schema adapter to map between local app expectations and Supabase actual schema
// This allows the app to work with existing Supabase data without losing anything

import { pgTable, pgView } from "drizzle-orm/pg-core";
import * as supabaseSchema from "./schema-supabase";

// Re-export all tables from Supabase schema
export * from "./schema-supabase";

// Create aliases for tables with different names
// The app expects 'sandwichCollections' but Supabase has 'collections'
export const sandwichCollections = supabaseSchema.collections;

// If there's also a sandwich_collections table, use that for backward compatibility
export const sandwichCollectionsLegacy = supabaseSchema.sandwichCollections;

// Map other mismatched table names
export const projectTasks = supabaseSchema.tasks || supabaseSchema.projectTasks;
export const auditLogs = supabaseSchema.auditLogs || pgTable("audit_logs", {}); // Placeholder if doesn't exist

// For tables that don't exist in Supabase, create placeholders
// These will need to be created in Supabase if the features are used
export const archivedProjects = supabaseSchema.archivedProjects || pgTable("archived_projects", {});
export const chatMessages = supabaseSchema.chatMessages || pgTable("chat_messages", {});
export const chatMessageReads = supabaseSchema.chatMessageReads || pgTable("chat_message_reads", {});
export const chatMessageLikes = supabaseSchema.chatMessageLikes || pgTable("chat_message_likes", {});
export const userActivityLogs = supabaseSchema.userActivityLogs || pgTable("user_activity_logs", {});
export const messageLikes = supabaseSchema.messageLikes || pgTable("message_likes", {});

// Helper function to determine which collections table to use
export function getCollectionsTable() {
  // Use the 'collections' table as it has better data types
  return supabaseSchema.collections;
}

// Helper to handle the group collections data structure difference
export function adaptGroupCollections(data: any) {
  if (data.groupCollections && typeof data.groupCollections === 'string') {
    try {
      return JSON.parse(data.groupCollections);
    } catch {
      return [];
    }
  }
  return data.groupCollections || [];
}

// Helper to convert between local and Supabase formats
export function toSupabaseFormat(localData: any, tableName: string) {
  if (tableName === 'sandwich_collections' || tableName === 'collections') {
    return {
      ...localData,
      collectionDate: localData.collectionDate,
      hostName: localData.hostName,
      individualSandwiches: localData.individualSandwiches || 0,
      groupCollections: localData.group1Name || localData.group2Name ? [
        { name: localData.group1Name, count: localData.group1Count },
        { name: localData.group2Name, count: localData.group2Count }
      ].filter(g => g.name) : localData.groupCollections || [],
      submittedAt: localData.submittedAt || new Date().toISOString()
    };
  }
  return localData;
}

export function fromSupabaseFormat(supabaseData: any, tableName: string) {
  if (tableName === 'collections' || tableName === 'sandwich_collections') {
    const groups = adaptGroupCollections(supabaseData);
    return {
      ...supabaseData,
      group1Name: groups[0]?.name || '',
      group1Count: groups[0]?.count || 0,
      group2Name: groups[1]?.name || '',
      group2Count: groups[1]?.count || 0,
    };
  }
  return supabaseData;
}