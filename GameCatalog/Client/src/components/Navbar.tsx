import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import CartDrawerModal from './modals/CartDrawerModal';

interface SessionUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  // Read current user session info safely on initialization
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error reading current user data profile", err);
      }
    }
  }, [location.pathname]); // Listen to routing events to update state safely if logging in

  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 🚀 Force the App shell to see the storage mutation instantly
  window.dispatchEvent(new Event('storage')); 
  
  setUser(null);
  navigate('/login');
};

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isActive = (path: string) => location.pathname === path;
  const currentPath = location.pathname;

  const themes: Record<string, { brandText: string; accentBorder: string; activeLinkText: string; brandBg: string }> = {
    '/customer/frontdisplay': {
      brandText: 'text-blue-500',
      brandBg: 'bg-blue-600',
      accentBorder: 'border-blue-500/30',
      activeLinkText: 'border-blue-500 text-blue-400',
    },
    '/customer/catalog': {
      brandText: 'text-[#E01E93]',
      brandBg: 'bg-[#E01E93]',
      accentBorder: 'border-[#E01E93]/30',
      activeLinkText: 'border-[#E01E93] text-[#E01E93]',
    },
    '/customer/nintendocatalog': {
      brandText: 'text-red-500',
      brandBg: 'bg-red-600',
      accentBorder: 'border-red-500/30',
      activeLinkText: 'border-red-500 text-red-500',
    },
    '/admin/dashboard': {
      brandText: 'text-amber-500',
      brandBg: 'bg-amber-600',
      accentBorder: 'border-amber-500/30',
      activeLinkText: 'border-amber-500 text-amber-500',
    },
    '/admin/reports': {
      brandText: 'text-green-500',
      brandBg: 'bg-green-600',
      accentBorder: 'border-green-500/30',
      activeLinkText: 'border-green-500 text-green-500',
    },
  };

  const currentTheme = themes[currentPath] || themes['/customer/frontdisplay'];

  // Safe initial token calculation
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'G';

  return (
    <nav className={`w-full h-16 bg-zinc-950 border-b ${currentTheme.accentBorder} px-6 flex items-center justify-between transition-all duration-500 ease-in-out`}>
      
      {/* Left Section: Branding */}
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 ${currentTheme.brandBg} rounded-lg flex items-center justify-center font-bold text-white tracking-wider transition-colors duration-500`}>
        </div>
        <span className="text-5xl text-white font-condexa tracking-wider uppercase">
          The<span className={`${currentTheme.brandText} transition-colors duration-500`}>Archive</span>
        </span>
      </div>

      {/* Center Section: Navigation Links */}
      <div className="flex items-center space-x-1 h-full">
        <Link
          to="/customer/frontdisplay"
          className={`px-4 h-full flex items-center text-2xl font-medium border-b-2 transition-all duration-300 font-condexa tracking-wider ${
            isActive('/customer/frontdisplay') 
              ? currentTheme.activeLinkText
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/customer/catalog"
          className={`px-4 h-full flex items-center text-2xl font-medium border-b-2 transition-all duration-300 font-condexa tracking-wider ${
            isActive('/customer/catalog')
              ? currentTheme.activeLinkText
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Browse Catalog
        </Link>
        <Link
          to="/customer/nintendocatalog"
          className={`px-4 h-full flex items-center text-2xl font-medium border-b-2 transition-all duration-300 font-condexa tracking-wider ${
            isActive('/customer/nintendocatalog')
              ? currentTheme.activeLinkText
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Nintendo
        </Link>

        
        {/* Dynamic Admin Shortcut Link display if the role confirms identity */}
        {user?.role === 'admin' && (
          <Link
            to="/admin/dashboard"
            className={`px-4 h-full flex items-center text-2xl font-medium border-b-2 transition-all duration-300 font-condexa tracking-wider ${
              isActive('/admin/dashboard') 
              ? currentTheme.activeLinkText 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Admin Panel
          </Link>
        )}

        {user?.role === 'admin' &&(
          <Link
            to="/admin/reports"
            className={`px-4 h-full flex items-center text-2xl font-medium border-b-2 transition-all duration-300 font-condexa tracking-wider ${
              isActive('/admin/reports') 
              ? currentTheme.activeLinkText 
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sales Reports
          </Link>
        )}
      </div>

      {/* Right Section: Profile / Control Display panel */}
      <div className="flex items-center space-x-4">
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-bold text-zinc-300 hover:border-[#E01E93] hover:text-[#E01E93] transition-colors flex items-center gap-2"
          >
            <span>🛒 Basket</span>
            {totalCartCount > 0 && (
              <span className="bg-[#E01E93] text-white font-black text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* User Session Visual Status layout box */}
          <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-zinc-300 text-xs font-bold truncate max-w-[120px]">
                {user ? user.email : 'Guest Session'}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                {user ? user.role : 'Offline'}
              </p>
            </div>

            <div 
              title={user ? "Click to Log Out" : "Log In Profile Window"}
              onClick={user ? handleLogout : () => navigate('/login')}
              className={`w-9 h-9 rounded-full ${user ? 'bg-zinc-800 border-zinc-700 hover:bg-red-950/40 hover:border-red-800 hover:text-red-400' : 'bg-zinc-900 border-zinc-800'} border flex items-center justify-center font-bold text-sm text-zinc-400 cursor-pointer transition-all`}
            >
              {userInitial}
            </div>
          </div>
        </div>
        
        <CartDrawerModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}