// app/api/ocr/route.ts (Original Regex Version)
import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import { MongoClient } from 'mongodb';
import path from 'path';
import { parseInvoiceText } from '@/utils/invoiceParser'; // <--- THE IMPORT

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/predictaboss");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Explicitly target the node worker inside your node_modules
    const workerScriptPath = path.join(
      process.cwd(),
      'node_modules',
      'tesseract.js',
      'src',
      'worker-script',
      'node',
      'index.js'
    );

    // Initialize the worker with the required paths
    const worker = await createWorker('eng', 1, {
      workerPath: workerScriptPath,
    });

    // Run the recognition
    const { data: { text } } = await worker.recognize(buffer);
    
    // Always clean up the worker thread
    await worker.terminate();


    // RIGHT HERE: You pass the raw 'text' string into the regex parser
    const structuredInvoice = parseInvoiceText(text);

    // Now 'structuredInvoice' is a clean object you can save straight to MongoDB!
    console.log("Cleaned JSON Data ready for DB:", structuredInvoice);

    await client.connect();
    const db = client.db();

    const invoiceResult = await db.collection('invoices').insertOne({
      invoiceNumber: structuredInvoice.invoiceNumber,
      dateReceived: structuredInvoice.dateReceived,
      totalAmount: structuredInvoice.totalAmount,
      items: structuredInvoice.items,
      createdAt: new Date()
    });

    for (const item of structuredInvoice.items) {
      await db.collection('products').updateOne(
        { _id: item.sku }, // Find item by SKU
        { 
          $setOnInsert: { name: item.description }, // If product doesn't exist yet, set its name
          $inc: { currentStock: item.quantity }     // Increment stock by the invoice quantity
        },
        { upsert: true } // If it doesn't exist, create it!
      );
    }

    return NextResponse.json({ success: true, text });

  } catch (error: any) {
    console.error('Database/OCR Integration Error:', error);
    return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
  } finally {
    await client.close();
  }
}