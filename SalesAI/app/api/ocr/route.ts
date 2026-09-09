import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import * as tf from '@tensorflow/tfjs';
import fs from 'fs';
import path from 'path';
import { tokenizeAndExtractFeatures } from '@/utils/mlPreprocess';
import { LABEL_MAP } from '@/utils/mlModel';
import { MongoClient } from 'mongodb';

async function loadLocalTrainedModel() {
  const dirPath = path.join(process.cwd(), 'models', 'invoice-parser');
  
  if (!fs.existsSync(path.join(dirPath, 'model.json'))) {
    throw new Error("Model binaries not found! Please optimize parse weights via the dashboard first.");
  }

  const modelJsonRaw = fs.readFileSync(path.join(dirPath, 'model.json'), 'utf8');
  const modelJson = JSON.parse(modelJsonRaw);
  const weightsBuffer = fs.readFileSync(path.join(dirPath, 'weights.bin'));

  return await tf.loadLayersModel({
    load: async () => {
      return {
        modelTopology: modelJson.modelTopology,
        weightSpecs: modelJson.weightsManifest[0].weights,
        weightData: weightsBuffer.buffer.slice(
          weightsBuffer.byteOffset,
          weightsBuffer.byteOffset + weightsBuffer.byteLength
        )
      };
    }
  });
}

export async function POST(request: NextRequest) {
  let worker: any = null;

  try {
    // 1. Ingestion & File Handling
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. OCR Pass
    const absoluteWorkerPath = path.join(
      process.cwd(),
      'node_modules',
      'tesseract.js',
      'src',
      'worker-script',
      'node',
      'index.js'
    );

    worker = await createWorker('eng', 1, {
      workerPath: absoluteWorkerPath,
    });

    const { data } = await worker.recognize(buffer);
    await worker.terminate();
    worker = null;

    // Standardize split hyphens in OCR text (e.g. "INV- 2026-889" -> "INV-2026-889")
    const rawText = (data.text || '').replace(/([A-Z0-9]+)-\s+([A-Z0-9]+)/gi, '$1-$2');

    if (!rawText.trim()) {
      return NextResponse.json({ error: 'OCR failed to extract readable text.' }, { status: 422 });
    }

    // 3. Spatial Token Grid Reconstruction
    const lines = rawText.split('\n').filter((l: string) => l.trim().length > 0);
    const spatialWords: Array<{ text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }> = [];
    
    const imageWidth = 1000;
    const imageHeight = Math.max(1400, lines.length * 45);

    lines.forEach((lineStr: string, lineIdx: number) => {
      const words = lineStr.trim().split(/\s+/);
      const rowY = (lineIdx + 1) * 40;

      let currentX = 50;
      words.forEach((word: string) => {
        if (!word) return;
        const wordWidth = Math.max(30, word.length * 12);

        spatialWords.push({
          text: word,
          bbox: {
            x0: currentX,
            y0: rowY,
            x1: currentX + wordWidth,
            y1: rowY + 25
          }
        });

        currentX += wordWidth + 20; // Column gap
      });
    });

    // 4. ML Preprocessing
    const maxSeqLen = 150;
    const tokenizedData = tokenizeAndExtractFeatures(spatialWords, imageWidth, imageHeight, maxSeqLen);
    const inputMatrix = tokenizedData.map(t => t.features);
    const inputTensor = tf.tensor3d([inputMatrix]);

    // 5. Inference
    const model = await loadLocalTrainedModel();
    let predictionArray: number[][][] = [];

    tf.engine().tidy(() => {
      const prediction = model.predict(inputTensor) as tf.Tensor;
      predictionArray = prediction.arraySync() as number[][][];
    });

    inputTensor.dispose();
    model.dispose();

    // 6. Extraction Buffers
    let extractedInvoiceNum = "UNKNOWN";
    let extractedTotal = 0;
    const extractedSkus: string[] = [];
    const mlQuantities: { [sku: string]: number } = {};

    const HEADER_LABELS = ["INVOICE", "INV", "NO", "NUMBER", "#", "BILL", "TO"];
    const TABLE_HEADERS = ["SKU", "DESCRIPTION", "QTY", "Qry", "UNIT", "PRICE", "TOTAL"];

    // 7. Process Machine Learning Predictions
    for (let i = 0; i < tokenizedData.length; i++) {
      const token = tokenizedData[i];
      if (token.word === "[PAD]") continue;

      const probs = predictionArray[0][i];
      const highestProbIdx = probs.indexOf(Math.max(...probs));
      const cleanUpper = token.word.toUpperCase().replace(/[:;,]/g, "").trim();

      // INVOICE NUMBER
      if (highestProbIdx === LABEL_MAP.INV_NUM || probs[LABEL_MAP.INV_NUM] > 0.3) {
        if (!HEADER_LABELS.includes(cleanUpper) && cleanUpper.length >= 3) {
          if (extractedInvoiceNum === "UNKNOWN") {
            extractedInvoiceNum = token.word.replace(/[:;,]/g, "").trim();
          }
        }
      } 
      // TOTAL AMOUNT
      else if (highestProbIdx === LABEL_MAP.TOTAL || probs[LABEL_MAP.TOTAL] > 0.3) {
        const parsed = parseFloat(token.word.replace(/[^0-9.]/g, ""));
        if (!isNaN(parsed) && parsed > extractedTotal) {
          extractedTotal = parsed;
        }
      }
      // SKU
      else if (highestProbIdx === LABEL_MAP.SKU || cleanUpper.startsWith("SKU-")) {
        if (!TABLE_HEADERS.includes(cleanUpper) && cleanUpper.length >= 3) {
          if (!extractedSkus.includes(cleanUpper)) {
            extractedSkus.push(cleanUpper);
          }
        }
      }
    }

    // 8. Deterministic Spatial Regex Fallbacks for Unclassified Tokens
    // Invoice Number Fallback
    if (extractedInvoiceNum === "UNKNOWN") {
      const invMatch = rawText.match(/(?:Invoice\s*No|INV\s*#?|INVOICE\s*:?)\s*[:#\s]*([A-Z0-9-]+)/i);
      if (invMatch && invMatch[1]) {
        extractedInvoiceNum = invMatch[1].trim();
      }
    }

    // SKU Regex Fallback (Catches line items like SKU-ABC, SKU-XYZ)
    const skuMatches = rawText.match(/\bSKU-[A-Z0-9]+\b/gi);
    if (skuMatches) {
      skuMatches.forEach(sku => {
        const clean = sku.toUpperCase().trim();
        if (!extractedSkus.includes(clean)) {
          extractedSkus.push(clean);
        }
      });
    }

    // Total Amount Fallback (Parses SUBTOTAL/TOTAL or largest dollar figure)
    if (extractedTotal === 0) {
      const totalMatch = rawText.match(/(?:TOTAL|SUBTOTAL)\s*[:$]*\s*([\d,]+\.\d{2})/i);
      if (totalMatch && totalMatch[1]) {
        extractedTotal = parseFloat(totalMatch[1].replace(/,/g, ''));
      } else {
        const dollarMatches = rawText.match(/\$\s*([\d,]+\.\d{2})/g);
        if (dollarMatches) {
          const vals = dollarMatches.map(m => parseFloat(m.replace(/[^0-9.]/g, ''))).filter(n => !isNaN(n));
          if (vals.length > 0) extractedTotal = Math.max(...vals);
        }
      }
    }

    // Line Item Quantities Extraction
    const detectedItems = extractedSkus.map((sku: string) => {
      let qty = mlQuantities[sku] || 1;

      const matchingLine = lines.find((l: string) => l.toUpperCase().includes(sku.toUpperCase()));
      if (matchingLine) {
        // Extract numbers in line item row, avoiding price dollar amounts
        const tokens = matchingLine.split(/\s+/);
        const candidates: number[] = [];

        for (const t of tokens) {
          if (t.includes('$') || t.includes('.')) continue;
          const num = parseInt(t.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num) && num > 0 && num < 5000) {
            candidates.push(num);
          }
        }

        if (candidates.length > 0) {
          qty = candidates[0]; // First integer after SKU is the item quantity
        }
      }

      return { sku, quantity: qty };
    });

    // 9. Vendor Name Resolution
    let predictedVendor = "UNKNOWN VENDOR";
    try {
      const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/predictaboss");
      await client.connect();
      const db = client.db();

      const knownVendors = await db.collection('invoices').distinct('vendorName');
      await client.close();

      if (knownVendors && knownVendors.length > 0) {
        for (const v of knownVendors) {
          if (v && v !== "UNKNOWN VENDOR" && rawText.toUpperCase().includes(v.toUpperCase())) {
            predictedVendor = v;
            break;
          }
        }
      }
    } catch (_) {}

    // Fallback: Use top header line as Vendor Name if lookup yields UNKNOWN VENDOR
    if (predictedVendor === "UNKNOWN VENDOR" && lines.length > 0) {
      predictedVendor = lines[0].replace(/[:;,]/g, '').trim();
    }

    return NextResponse.json({ 
      success: true, 
      mlExtractedData: {
        invoiceNumber: extractedInvoiceNum,
        vendorName: predictedVendor,
        totalAmount: extractedTotal,
        detectedSkus: extractedSkus,
        detectedItems: detectedItems
      },
      rawText: rawText 
    });

  } catch (error: any) {
    if (worker) {
      try { await worker.terminate(); } catch (_) {}
    }
    console.error("[OCR Pipeline Error]:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}