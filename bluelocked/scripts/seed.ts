// scripts/seed.ts
import mongoose from "mongoose";
import * as dotenv from "dotenv";

import { Weapon } from "../models/Weapon";
import { Character } from "../models/Character";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

async function seedDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ Connected successfully!");

    await Weapon.deleteMany({});
    await Character.deleteMany({});
    console.log("🧹 Cleared old weapons and characters.");

    console.log("⚔️ Creating Weapons...");
    
    const metavision = await Weapon.create({
      name: "Metavision",
      description: "Constantly collects information from all around the field to predict the future of play.",
      effects: [
        { stat: "vision", multiplier: 2.5 },
        { stat: "passing", multiplier: 1.5 },
        { stat: "shooting", multiplier: 1.5 },
      ],
      cooldownSeconds: 60,
      buffType: "Field Perception",
    });

    const directShot = await Weapon.create({
      name: "Direct Shot",
      description: "A flawless volley kick executed without trapping the ball.",
      effects: [
        { stat: "shooting", multiplier: 1.5 },
      ],
      cooldownSeconds: 10,
      buffType: "Finishing Rate",
    });

    const monstrance = await Weapon.create({
      name: "Monstrance",
      description: "Instinctive 1v1 dribbling guided by the internal monster.",
      effects: [
        { stat: "dribbling", multiplier: 1.5 },
      ],
      cooldownSeconds: 5,
      buffType: "Agility",
    });

    const ambidextrousShot = await Weapon.create({
      name: "Ambidextrous Mid-Range Shot",
      description: "Overwhelming physical power driving precise shots with either leg.",
      effects: [
        { stat: "shooting", multiplier: 1.75 },
        { stat: "strength", multiplier: 1.75 },
      ],
      cooldownSeconds: 15,
      buffType: "Power Shot",
    });

    const speedRoar = await Weapon.create({
      name: "Roar Through the World",
      description: "Tear down the flanks in a blitz of breakneck speed.",
      effects: [
        { stat: "topSpeed", multiplier: 1.75 },
        { stat: "acceleration", multiplier: 1.5 },
        { stat: "strength", multiplier: 1.25 },
      ],
      cooldownSeconds: 60,
      buffType: "Speed",
    });

    const pantherSnipe = await Weapon.create({
      name: "44° Panther Snipe",
      description: "Find the golden zone, and unleash a shot with vicious precision.",
      effects: [
        { stat: "shooting", multiplier: 2.0 },
      ],
      cooldownSeconds: 10,
      buffType: "Shooting Precision",
    });

    console.log("✅ Weapons created!");

    console.log("⚽ Creating Blue Lock Characters...");

    await Character.create([
      {
        name: "Yoichi Isagi",
        stage: "Neo Egoist League",
        image: "/images/isagi.png",
        description: "A striker who relies on spatial awareness and direct shot execution to score goals.",
        team: "Bastard München",
        mainPosition: "CAM",
        secondaryPositions: ["ST", "RW"],
        ego: "Wholistic-Freedom",
        domFoot: "Right",
        height: 175,
        stats: {
          acceleration: 78,
          topSpeed: 79,
          shooting: 85,
          passing: 80,
          dribbling: 72,
          jumping: 74,
          strength: 71,
          vision: 96,
          defending: 68,
          stamina: 85,
          goalkeeping: 10,
        },
        primaryWeapon: metavision._id,
        secondaryWeapons: [directShot._id],
      },
      {
        name: "Meguru Bachira",
        stage: "Neo Egoist League",
        image: "/images/bachira.png",
        description: "An instinctive dribbler guided by the monster inside him to dismantle defenses.",
        team: "FC Barcha",
        mainPosition: "ST",
        secondaryPositions: ["LW", "RW"],
        ego: "Individualistic-Freedom",
        domFoot: "Right",
        height: 176,
        stats: {
          acceleration: 86,
          topSpeed: 84,
          shooting: 79,
          passing: 83,
          dribbling: 95,
          jumping: 73,
          strength: 69,
          vision: 85,
          defending: 60,
          stamina: 82,
          goalkeeping: 35,
        },
        primaryWeapon: monstrance._id,
        secondaryWeapons: [],
      },
      {
        name: "Rensuke Kunigami",
        stage: "Neo Egoist League",
        image: "/images/kunigami.png",
        description: "A powerful, physically-imposing striker. The sole survivor of the Wild Card program.",
        team: "Bastard München",
        mainPosition: "ST",
        secondaryPositions: ["CDM"],
        ego: "Individualistic-Restriction",
        domFoot: "Left",
        height: 186,
        stats: {
          acceleration: 85,
          topSpeed: 85,
          shooting: 95,
          passing: 70,
          dribbling: 75,
          jumping: 90,
          strength: 95,
          vision: 75,
          defending: 80,
          stamina: 90,
          goalkeeping: 10,
        },
        primaryWeapon: ambidextrousShot._id,
        secondaryWeapons: [],
      },
      {
        name: "Hyoma Chigiri",
        stage: "Neo Egoist League",
        image: "/images/chigiri.png",
        description: "Unbeatable in a long sprint, Chigiri is Blue Lock's red panther.",
        team: "Manshine City",
        mainPosition: "LW",
        secondaryPositions: ["RB", "RW", "LB"],
        ego: "Individualistic-Freedom",
        domFoot: "Right",
        height: 176,
        stats: {
          acceleration: 89,
          topSpeed: 95,
          shooting: 84,
          passing: 83,
          dribbling: 84,
          jumping: 69,
          strength: 50,
          vision: 79,
          defending: 83,
          stamina: 80,
          goalkeeping: 35,
        },
        primaryWeapon: speedRoar._id,
        secondaryWeapons: [pantherSnipe._id],
      },
    ]);

    console.log("✅ Characters successfully seeded and linked!");

    await mongoose.disconnect();
    console.log("👋 Connection closed. Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();