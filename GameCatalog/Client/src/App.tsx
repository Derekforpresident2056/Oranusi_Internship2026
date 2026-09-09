import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext'; // Ensure this path matches your project structure

import Layout from './components/Layout';   
import Login from './pages/Login';
import Catalog from './pages/CustomerViews/Catalog';
import FrontDisplay from './pages/CustomerViews/FrontDisplay';
import NintendoCatalog from './pages/CustomerViews/NintendoCatalog';
import AdminDashboard from './pages/AdminViews/AdminDashboard';
import SalesReports from './pages/AdminViews/SalesReports';
import Register from './pages/Register';

function App() {
  const [userId, setUserId] = useState('guest');

  // 🔄 Listen for login/logout changes to force re-render the provider tree
  useEffect(() => {
    const checkUser = () => {
      try {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          // Look for either user.id or user._id depending on your login return value
          if (user?.id) {
            setUserId(user.id);
            return;
          } else if (user?._id) {
            setUserId(user._id);
            return;
          }
        }
      } catch (e) {
        console.error("Error reading storage user key in app framework shell:", e);
      }
      setUserId('guest');
    };

    // Run verification immediately upon mounting frame
    checkUser();

    // Catch storage dispatch cycles sent manually from login/logout operations
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  return (
    // 🔑 Passing the userId key forces React to reset and cleanly hot-swap the Cart cache instantly on sign-in/sign-out!
    <CartProvider key={userId}>
      <Router>
        <Routes>
          {/* 1. Default Route: Redirects bare URL '/' straight to your Login view */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 2. Login View */}
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
          
          {/* 3. Customer Nested Views Layout */}
          <Route path="/customer" element={<Layout />}>
            <Route path="catalog" element={<Catalog />} />
            <Route path="nintendocatalog" element={<NintendoCatalog />} />
          </Route>

          <Route path="/customer" element={<Layout />}>
            <Route path="frontdisplay" element={<FrontDisplay />} />
          </Route>

          {/* 4. Admin Nested Views Layout */}
          <Route path="/admin" element={<Layout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports" element={<SalesReports />} />
          </Route>

          {/* Fallback Catch-all: Send unhandled URLs back to Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;