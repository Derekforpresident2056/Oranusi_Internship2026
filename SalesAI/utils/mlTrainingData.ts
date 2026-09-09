// utils/mlTrainingData.ts
import { tokenizeAndExtractFeatures, SpatialWord } from './mlPreprocess';
import { LABEL_MAP, NUM_CLASSES } from './mlModel';

export interface ItemTarget {
  sku: string;
  quantity: number;
}

export interface TrainingSample {
  xs: number[][];
  ys: number[][];
}

export function generateTrainingSample(
  rawText: string, 
  knownInvoiceNum: string, 
  knownTotal: number, 
  knownItems: ItemTarget[], 
  maxSequenceLength = 150
): TrainingSample {
  const lines = rawText.split('\n').filter(l => l.trim().length > 0);
  const spatialWords: SpatialWord[] = [];

  const pageWidth = 1000;
  const pageHeight = 1400;

  // Realistic document row/column mapping
  lines.forEach((line, lineIdx) => {
    const words = line.trim().split(/\s+/);
    const lineY = Math.min((lineIdx + 1) * 35 + 40, pageHeight - 50);

    words.forEach((word, wordIdx) => {
      const lineX = Math.min((wordIdx + 1) * 70 + 30, pageWidth - 80);
      spatialWords.push({
        text: word,
        bbox: {
          x0: lineX,
          y0: lineY,
          x1: lineX + Math.min(word.length * 10, 80),
          y1: lineY + 20
        }
      });
    });
  });

  const tokenFeatures = tokenizeAndExtractFeatures(
    spatialWords, 
    pageWidth, 
    pageHeight, 
    maxSequenceLength
  );
  
  const xs = tokenFeatures.map(t => t.features);
  
  const cleanSkus = knownItems.map(item => item.sku.toLowerCase().replace(/[^a-z0-9.-]/g, ""));
  const cleanQuantities = knownItems.map(item => item.quantity);

  const ys = tokenFeatures.map(token => {
    const oneHot = new Array(NUM_CLASSES).fill(0);
    oneHot[LABEL_MAP.NOISE] = 1;

    if (token.word === "[PAD]") return oneHot;

    const normalWord = token.word.toLowerCase().replace(/[^a-z0-9.-]/g, "");
    const normalInvoiceTarget = knownInvoiceNum.toLowerCase().replace(/[^a-z0-9.-]/g, "");

    // 1. Invoice Number Match
    if (normalWord !== "" && (normalWord === normalInvoiceTarget || normalInvoiceTarget.includes(normalWord))) {
      const vec = new Array(NUM_CLASSES).fill(0);
      vec[LABEL_MAP.INV_NUM] = 1;
      return vec;
    } 
    
    // 2. Total Amount Match
    const numericWordValue = parseFloat(token.word.replace(/[^0-9.]/g, ""));
    if (!isNaN(numericWordValue) && numericWordValue === knownTotal) {
      const vec = new Array(NUM_CLASSES).fill(0);
      vec[LABEL_MAP.TOTAL] = 1;
      return vec;
    }

    // 3. SKU Match
    if (cleanSkus.some(sku => sku !== "" && (normalWord === sku || normalWord.includes(sku)))) {
      const vec = new Array(NUM_CLASSES).fill(0);
      vec[LABEL_MAP.SKU] = 1;
      return vec;
    }

    // 4. Quantity Match
    if (!isNaN(numericWordValue) && cleanQuantities.includes(numericWordValue)) {
      const vec = new Array(NUM_CLASSES).fill(0);
      vec[LABEL_MAP.QUANTITY] = 1;
      return vec;
    }

    return oneHot;
  });

  return { xs, ys };
}