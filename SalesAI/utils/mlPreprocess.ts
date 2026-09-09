// utils/mlPreprocess.ts

const KEYWORD_VOCAB: Record<string, number> = {
  invoice: 1, no: 2, number: 3, manifest: 4, id: 5, total: 6, 
  due: 7, balance: 8, date: 9, issued: 10, sku: 11, part: 12,
  qty: 13, quantity: 14, price: 15, vendor: 16
};

// utils/mlPreprocess.ts

export interface SpatialWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

// Simple deterministic hash for text strings to give the ML model textual character signals
function hashString(str: string): number {
  let hash = 0;
  const clean = str.toLowerCase().trim();
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000.0; // Normalized between 0.0 and 1.0
}

export function extractTokenFeatures(
  wordObj: SpatialWord,
  pageWidth: number,
  pageHeight: number
): number[] {
  const text = wordObj.text || "";
  const lower = text.toLowerCase();
  const cleanNum = text.replace(/[^0-9.]/g, "");

  // 1. Textual Anchor Keywords
  let vocabCode = 0.0;
  if (lower.includes("inv") || lower.includes("invoice") || lower.includes("no:")) vocabCode = 0.2;
  else if (lower.includes("total") || lower.includes("due") || lower.includes("subtotal")) vocabCode = 0.4;
  else if (lower.includes("sku") || lower.includes("part") || lower.includes("item")) vocabCode = 0.6;
  else if (lower.includes("qty") || lower.includes("quantity")) vocabCode = 0.8;

  // 2. Character / Pattern Identifiers
  const isNumeric = /^[0-9]+(\.[0-9]+)?$/.test(text.trim()) ? 1.0 : 0.0; // 1.0 for "100" or "2409.88", 0.0 for "INV-2026"
  const containsDash = text.includes("-") || text.includes("/") ? 1.0 : 0.0;
  const wordLength = Math.min(text.length / 20, 1.0);
  const textHash = hashString(text); // 👈 String identity feature

  // 3. Spatial Geometry (Normalized 0.0 to 1.0)
  const safeW = pageWidth || 1000;
  const safeH = pageHeight || 1400;
  const normX = Math.min(Math.max((wordObj.bbox?.x0 || 0) / safeW, 0), 1);
  const normY = Math.min(Math.max((wordObj.bbox?.y0 || 0) / safeH, 0), 1);

  return [vocabCode, isNumeric, containsDash, wordLength, textHash, normX, normY];
}

export function tokenizeAndExtractFeatures(
  words: SpatialWord[],
  pageWidth = 1000,
  pageHeight = 1400,
  maxSequenceLength = 150
) {
  const features = words.slice(0, maxSequenceLength).map(w => ({
    word: w.text,
    features: extractTokenFeatures(w, pageWidth, pageHeight)
  }));

  // Pad remaining slots
  while (features.length < maxSequenceLength) {
    features.push({
      word: "[PAD]",
      features: [0, 0, 0, 0, 0, 0, 0]
    });
  }

  return features;
}