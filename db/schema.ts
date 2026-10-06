import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const items = sqliteTable('items',{ id:text('id').primaryKey(), data:text('data').notNull(), version:integer('version').notNull().default(1) });
