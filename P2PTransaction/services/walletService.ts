// services/walletService.ts
import { db } from '@/db';
import { wallets, ledgerEntries, users } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';

export async function getWalletDetails(walletId: string) {
  // 1. Fetch wallet info along with the owner user details
  const walletResult = await db
    .select({
      walletId: wallets.id,
      currency: wallets.currency,
      createdAt: wallets.createdAt,
      user: {
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      },
    })
    .from(wallets)
    .innerJoin(users, eq(wallets.userId, users.id))
    .where(eq(wallets.id, walletId))
    .limit(1);

  if (walletResult.length === 0) {
    throw new Error('Wallet not found');
  }

  const wallet = walletResult[0];

  // 2. Sum the Ledger Entries to compute live balance in kobo
  const balanceResult = await db
    .select({
      balanceInKobo: sql<number>`
        COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END), 0)
      `,
    })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.walletId, walletId));

  const balanceInKobo = Number(balanceResult[0]?.balanceInKobo || 0);

  // 3. Fetch recent transaction history for this wallet
  const recentTransactions = await db
    .select({
      id: ledgerEntries.id,
      journalId: ledgerEntries.journalId,
      type: ledgerEntries.type,
      amountInKobo: ledgerEntries.amount,
      createdAt: ledgerEntries.createdAt,
    })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.walletId, walletId))
    .orderBy(desc(ledgerEntries.createdAt))
    .limit(10);

  // 4. Return clean formatted response (including balance converted to Main Unit e.g., Naira)
  return {
    walletId: wallet.walletId,
    currency: wallet.currency,
    balanceInKobo,
    balanceFormatted: `₦${(balanceInKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
    owner: wallet.user,
    recentTransactions,
  };
}