'use client';

import { useState } from 'react';
// If using Next.js App Router, use this. If using Vite/React Router, use useNavigate from 'react-router-dom'.
import { useNavigate } from 'react-router-dom';

export default function Register() {
 const navigate = useNavigate(); // React Router version

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user'); // Default to customer/user
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Account created successfully! Redirecting to portal...');
      
      // Auto-redirect to your portal page after 2 seconds
      setTimeout(() => {
        navigate('/login'); // Adjust route destination to your login file path
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">Create Account</h1>
        <p className="text-slate-400 text-sm text-center mb-6">Join the Gamecatalog Portal</p>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 text-sm p-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="you@example.com"
              className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-sm focus:outline-none focus:border-blue-500 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-sm focus:outline-none focus:border-blue-500 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Account Type</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-sm focus:outline-none focus:border-blue-500 text-white"
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            >
              <option value="user">Standard Customer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-2.5 px-4 rounded transition"
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center text-slate-400 mt-6">
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')} 
            className="text-blue-400 hover:underline"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}