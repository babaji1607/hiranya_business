import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  plan: text('plan').notNull().default('Free'),
  isActive: boolean('is_active').notNull().default(true),
  expiryDate: timestamp('expiry_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const licenses = pgTable('licenses', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  type: text('type').notNull().default('Monthly'),
  isActive: boolean('is_active').notNull().default(true),
  expiryDate: timestamp('expiry_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const devices = pgTable('devices', {
  id: serial('id').primaryKey(),
  deviceId: text('device_id').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  os: text('os'),
  hwid: text('hwid').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  lastSeen: timestamp('last_seen').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
