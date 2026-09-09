// db/schema.ts
import { 
  pgTable, 
  uuid, 
  varchar, 
  bigint, 
  timestamp, 
  jsonb, 
  pgEnum, 
  check, 
  index 
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const ledgerTypeEnum = pgEnum('ledger_type', ['DEBIT', 'CREDIT']);

// 1. Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Wallets Table (Foreign key references users.id)
export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  currency: varchar('currency', { length: 3 }).notNull().default('NGN'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Ledger Entries Table
export const ledgerEntries = pgTable(
  'ledger_entries',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    journalId: uuid('journal_id').notNull(),
    walletId: uuid('wallet_id').notNull().references(() => wallets.id),
    type: ledgerTypeEnum('type').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    check('positive_amount_check', sql`${table.amount} > 0`),
    index('wallet_idx').on(table.walletId),
    index('journal_idx').on(table.journalId),
  ]
);

// 4. Idempotency Keys Table
export const idempotencyKeys = pgTable('idempotency_keys', {
  key: varchar('key', { length: 255 }).primaryKey(),
  requestPath: varchar('request_path', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  responseCode: bigint('response_code', { mode: 'number' }),
  responseBody: jsonb('response_body'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});