// app/api/ledger/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getLedgerAuditLog } from '@/services/ledgerService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 20;

    const auditData = await getLedgerAuditLog(limit);

    return NextResponse.json({
      success: true,
      totalJournals: auditData.length,
      data: auditData,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[LEDGER_AUDIT_ERROR]:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching ledger audit logs' },
      { status: 500 }
    );
  }
}