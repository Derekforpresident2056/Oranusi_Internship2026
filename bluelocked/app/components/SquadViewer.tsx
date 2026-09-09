"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Define the shape of data passed from the Server Page
export interface CharacterWithBuffs {
  _id: string;
  name: string;
  team: string;
  stage: string;
  image: string;
  ego: string;
  domFoot: string;
  height: number;
  baseStats: {
    shooting: number;
    vision: number;
    topSpeed: number;
    acceleration: number;
    dribbling: number;
    passing: number;
    jumping: number;
    strength: number;
    defending: number;
    stamina: number;
    goalkeeping: number;
  };
  buffedStats: {
    shooting: number;
    vision: number;
    topSpeed: number;
    acceleration: number;
    dribbling: number;
    passing: number;
    jumping: number;
    strength: number;
    defending: number;
    stamina: number;
    goalkeeping: number;
  };
  primaryWeaponName?: string;
  buffType?: string;
}

interface SquadViewerProps {
  characters: CharacterWithBuffs[];
}

export default function SquadViewer({ characters }: SquadViewerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeCharacter = characters.find((c) => c._id === selectedId);

  return (
    <main className="relative min-h-screen bg-[#070b19] text-white p-8 flex flex-col justify-center items-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. SQUAD GRID */}
      <motion.div
        animate={{ opacity: selectedId ? 0 : 1, scale: selectedId ? 0.95 : 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap justify-center gap-12 z-10 max-w-6xl py-12"
      >
        {characters.map((char) => (
          <motion.div
            key={char._id}
            layoutId={`card-container-${char._id}`}
            onClick={() => setSelectedId(char._id)}
            className="relative w-64 h-64 cursor-pointer group flex flex-col justify-end p-4 "
          >
            {/* 1. CLIPPED BACKGROUND (Shape applies ONLY to the card body) */}
            <div className="clip-bluelock-card absolute inset-0 bg-slate-900/80 border border-slate-700 group-hover:bg-slate-800/90 transition-colors" />

            {/* Pop-Out Image */}
            <motion.div
              layoutId={`image-${char._id}`}
              className="absolute -top-16 w-56 h-64 pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
            >
              <Image
                src={char.image}
                alt={char.name}
                fill
                className="object-contain group-hover:scale-125 transition-transform duration-300"
              />
            </motion.div>

            {/* Info Box */}
            <div className="text-center z-10 mb-2">
              <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">{char.team}</span>
              <h3 className="font-condexa tracking-widest text-3xl text-white">{char.name}</h3>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 2. OVERLAY MODAL */}
      <AnimatePresence>
        {activeCharacter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/70 backdrop-blur-md font-condexa">
            <div className="absolute inset-0" onClick={() => setSelectedId(null)} />

            <motion.div
              layoutId={`card-container-${activeCharacter._id}`}
              className="clip-bluelock-card relative w-full max-w-5xl h-[550px] bg-slate-900/90 border border-slate-700 p-12 flex justify-between items-center z-10 overflow-hidden shadow-2xl"
            >
              {/* Left Column: Details & Real-Time Stats */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="w-1/2 space-y-6 z-20"
              >
                <div>
                  <span className="text-blue-400 text-xl tracking-widest uppercase">
                    {activeCharacter.team} • {activeCharacter.stage}
                  </span>
                  <h2 className="text-6xl text-white uppercase tracking-widest">
                    {activeCharacter.name}
                  </h2>
                  <p className="text-slate-400 mt-1 text-xl tracking-widest">Ego: {activeCharacter.ego}</p>
                </div>

                {/* Stat Display (Base vs Buffed) */}
                <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-xl text-slate-400 tracking-wide">Shooting (Base / Buffed)</p>
                    <p className="text-2xl font-bold text-white tracking-widest">
                      {activeCharacter.baseStats.shooting}{" "}
                      <span className="text-blue-400">➔ {activeCharacter.buffedStats.shooting}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xl text-slate-400 tracking-wide">Vision (Base / Buffed)</p>
                    <p className="text-2xl font-bold text-white tracking-widest">
                      {activeCharacter.baseStats.vision}{" "}
                      <span className="text-blue-400">➔ {activeCharacter.buffedStats.vision}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedId(null)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500  tracking-wider text-xl rounded-lg transition-colors"
                >
                  ← Back to Squad
                </button>
              </motion.div>

              {/* Right Column: Dynamic Pop-out Image */}
              <motion.div
                layoutId={`image-${activeCharacter._id}`}
                className="absolute right-10 -bottom-10 w-[450px] h-[600px] pointer-events-none drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
              >
                <Image
                  src={activeCharacter.image}
                  alt={activeCharacter.name}
                  fill
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}