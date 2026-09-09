// models/Weapon.ts
import { Schema, model, models } from "mongoose";

// Define valid stat names to keep TypeScript strict and prevent typos
export type StatName = 
  | "acceleration" | "topSpeed" | "shooting" | "passing" 
  | "dribbling" | "jumping" | "strength" | "vision" 
  | "defending" | "stamina" | "goalkeeping";

export interface IWeaponEffect {
  stat: StatName;
  multiplier: number;
}

export interface IWeapon {
  name: string;
  description: string;
  effects: IWeaponEffect[]; // Array of up to 3 effects: [{ stat: "vision", multiplier: 2.5 }, ...]
  cooldownSeconds?: number;
  buffType?: string;
}

const WeaponSchema = new Schema<IWeapon>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  
  effects: [
    {
      stat: { type: String, required: true },
      multiplier: { type: Number, required: true, default: 1.0 },
    },
  ],
  
  cooldownSeconds: { type: Number, default: 0 },
  buffType: { type: String },
});

export const Weapon = models.Weapon || model<IWeapon>("Weapon", WeaponSchema);