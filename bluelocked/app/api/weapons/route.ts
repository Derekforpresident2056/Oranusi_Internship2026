// app/api/weapons/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Weapon } from "@/models/Weapon";

export async function GET() {
  try {
    // 1. Connect to MongoDB
    await connectToDatabase();

    // 2. Fetch all weapons as plain JavaScript objects
    const weapons = await Weapon.find({}).lean();

    // 3. Format MongoDB _id ObjectIds into clean strings
    const formattedWeapons = weapons.map((doc: any) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    return NextResponse.json({ success: true, data: formattedWeapons });
  } catch (error: any) {
    console.error("Weapons API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}