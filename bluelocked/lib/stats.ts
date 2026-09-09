// lib/stats.ts
import { ICharacter } from "@/models/Character";
import { IWeapon } from "@/models/Weapon";

// TypeScript helper to represent the resulting buffed stats
export type BuffedStats = ICharacter["stats"];

/**
 * Calculates a character's total stats after applying multipliers
 * from their primary and secondary weapons.
 */
export function calculateBuffedStats(
  character: ICharacter,
  activeWeapons: IWeapon[] = []
): BuffedStats {
  // Start with a clone of the base stats
  const finalStats: BuffedStats = { ...character.stats };

  // Loop through every weapon passed to the function
  for (const weapon of activeWeapons) {
    if (!weapon.effects) continue;

    // Loop through every effect on this weapon
    for (const effect of weapon.effects) {
      const statKey = effect.stat; // e.g., "shooting" or "vision"

      // Check if this stat exists on the character
      if (statKey in finalStats) {
        // THIS IS WHERE THE MATH HAPPENS:
        // Multiply current value by the weapon's multiplier
        finalStats[statKey] = Math.round(finalStats[statKey] * effect.multiplier);
      }
    }
  }

  return finalStats;
}