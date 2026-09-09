// src/services/transferService.ts
import { db } from '@/db';
import { wallets, ledgerEntries, idempotencyKeys } from '@/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';

interface TransferInput {
  senderWalletId: string;
  recipientWalletId: string;
  amountInKobo: number; // e.g., 500000 for ₦5,000
  idempotencyKey: string;
}

export async function executeTransfer({
  senderWalletId,
  recipientWalletId,
  amountInKobo,
  idempotencyKey,
}: TransferInput) {
  if (senderWalletId === recipientWalletId) {
    throw new Error('Cannot transfer funds to the same wallet.');
  }

  if (amountInKobo <= 0) {
    throw new Error('Transfer amount must be strictly greater than 0.');
  }

  // 1. DETERMINISTIC LOCK ORDERING: Sort UUIDs alphabetically to avoid deadlocks
  const sortedWalletIds = [senderWalletId, recipientWalletId].sort();

  return await db.transaction(async (tx) => {
    // 2. CHECK IDEMPOTENCY KEY INSIDE TRANSACTION
    // ------------------------------------------------------------------
    // STEP 1: IDEMPOTENCY CHECK
    // ------------------------------------------------------------------
    const existingKey = await tx
      .select()
      .from(idempotencyKeys)
      .where(eq(idempotencyKeys.key, idempotencyKey))
      .limit(1);

    if (existingKey.length > 0) {
      const record = existingKey[0];

      // CASE A: Transaction was already completed earlier
      // Return saved response instantly WITHOUT debiting/crediting again!
      if (record.status === 'COMPLETED') {
        return {
          cached: true,
          status: record.responseCode,
          body: record.responseBody,
        };
      }
      // CASE B: Request with this key is currently executing right now
      // Reject to prevent race conditions!
      if (record.status === 'PROCESSING') {
        throw new Error('409: Request with this idempotency key is already processing.');
      }
    }

    // Mark idempotency key as PROCESSING
    // ------------------------------------------------------------------
    // STEP 2: RESERVE THE KEY (Mark as PROCESSING)
    // ------------------------------------------------------------------
    await tx.insert(idempotencyKeys).values({
      key: idempotencyKey,
      requestPath: '/api/v1/transfers',
      status: 'PROCESSING',
    });

    // 3. EXPLICIT ROW LOCKING (`FOR UPDATE`)
    // Fetch and lock both wallet rows in sorted order
    const lockedWallets = await tx
      .select()
      .from(wallets)
      .where(inArray(wallets.id, sortedWalletIds))
      .for('update'); // <--- CRITICAL: Row-level lock

    if (lockedWallets.length !== 2) {
      throw new Error('One or both specified wallets do not exist.');
    }

    // 4. CALCULATE SENDER BALANCE
    // Sum all prior DEBIT and CREDIT entries for sender from immutable ledger
    const balanceResult = await tx
      .select({
        balance: sql<number>`
          COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END), 0)
        `,
      })
      .from(ledgerEntries)
      .where(eq(ledgerEntries.walletId, senderWalletId));

    const senderBalance = Number(balanceResult[0]?.balance || 0);

    if (senderBalance < amountInKobo) {
      throw new Error('Insufficient funds.');
    }

    // 5. ATOMIC DOUBLE-ENTRY WRITES
    const journalId = crypto.randomUUID();

    // Insert DEBIT for Sender
    await tx.insert(ledgerEntries).values({
      journalId,
      walletId: senderWalletId,
      type: 'DEBIT',
      amount: amountInKobo,
    });

    // Insert CREDIT for Recipient
    await tx.insert(ledgerEntries).values({
      journalId,
      walletId: recipientWalletId,
      type: 'CREDIT',
      amount: amountInKobo,
    });

    // 6. UPDATE IDEMPOTENCY KEY STATUS TO COMPLETED
    const responsePayload = {
      success: true,
      journalId,
      amountTransferred: amountInKobo,
      senderWalletId,
      recipientWalletId,
    };


    // ------------------------------------------------------------------
    // STEP 3: CACHE THE RESULT & MARK AS COMPLETED
    // ------------------------------------------------------------------
    await tx
      .update(idempotencyKeys)
      .set({
        status: 'COMPLETED',
        responseCode: 200,
        responseBody: responsePayload,
      })
      .where(eq(idempotencyKeys.key, idempotencyKey));

    return {
      cached: false,
      status: 200,
      body: responsePayload,
    };
  });
}