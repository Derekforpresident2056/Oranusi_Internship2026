import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface CartItem {
  _id: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (game: any) => void;
  removeFromCart: (gameId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getCartStorageKey = () => {
  try {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      if (user && user.id) return `game_selection_cart_${user.id}`;
    }
  } catch (e) {}
  return 'game_selection_cart_guest';
};

export function CartProvider({ children }: { children: ReactNode }) {
  // Directly loads the accurate active key immediately upon component construction
  const [cart, setCart] = useState<CartItem[]>(() => {
    const activeKey = getCartStorageKey();
    const savedCart = localStorage.getItem(activeKey);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Keep localStorage perfectly in sync with the state
  useEffect(() => {
    const activeKey = getCartStorageKey();
    localStorage.setItem(activeKey, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (incartgame: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === incartgame._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === incartgame._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { _id: incartgame._id, title: incartgame.title, image: incartgame.image, quantity: 1, price: incartgame.price }];
    });
  };

  const removeFromCart = (incartgameId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== incartgameId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};