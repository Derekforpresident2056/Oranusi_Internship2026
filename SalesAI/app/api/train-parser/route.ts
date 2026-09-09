// app/api/train-parser/route.ts
import { NextResponse } from 'next/server';
import * as tf from '@tensorflow/tfjs';
import { createInvoiceExtractionModel } from '@/utils/mlModel';
import { generateTrainingSample } from '@/utils/mlTrainingData';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // 1. Core Base Templates (Static baseline models)
    const rawTemplates = [
      {
        text: `
          GLOBAL SUPPLIES INC. Invoice No: INV-2026-889 Date: July 08, 2026
          SKU-ABC Premium Widgets 100 $12.50 $1,250.00
          TOTAL DUE: $2,409.88
        `,
        invoiceNumber: "INV-2026-889",
        totalAmount: 2409.88,
        items: [{ sku: "SKU-ABC", quantity: 100 }]
      },
      {
        text: `
          NEXUS LOGISTICS nx-2026-9912 Total: $1455.47
          part-772a Qty: 50
          part-881b Qty: 15
          part-112c Qty: 5
        `,
        invoiceNumber: "nx-2026-9912",
        totalAmount: 1455.47,
        items: [
          { sku: "part-772a", quantity: 50 },
          { sku: "part-881b", quantity: 15 },
          { sku: "part-112c", quantity: 5 }
        ]
      }
    ];

    // 🔌 2. Pull Dynamic Training Logs from MongoDB
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/predictaboss");
    await client.connect();
    const db = client.db();
    
    // Fetch live user-corrected logs from human-in-the-loop edits
    const userCorrectedLogs = await db.collection('training_logs')
      .find({})
      .limit(50)
      .toArray();
    
    await client.close();

    // Re-map retrieved database fields back into training feature objects
    const dynamicSamples = userCorrectedLogs.map(log => ({
      text: log.rawText || "", 
      invoiceNumber: log.invoiceNumber || "UNKNOWN",
      totalAmount: log.totalAmount || 0,
      items: log.lineItems || log.items || []
    }));

    // Combine static rules with real-world human corrections
    const combinedDataset = [...rawTemplates, ...dynamicSamples];
    
    const allXs: number[][][] = [];
    const allYs: number[][][] = [];

    // DATA AMPLIFICATION LOOP (5x multiplier)
    for (let i = 0; i < 5; i++) {
      for (const sample of combinedDataset) {
        if (!sample.text || sample.text.trim() === "") continue;

        const parsedData = generateTrainingSample(
          sample.text, 
          sample.invoiceNumber, 
          sample.totalAmount, 
          sample.items
        );
        
        allXs.push(parsedData.xs);
        allYs.push(parsedData.ys);
      }
    }

    if (allXs.length === 0) {
      return NextResponse.json({ error: "No valid training samples available." }, { status: 400 });
    }

    // Convert feature matrices into 3D Tensors: [batchSize, maxSeqLen (150), featureDim (7)]
    const xTrain = tf.tensor3d(allXs); 
    const yTrain = tf.tensor3d(allYs);

    // Initialize 7-class Dense model architecture
    const model = createInvoiceExtractionModel(150, 7);

    console.log(`⚙️ Commencing backpropagation training loops over ${combinedDataset.length} layouts...`);
    
    // Train the model weights over 60 epochs
    const history = await model.fit(xTrain, yTrain, {
      epochs: 60,
      batchSize: 2,
      shuffle: true
    });

    // File writing blocks...
    const dirPath = path.join(process.cwd(), 'models', 'invoice-parser');
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    let modelTopologyAndWeights: any = null;
    await model.save({
      save: async (artifacts) => {
        modelTopologyAndWeights = artifacts;
        return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
      }
    });

    const modelJson = {
      modelTopology: modelTopologyAndWeights.modelTopology,
      format: modelTopologyAndWeights.format,
      generatedBy: modelTopologyAndWeights.generatedBy,
      convertedBy: modelTopologyAndWeights.convertedBy,
      weightsManifest: [{ paths: ['./weights.bin'], weights: modelTopologyAndWeights.weightSpecs }]
    };

    fs.writeFileSync(path.join(dirPath, 'model.json'), JSON.stringify(modelJson, null, 2));
    if (modelTopologyAndWeights.weightData) {
      fs.writeFileSync(path.join(dirPath, 'weights.bin'), Buffer.from(modelTopologyAndWeights.weightData));
    }

    // 🧹 Explicit Tensor Cleanup
    xTrain.dispose();
    yTrain.dispose();
    model.dispose();

    console.log("✅ Balanced neural weights updated and serialized to disk storage.");

    return NextResponse.json({
      success: true,
      message: `Agent training completed successfully across ${dynamicSamples.length} dynamic corrections!`,
      finalLoss: history.history.loss[history.history.loss.length - 1]
    });

  } catch (error: any) {
    console.error("Training Pipeline Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}