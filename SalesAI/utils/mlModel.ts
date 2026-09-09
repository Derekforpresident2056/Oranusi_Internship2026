// utils/mlModel.ts
import * as tf from '@tensorflow/tfjs';

// 1. Updated Label Map (7 Output Classes)
export const LABEL_MAP = { 
  NOISE: 0, 
  INV_NUM: 1, 
  TOTAL: 2, 
  SKU: 3, 
  QUANTITY: 4, // 👈 Added
  PRICE: 5,    // 👈 Added
  VENDOR: 6    // 👈 Added
};

export const NUM_CLASSES = Object.keys(LABEL_MAP).length; // 7

// 7 feature dimensions in input, sequence length of 150 tokens
export function createInvoiceExtractionModel(sequenceLength = 150, featureDimensions = 7) {
  const model = tf.sequential();

  model.add(tf.layers.inputLayer({ inputShape: [sequenceLength, featureDimensions] }));

  // Hidden Layers
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.1 }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu' }));

  // 2. Output Layer: Updated to match NUM_CLASSES (7 units)
  model.add(tf.layers.dense({ units: NUM_CLASSES, activation: 'softmax' }));

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}