// src/db/index.ts

import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Prevent multiple connection pools in development due to Next.js HMR (Hot Module Replacement)
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Recommended pool settings for transaction-heavy workloads
    max: 10,                   // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Return an error after 5s if connection cannot be established
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

// Instantiate Drizzle ORM with schema attached for full auto-complete
export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });
export { pool };