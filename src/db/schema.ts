import { InferInsertModel } from "drizzle-orm";
import {integer, jsonb, pgEnum, pgTable, serial, text, timestamp, varchar} from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from 'uuid';

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    userId: varchar('user_id', {length: 256}).notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email"),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    trialRequests: integer("trial_requests").default(0).notNull(),
});

export const title_ai_texts = pgTable('title_ai_texts', {
    id: serial('id').primaryKey(),
    english: varchar("english").notNull(),
    russian: varchar("russian").notNull(), 
    chinese: varchar("chinese").notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type NewText = InferInsertModel<typeof title_ai_texts>;

export const userSystemEnum = pgEnum('user_system_enum', ["system", "user"]);

export const chats = pgTable('chats', {
    id: varchar('id', { length: 36 }).primaryKey().default(uuidv4()),
    userId: varchar('user_id', {length: 256}).notNull(),
    content: text('content').notNull(),
    model: varchar('model').notNull(),
    source: varchar('source').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type DrizzleChat = typeof chats.$inferSelect;

export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    chatId: varchar('chat_id', { length: 36 }).references(() => chats.id),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    role: userSystemEnum('role').notNull()
});

export const searchResults = pgTable('search_results', {
    id: varchar('id', { length: 36 }).primaryKey().default(uuidv4()),
    chatId: varchar('chat_id', { length: 36 }).references(() => chats.id),
    searchResult: jsonb('search_result').notNull(),
});

export const htmlContents = pgTable('html_contents', {
    id: varchar('id', { length: 36 }).primaryKey().default(uuidv4()),
    searchResultId: varchar('search_result_id', { length: 36 }).references(() => searchResults.id),
    htmlSource: text('html_source').notNull(),
});

export const vectorizedContents = pgTable('vectorized_contents', {
    id: varchar('id', { length: 36 }).primaryKey().default(uuidv4()),
    htmlContentId: varchar('html_content_id', { length: 36 }).references(() => htmlContents.id),
    vectorStore: jsonb('vector_store').notNull(),
});

export const followUpQuestions = pgTable('follow_up_questions', {
    id: varchar('id', { length: 36 }).primaryKey().default(uuidv4()),
    chatId: varchar('chat_id', { length: 36 }).references(() => chats.id),
    originalQuery: text('original_query').notNull(),
    followUpQuestions: jsonb('follow_up_questions').notNull(),
});