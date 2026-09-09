// utils/invoiceParser.ts

export function parseInvoiceText(rawText: string) {
  // 1. Define regular expression patterns with flexible capture groups
  const invoiceNumRegex = /Invoice\s*No:\s*([\w-]+)/i; // Captures alpha, numeric, and dashes safely
  
  // Handled single and double-digit days (\d{1,2})
  const dateRegex = /Date:\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/i;
  
  const totalRegex = /TOTAL\s*DUE:\s*\$([\d,.]+)/i;

  // 2. Execute the match functions to pull strings out
  const invoiceNumber = rawText.match(invoiceNumRegex)?.[1] || "UNKNOWN";
  const dateReceived = rawText.match(dateRegex)?.[1] || new Date().toISOString();
  const totalAmount = parseFloat(rawText.match(totalRegex)?.[1]?.replace(/,/g, '') || "0");

  // 3. Line Item Extraction Loop
  const items: any[] = [];
  const lines = rawText.split('\n');
  
  // More resilient pattern: allows multi-character alphanumeric SKUs (e.g., SKU-MNO, SKU-WIDGET01)
  const skuLineRegex = /(SKU-[A-Z0-9]+)\s+(.*?)\s+(\d+)\s+\$([\d.,]+)\s+\$([\d.,]+)/;

  for (const line of lines) {
    const match = line.match(skuLineRegex);
    if (match) {
      items.push({
        sku: match[1],
        description: match[2].trim(),
        quantity: parseInt(match[3]),
        unitPrice: parseFloat(match[4].replace(/,/g, '')),
        total: parseFloat(match[5].replace(/,/g, ''))
      });
    }
  }

  // 4. Return clean structured layout matching DB collections
  return {
    vendorName: "GLOBAL SUPPLIES INC.",
    invoiceNumber,
    dateReceived: new Date(dateReceived),
    totalAmount,
    items
  };
}