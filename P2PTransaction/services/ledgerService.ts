// services/ledgerService.ts
import { db } from '@/db';
import { ledgerEntries, wallets, users } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export interface AuditLogGroup {
  journalId: string;
  createdAt: Date;
  isBalanced: boolean;
  totalDebitsKobo: number;
  totalCreditsKobo: number;
  entries: {
    entryId: string;
    walletId: string;
    type: 'DEBIT' | 'CREDIT';
    amountInKobo: number;
    user: {
      fullName: string;
      email: string;
    };
  }[];
}

export async function getLedgerAuditLog(limit = 20): Promise<AuditLogGroup[]> {
  // 1. Fetch recent ledger entries with wallet and user context
  const rawEntries = await db
    .select({
      entryId: ledgerEntries.id,
      journalId: ledgerEntries.journalId,
      type: ledgerEntries.type,
      amount: ledgerEntries.amount,
      createdAt: ledgerEntries.createdAt,
      walletId: wallets.id,
      user: {
        fullName: users.fullName,
        email: users.email,
      },
    })
    .from(ledgerEntries)
    .innerJoin(wallets, eq(ledgerEntries.walletId, wallets.id))
    .innerJoin(users, eq(wallets.userId, users.id))
    .orderBy(desc(ledgerEntries.createdAt))
    .limit(limit * 2); // Fetch enough raw legs to form groups

  // 2. Group entries by journalId
  const groupedJournals = new Map<string, AuditLogGroup>();

  for (const entry of rawEntries) {
    if (!groupedJournals.has(entry.journalId)) {
      groupedJournals.set(entry.journalId, {
        journalId: entry.journalId,
        createdAt: entry.createdAt,
        isBalanced: false,
        totalDebitsKobo: 0,
        totalCreditsKobo: 0,
        entries: [],
      });
    }

    const journal = groupedJournals.get(entry.journalId)!;

    journal.entries.push({
      entryId: entry.entryId,
      walletId: entry.walletId,
      type: entry.type,
      amountInKobo: entry.amount,
      user: entry.user,
    });

    if (entry.type === 'DEBIT') {
      journal.totalDebitsKobo += entry.amount;
    } else {
      journal.totalCreditsKobo += entry.amount;
    }

    // Double-entry check: Credits must equal Debits
    journal.isBalanced = journal.totalDebitsKobo === journal.totalCreditsKobo;
  }

  return Array.from(groupedJournals.values()).slice(0, limit);
}