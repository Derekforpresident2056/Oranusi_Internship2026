// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, wallets } from '@/db/schema';
import { z } from 'zod';

// Input Validation Schema for Signup
const createUserSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email } = validation.data;

    // ATOMIC SIGNUP: Create User AND provision their initial Wallet in one transaction
    const newUserAndWallet = await db.transaction(async (tx) => {
      // 1. Insert User
      const [newUser] = await tx
        .insert(users)
        .values({ fullName, email })
        .returning();

      // 2. Automatically create an empty NGN Wallet for the new user
      const [newWallet] = await tx
        .insert(wallets)
        .values({
          userId: newUser.id,
          currency: 'NGN',
        })
        .returning();

      return { user: newUser, wallet: newWallet };
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        data: newUserAndWallet,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('[SIGNUP_ERROR]:', error);

    // Handle duplicate email unique constraint error from Postgres
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during user creation' },
      { status: 500 }
    );
  }
}