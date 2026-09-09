import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceNumber, vendorName, totalAmount, detectedSkus, rawText } = body;
    const items = body.items || (body.detectedSkus || []).map((sku: string) => ({ sku, quantity: 1 })); 

    if (!invoiceNumber || totalAmount === undefined || !vendorName || !rawText) {
      return NextResponse.json({ error: 'Missing required validation fields.' }, { status: 400 });
    }

    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/predictaboss");
    await client.connect();
    const db = client.db();

    // 1. 🛑 DUPLICATE CHECK (Must run BEFORE inserting!)
    const existingInvoice = await db.collection('invoices').findOne({ invoiceNumber: invoiceNumber.trim() });

    if (existingInvoice) {
      await client.close();
      return NextResponse.json({ 
        success: false, 
        duplicate: true,
        message: `Invoice '${invoiceNumber}' has already been processed and committed to the database.` 
      }, { status: 409 });
    }

    // 2. Save Verified Invoice Document
    await db.collection('invoices').insertOne({
      invoiceNumber: invoiceNumber.trim(),
      vendorName,
      dateReceived: new Date(),
      subtotal: Math.round(totalAmount * 0.93),
      tax: Math.round((totalAmount * 0.07) * 100) / 100,
      totalAmount: parseFloat(totalAmount) || 0,
      items: detectedSkus,
      processedAt: new Date(),
      status: "VERIFIED"
    });

    // 3. Dynamic Product Inventory Sync
    if (items && items.length > 0) {
      for (const item of items) {
        const cleanSku = item.sku.toLowerCase();
        const qty = parseInt(item.quantity, 10) || 1;
        
        await db.collection('products').updateOne(
          { sku: cleanSku },
          { 
            $setOnInsert: { 
              name: `Product ${cleanSku.toUpperCase()}`,
              category: "Industrial Supplies",
              currentUnitPrice: 0.00,
              reorderPoint: 50,
              supplier: vendorName || "UNKNOWN"
            },
            $inc: { stockLevel: qty }
          },
          { upsert: true }
        );
      }
    }

    // 4. Log clean training data snapshot
    await db.collection('training_logs').insertOne({
      rawText,
      invoiceNumber: invoiceNumber.trim(),
      totalAmount,
      detectedSkus,
      vendorName,
      verifiedAt: new Date()
    });

    await client.close();
    return NextResponse.json({ success: true, message: "Committed dynamically!" });

  } catch (error: any) {
    console.error("Confirmation DB Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}