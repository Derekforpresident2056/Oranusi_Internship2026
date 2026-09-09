// app/api/characters/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Character, ICharacter } from "@/models/Character"; // Implicitly registers Weapon too!
import { IWeapon } from "@/models/Weapon";
import { calculateBuffedStats } from "@/lib/stats";

export async function GET() {
  try {
    await connectToDatabase();

    // Query characters and populate weapons
    const rawCharacters = await Character.find({})
      .populate<{ primaryWeapon: IWeapon }>("primaryWeapon")
      .populate<{ secondaryWeapons: IWeapon[] }>("secondaryWeapons")
      .lean();

    // Format data and calculate stats
    const formattedData = rawCharacters.map((doc: any) => {
      const activeWeapons: IWeapon[] = [
        doc.primaryWeapon,
        ...(doc.secondaryWeapons || []),
      ].filter(Boolean);

      const buffedStats = calculateBuffedStats(doc as ICharacter, activeWeapons);

      return {
        _id: doc._id.toString(),
        name: doc.name,
        team: doc.team,
        stage: doc.stage,
        image: doc.image,
        ego: doc.ego,
        domFoot: doc.domFoot,
        height: doc.height,
        baseStats: doc.stats,
        buffedStats: buffedStats,
        primaryWeaponName: doc.primaryWeapon?.name,
        buffType: doc.primaryWeapon?.buffType,
      };
    });

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}