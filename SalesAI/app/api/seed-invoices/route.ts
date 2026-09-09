// app/api/seed-all/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Force direct loopback IP address string to bypass environment and alias quirks
const client = new MongoClient("mongodb://127.0.0.1:27017/predictaboss");

export async function POST() {
  try {
    await client.connect();
    const db = client.db();

    // 1. Wipe out both old collections atomically to prevent dirty data states
    await db.collection('products').deleteMany({});
    await db.collection('invoices').deleteMany({});

    // 2. Prepare Master Products Registry Layout
    const masterProducts = [
      {
        sku: "SKU-ABC",
        name: "Premium Widgets",
        category: "Hardware",
        currentUnitPrice: 12.50, // Sets baseline to current post-inflation price point
        stockLevel: 150,
        reorderPoint: 50,
        supplier: "GLOBAL SUPPLIES INC."
      },
      {
        sku: "SKU-XYZ",
        name: "Eco-Friendly Packaging",
        category: "Packaging",
        currentUnitPrice: 2.10,
        stockLevel: 600,
        reorderPoint: 200,
        supplier: "GLOBAL SUPPLIES INC."
      }
    ];

    // 3. Prepare 90-Day Invoice History Log Timeline (6 batches, nested structures)
    const invoiceRecords = [];
    const baseDate = new Date(); // Timeline Anchor: July 08, 2026

    for (let batch = 6; batch >= 1; batch--) {
      const invoiceDate = new Date(baseDate);
      invoiceDate.setDate(baseDate.getDate() - (batch * 15));

      // Calculate a steady 15% pricing trend hike for SKU-ABC over 3 months
      const inflationPremium = (6 - batch) * 0.30; 
      const unitPriceABC = 11.00 + inflationPremium;
      const qtyABC = 100;
      
      const unitPriceXYZ = 2.10;
      const qtyXYZ = 250;

      const totalABC = qtyABC * unitPriceABC;
      const totalXYZ = qtyXYZ * unitPriceXYZ;
      const invoiceSubtotal = totalABC + totalXYZ;
      const taxAmount = invoiceSubtotal * 0.085; // 8.5% Base Tax Rate
      const totalAmount = invoiceSubtotal + taxAmount;

      invoiceRecords.push({
        invoiceNumber: `INV-2026-00${7 - batch}`,
        vendorName: "GLOBAL SUPPLIES INC.",
        dateReceived: invoiceDate,
        subtotal: Number(invoiceSubtotal.toFixed(2)),
        tax: Number(taxAmount.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
        items: [
          {
            sku: "SKU-ABC",
            description: "Premium Widgets",
            quantity: qtyABC,
            unitPrice: Number(unitPriceABC.toFixed(2)),
            total: Number(totalABC.toFixed(2))
          },
          {
            sku: "SKU-XYZ",
            description: "Eco-Friendly Packaging",
            quantity: qtyXYZ,
            unitPrice: unitPriceXYZ,
            total: Number(totalXYZ.toFixed(2))
          }
        ]
      });
    }

    // 4. Fire simultaneous batch operations straight to the active collection destinations
    const productResult = await db.collection('products').insertMany(masterProducts);
    const invoiceResult = await db.collection('invoices').insertMany(invoiceRecords);

    return NextResponse.json({
      success: true,
      message: "Database collections seeded seamlessly!",
      summary: {
        productsCreated: productResult.insertedCount,
        invoicesLogged: invoiceResult.insertedCount
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
}