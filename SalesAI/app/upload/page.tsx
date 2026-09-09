'use client';

import { useState } from 'react';

interface ExtractedData {
  invoiceNumber: string;
  vendorName: string;
  totalAmount: number;
  detectedSkus: string[];
}

export default function OcrPage() {
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [training, setTraining] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // New state variables for holding human-editable values
  const [rawText, setRawText] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [detectedSkus, setDetectedSkus] = useState<string[]>([]);
  const [showWorkspace, setShowWorkspace] = useState(false);

  const [detectedItems, setDetectedItems] = useState<{ sku: string; quantity: number }[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setShowWorkspace(false);
    setRawText('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRawText(data.rawText || '');
        
        // Populate interactive form parameters from the agent's best predictions
        if (data.mlExtractedData) {
          setInvoiceNumber(data.mlExtractedData.invoiceNumber || 'UNKNOWN');
          setVendorName(data.mlExtractedData.vendorName || 'UNKNOWN VENDOR');
          setTotalAmount(data.mlExtractedData.totalAmount || 0);
          setDetectedSkus(data.mlExtractedData.detectedSkus || []);
          setShowWorkspace(true);

          setDetectedItems(data.mlExtractedData.detectedItems || []);
        }
      } else {
        alert(data.error || 'Something went wrong on the server.');
      }
    } catch (err) {
      console.error('Frontend Fetch Error:', err);
      alert('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // 💾 Human Verification Submit Gateway
  const handleConfirmAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber,
          vendorName,
          totalAmount,
          detectedSkus,
          rawText
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('🎉 Invoice records committed and training snapshot logged successfully!');
        setShowWorkspace(false); // Hide workspace until next upload
      } else {
        throw new Error(data.error || 'Database ingestion rejected.');
      }
    } catch (err: any) {
      alert('❌ Save Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Quick-Trigger Seeder Function
  const triggerSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed-invoices', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server status ${res.status}`);
      alert(data.message || "Seeding complete!");
    } catch (err: any) {
      alert("❌ Seeder Failed: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  // TensorFlow Model Training Trigger[cite: 1]
  const triggerTraining = async () => {
    setTraining(true);
    try {
      const res = await fetch('/api/train-parser', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Training server status ${res.status}`);
      alert(`🧠 ML Training Completed Successfully!\nFinal Target Loss: ${data.finalLoss?.toFixed(4)}`);
    } catch (err: any) {
      alert("❌ Model Training Failed: " + err.message);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="border border-green-600 rounded-lg p-6 bg-zinc-950 text-green-500 font-mono shadow-md">
        <h1 className="text-xl font-bold mb-4 border-b border-green-600 pb-2">📂 Dev Operations Toolkit</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Column 1: DB Seeder Section[cite: 1] */}
          <div>
            <p className="text-xs text-zinc-400 mb-1">// Initialize training trends</p>
            <button 
              onClick={triggerSeed}
              disabled={seeding}
              className="w-full bg-blue-600 text-white font-sans text-sm font-semibold py-2 px-4 rounded hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors text-center"
            >
              {seeding ? "⚡ Seeding DB..." : "⚡ Run Invoice Seeder"}
            </button>
          </div>

          {/* Column 2: TensorFlow Optimizer Pipeline[cite: 1] */}
          <div className="border-t md:border-t-0 md:border-l md:border-r border-zinc-800 pt-4 md:pt-0 md:px-6">
            <p className="text-xs text-zinc-400 mb-1">// Run backpropagation fit parameters</p>
            <button 
              onClick={triggerTraining}
              disabled={training}
              className="w-full bg-purple-600 text-white font-sans text-sm font-semibold py-2 px-4 rounded hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 cursor-pointer transition-colors text-center"
            >
              {training ? "🧠 Training Model..." : "🧠 Optimize Parse Weights"}
            </button>
          </div>

          {/* Column 3: Document Ingestion Section[cite: 1] */}
          <div className="border-t md:border-t-0 pt-4 md:pt-0">
            <p className="text-xs text-zinc-400 mb-1">// Upload live invoice file</p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-900 file:text-green-300 hover:file:bg-green-800 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-zinc-400 animate-pulse font-mono">// Uploading and processing on server...</p>
      )}

      {/* 🛠️ HUMAN-IN-THE-LOOP VERIFICATION WORKSPACE FORM */}
      {showWorkspace && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Edit Form Fields Pane */}
          <form onSubmit={handleConfirmAndSave} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
            <h3 className="text-md font-bold text-zinc-200 border-b border-zinc-800 pb-2 font-mono">✍️ Review Agent Predictions</h3>
            
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1 font-mono">Vendor Name</label>
              <input 
                type="text" 
                value={vendorName} 
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-black text-zinc-200 border border-zinc-800 px-3 py-2 rounded text-sm focus:outline-none focus:border-green-600 font-sans"
                placeholder="Type or correct vendor..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1 font-mono">Invoice Number</label>
              <input 
                type="text" 
                value={invoiceNumber} 
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-black text-zinc-200 border border-zinc-800 px-3 py-2 rounded text-sm focus:outline-none focus:border-green-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1 font-mono">Total Amount ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={totalAmount} 
                onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-black text-zinc-200 border border-zinc-800 px-3 py-2 rounded text-sm focus:outline-none focus:border-green-600 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1 font-mono">
                Detected Line Items & Quantities
              </label>
              <div className="space-y-2 bg-black p-2 rounded border border-zinc-800 min-h-[40px]">
                {detectedItems.length > 0 ? (
                detectedItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
                    <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs border border-zinc-700 font-mono uppercase">
                      {item.sku}
                    </span>
          
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 font-mono">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const updatedItems = [...detectedItems];
                          updatedItems[idx].quantity = parseInt(e.target.value, 10) || 1;
                          setDetectedItems(updatedItems);
                        }}
                        className="w-16 bg-black border border-zinc-700 text-green-400 font-mono text-xs px-2 py-1 rounded focus:outline-none focus:border-green-500 text-right"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-zinc-600 font-mono italic p-1 block">No SKUs classified</span>
              )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-700 text-white font-sans text-sm font-semibold py-2 px-4 rounded hover:bg-green-600 active:bg-green-800 disabled:opacity-50 transition-colors cursor-pointer mt-2 text-center"
            >
              {saving ? "🔄 Verification Syncing..." : "💾 Approve & Commit to Database"}
            </button>
          </form>

          {/* Raw Text Context Context Window for Quick Look Reference */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-400 font-mono">🔍 Original Scanned Source Text:</h3>
            <pre className="bg-black text-zinc-500 border border-zinc-800 p-4 rounded-lg h-[360px] overflow-y-auto text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
              {rawText}
            </pre>
          </div>

        </div>
      )}
    </div>
  );
}