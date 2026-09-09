'use client';

import React, { useState, useEffect } from 'react';
import GameDrawerModal from './modals/ManageStockModal'; // 👈 Point to your new modal file

interface CatalogItem {
  _id: string;
  title: string;
  image?: string;
  link?: string;
  price: number;
  description?: string;
  tags?: string[];
}

export default function AdminDashboard() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formData, setFormData] = useState({
    title: '', image: '', link: '', price: '', description: '', tags: ''
  });

  const API_URL = 'http://localhost:5000/api/games';

  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ 
      title: '',
      image: '',
      link: '', 
      price: '', 
      description: '', 
      tags: '' 
    });
    setIsOpen(true);
  };
  

  const handleOpenEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      image: item.image || '',
      link: item.link || '',
      price: item.price ? String(item.price) : '',
      description: item.description || '',
      tags: item.tags ? item.tags.join(', ') : ''
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const processedData = {
      ...formData,
      price: Number(formData.price),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    const url = editingItem ? `${API_URL}/${editingItem._id}` : API_URL;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(processedData)
      });

      if (res.ok) {
        setIsOpen(false);
        fetchItems(); 
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to save item.");
      }
    } catch (err) {
      console.error("Error saving item:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      
      if (res.ok) {
        fetchItems();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to delete item.");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-5xl text-white font-condexa tracking-wider">Catalog Dashboard</h1>
        <button 
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded transition-colors font-condexa tracking-wider text-2xl duration-300"
        >
          + Add New Item
        </button>
      </div>

      {/* Item List / Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold font-condexa tracking-wider text-3xl">
              <th className="p-4 w-[20%]">Image</th>
              <th className="p-4 w-[20%]">Title</th>
              <th className="p-4 w-15%">Price</th>
              <th className="p-4">Tags</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="h-24 w-24 object-contain rounded-lg"
                  />
                </td>

                <td className="p-4 font-medium">{item.title}</td>

                <td className="p-4">${item.price}</td>

                <td className="p-4">{item.tags?.[0] || "Catalog Item"}</td>

                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => handleOpenEdit(item)}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium px-2 py-1"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🚀 CONNECTED: Feed everything into the custom modal via component props */}
      <GameDrawerModal
        isOpen={isOpen}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}