// models/Character.ts
import { Schema, model, models, Types } from "mongoose";
import "./Weapon";

export interface ICharacter {
  name: string;
  stage: string; // e.g., "Neo Egoist League", "Second Selection"
  image: string;
  description: string;

  team: string;
  mainPosition: string;
  secondaryPositions?: string[]; // Optional array

  ego: string;
  domFoot: string;
  height: number;

  // Grouped stats for better structure
  stats: {
    acceleration: number;
    topSpeed: number;
    shooting: number;
    passing: number;
    dribbling: number;
    jumping: number;
    strength: number;
    vision: number;
    defending: number;
    stamina: number;
    goalkeeping: number;
  };
  
  // Reference to the Weapon model
  primaryWeapon: Types.ObjectId; 
  secondaryWeapons?: Types.ObjectId[]; // Optional array
}

const CharacterSchema = new Schema<ICharacter>({
  name: { type: String, required: true },
  stage: { type: String, required: true },

  image: { type: String, required: true },
  description: { type: String, required: true },

  team: { type: String, required: true },
  mainPosition: { type: String, required: true },
  
  // FIX 1: Defined as an array of strings, not required
  secondaryPositions: [{ type: String }],

  ego: { type: String, required: true },

  domFoot: { type: String, required: true },
  height: { type: Number, required: true },

  // FIX 2: Grouped stats inside a nested object
  stats: {
    acceleration: { type: Number, required: true },
    topSpeed: { type: Number, required: true },
    shooting: { type: Number, required: true },
    passing: { type: Number, required: true },
    dribbling: { type: Number, required: true },
    jumping: { type: Number, required: true },
    strength: { type: Number, required: true },
    vision: { type: Number, required: true },
    defending: { type: Number, required: true },
    stamina: { type: Number, required: true },
    goalkeeping: { type: Number, required: true },
  },

  // Reference single weapon ID
  primaryWeapon: { 
    type: Schema.Types.ObjectId, 
    ref: "Weapon", 
    required: true 
  },
  
  // Reference array of weapon IDs
  secondaryWeapons: [{ 
    type: Schema.Types.ObjectId, 
    ref: "Weapon" 
  }],
});

export const Character = models.Character || model<ICharacter>("Character", CharacterSchema);