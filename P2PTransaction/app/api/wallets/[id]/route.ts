// app/api/wallets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getWalletDetails } from '@/services/walletService';
import { z } from 'zod';

const paramSchema = z.string().uuid({ message: 'Invalid wallet UUID format' });

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 1. Type params as a Promise
) {
  try {
    // 2. Await the params Promise
    const resolvedParams = await params;
    const walletId = resolvedParams.id;

    // Validate UUID format
    const validation = paramSchema.safeParse(walletId);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid wallet ID parameter' },
        { status: 400 }
      );
    }

    // Query wallet details & calculated balance
    const walletData = await getWalletDetails(walletId);

    return NextResponse.json({ success: true, data: walletData }, { status: 200 });

  } catch (error: any) {
    console.error('[GET_WALLET_ERROR]:', error);

    if (error.message === 'Wallet not found') {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Internal server error while fetching wallet details' },
      { status: 500 }
    );
  }
}