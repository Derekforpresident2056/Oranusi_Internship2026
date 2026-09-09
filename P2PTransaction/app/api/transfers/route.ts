// app/api/transfers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeTransfer } from '@/services/transferService'; // Ensure this matches your file path

// 1. Zod Schema for Request Body Validation
const transferSchema = z.object({
  senderWalletId: z.string().uuid({ message: 'Invalid sender wallet UUID' }),
  recipientWalletId: z.string().uuid({ message: 'Invalid recipient wallet UUID' }),
  amountInKobo: z.number().int().positive({ message: 'Amount must be a positive integer in kobo' }),
});

export async function POST(req: NextRequest) {
  try {
    // 2. Extract Idempotency Key from Headers
    const idempotencyKey = req.headers.get('x-idempotency-key');

    if (!idempotencyKey || idempotencyKey.trim() === '') {
      return NextResponse.json(
        { error: 'Missing required header: X-Idempotency-Key' },
        { status: 400 }
      );
    }

    // 3. Parse and Validate Body Payload
    const body = await req.json();
    const validation = transferSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { senderWalletId, recipientWalletId, amountInKobo } = validation.data;

    // 4. Call Core Transfer Engine
    const result = await executeTransfer({
      senderWalletId,
      recipientWalletId,
      amountInKobo,
      idempotencyKey,
    });

    // 5. Return Response (Cache hit vs fresh transaction)
    return NextResponse.json(result.body, { status: result.status ?? 200 });

  } catch (error: any) {
    console.error('[TRANSFER_API_ERROR]:', error);

    // Extract underlying Postgres cause if wrapped by Drizzle/Node
    const pgCode = error.code || error.cause?.code;
    const errorMessage = error.message || error.cause?.message || '';

    // 1. CATCH 409 CONFLICTS (Postgres Unique Constraint '23505' or custom '409:')
    if (pgCode === '23505' || errorMessage.includes('409:')) {
      return NextResponse.json(
        { error: 'Conflict: Request with this idempotency key is currently processing or already exists.' },
        { status: 409 }
      );
    }

    // 2. CATCH BUSINESS LOGIC ERRORS (400 Bad Request)
    if (
      errorMessage.includes('Insufficient funds') ||
      errorMessage.includes('do not exist') ||
      errorMessage.includes('same wallet') ||
      errorMessage.includes('greater than 0')
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // 3. FALLBACK CATCH-ALL (500 Server Error)
    return NextResponse.json(
      { error: 'Internal Server Error during ledger write' },
      { status: 500 }
    );
  }
}