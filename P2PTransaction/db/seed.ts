// db/seed.ts
import { config } from 'dotenv';
config({ path: '.env.local' });

import { db, pool } from './index';
import { users, wallets, ledgerEntries, idempotencyKeys } from './schema';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Clean existing records (in reverse order of foreign key dependencies)
    console.log('🧹 Cleaning existing tables...');
    await db.delete(idempotencyKeys);
    await db.delete(ledgerEntries);
    await db.delete(wallets);
    await db.delete(users);

    // 2. Create Test Users (Alice & Bob)
    console.log('👤 Creating test users...');
    const [alice] = await db
      .insert(users)
      .values({
        fullName: 'Alice Johnson',
        email: 'alice@example.com',
      })
      .returning();

    const [bob] = await db
      .insert(users)
      .values({
        fullName: 'Bob Smith',
        email: 'bob@example.com',
      })
      .returning();

    // 3. Provision NGN Wallets for both users
    console.log('💳 Provisioning wallets...');
    const [aliceWallet] = await db
      .insert(wallets)
      .values({
        userId: alice.id,
        currency: 'NGN',
      })
      .returning();

    const [bobWallet] = await db
      .insert(wallets)
      .values({
        userId: bob.id,
        currency: 'NGN',
      })
      .returning();

    // 4. Fund Alice's Wallet with initial ₦50,000 (5,000,000 kobo) via an initial CREDIT ledger entry
    console.log('💰 Depositing initial funds (₦50,000 into Alice\'s wallet)...');
    const depositJournalId = crypto.randomUUID();

    await db.insert(ledgerEntries).values({
      journalId: depositJournalId,
      walletId: aliceWallet.id,
      type: 'CREDIT',
      amount: 5000000, // ₦50,000 in kobo
    });

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📌 USE THESE TEST IDs FOR YOUR API REQUESTS:');
    console.log('--------------------------------------------------');
    console.log(`Alice User ID:   ${alice.id}`);
    console.log(`Alice Wallet ID: ${aliceWallet.id} (Initial Balance: ₦50,000)`);
    console.log(`Bob User ID:     ${bob.id}`);
    console.log(`Bob Wallet ID:   ${bobWallet.id} (Initial Balance: ₦0)`);
    console.log('--------------------------------------------------\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end(); // Close DB connection pool cleanly
  }
}

seed();