'use client';

import React, { useState, useEffect } from 'react';

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
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null); // null means "Adding", object means "Editing"
  const [formData, setFormData] = useState({
    title: '', image: '', link: '', price: '', description: '', tags: ''
  });

  const API_URL = 'http://localhost:5000/api/games';

  // Helper to grab the token securely on the client side
  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // 1. Fetch All Items (Left public on your backend)
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

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ title: '', image: '', link: '', price: '', description: '', tags: '' });
    setIsOpen(true);
  };

  // Open Modal for Edit
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

  // 2. Handle Create & Update Submit (Protected)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up tags into an array
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
          ...getAuthHeader() // 🔑 Added authorization header
        },
        body: JSON.stringify(processedData)
      });

      if (res.ok) {
        setIsOpen(false);
        fetchItems(); // Refresh the list
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to save item.");
      }
    } catch (err) {
      console.error("Error saving item:", err);
    }
  };

  // 3. Handle Delete (Protected)
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: {
          ...getAuthHeader() // 🔑 Added authorization header
        }
      });
      
      if (res.ok) {
        fetchItems(); // Refresh the list
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
        <h1 className="text-3xl font-bold text-gray-800">Catalog Dashboard</h1>
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
        >
          + Add New Item
        </button>
      </div>

      {/* Item List / Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold">
              <th className="p-4">Title</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {items.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{item.title}</td>
                <td className="p-4">${item.price}</td>
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

      {/* Barebones Modal Form for Add/Edit */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingItem ? 'Edit Catalog Item' : 'Add New Catalog Item'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">Title</label>
                <input 
                  type="text" required
                  className="w-full border p-2 rounded text-sm focus:outline-blue-500 text-black"
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase">Price</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full border p-2 rounded text-sm focus:outline-blue-500 text-black"
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase">Tags (comma separated)</label>
                  <input 
                    type="text" placeholder="action, rpg, indie"
                    className="w-full border p-2 rounded text-sm focus:outline-blue-500 text-black"
                    value={formData.tags} 
                    onChange={(e) => setFormData({...formData, tags: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">Image URL</label>
                <input 
                  type="text"
                  className="w-full border p-2 rounded text-sm focus:outline-blue-500 text-black"
                  value={formData.image} 
                  onChange={(e) => setFormData({...formData, image: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">Link</label>
                <input 
                  type="text"
                  className="w-full border p-2 rounded text-sm focus:outline-blue-500 text-black"
                  value={formData.link} 
                  onChange={(e) => setFormData({...formData, link: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">Description</label>
                <textarea 
                  rows={3}
                  className="w-full border p-2 rounded text-sm focus:outline-blue-500 text-black"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border rounded text-sm hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}