'use client';

import React, { useState, useEffect } from 'react';

interface SaleItemSpec {
  itemId: string;
  title: string;
  pricePaid: number;
  quantity: number;
}

interface SalesRecord {
  _id: string;
  userId: string;
  customerEmail: string; // ✨ Matched backend schema naming
  items: SaleItemSpec[]; // 📦 Holds the raw purchased items
  totalAmount: number;   // ✨ Matched backend schema naming
  purchaseDate: string;
}

export default function SalesReports() {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🎯 ROUTE FIXED: Target the checkout dataset, not the games list
  const API_URL = 'http://localhost:5000/api/checkout';

  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchSales = async () => {
    try {
      // 🔑 Guarded view: Send your authorization header block along with the request
      const res = await fetch(API_URL, {
        headers: getAuthHeader()
      });
      const data = await res.json();
      
      // Handle cases where an error message array object is returned instead
      if (res.ok) {
        setSales(data);
      } else {
        console.error("Server refused request:", data.message);
      }
    } catch (err) {
      console.error("Failed to fetch sales database entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  if (loading) return <div className="p-8 text-center text-white">Loading Sales Ledger...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-5xl text-white font-condexa tracking-wider">Sales Reports Ledger</h1>
      </div>

      {/* Item List / Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold font-condexa tracking-wider text-2xl">
              <th className="p-4">Customer Email</th>
              <th className="p-4">Purchased Items</th>
              <th className="p-4 text-right">Revenue Generated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
            {sales.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-400 italic">No sales transactions found in database logs.</td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{sale.customerEmail}</td>
                  <td className="p-4 text-gray-600">
                    <div className="space-y-1">
                      {sale.items?.map((pkg, idx) => (
                        <div key={idx}>
                          • <span className="font-semibold text-gray-800">{pkg.title}</span> (x{pkg.quantity}) @ ${pkg.pricePaid}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-600 text-base">
                    ${sale.totalAmount?.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}