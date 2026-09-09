import { useState, useEffect } from 'react'; // 1. Make sure these are imported
import { createPortal } from 'react-dom';    // 2. Make sure this is imported
import { useCart } from '../../context/CartContext'; // Adjust path based on your layout structure
import { cartmodalstyles as cartmodalstyle } from './styles';

interface CartDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawerModal({ isOpen, onClose }: CartDrawerModalProps) {
  const { cart, removeFromCart, clearCart } = useCart();


  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);


  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckoutSubmit = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Please log in to complete your purchase.");
    return;
  }

  setIsCheckingOut(true);

  try {
    const res = await fetch('http://localhost:5000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Sends session proof
      },
      body: JSON.stringify({ cartItems: cart }) // Sends over active array
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message); // "Purchase processed successfully! 🎉"
      clearCart();         // 🧹 Deconstructs and wipes local storage clean automatically!
      onClose();          // Closes out modal drawer
    } else {
      alert(data.message || "Checkout encounter anomaly error.");
    }
  } catch (err) {
    console.error("Critical connection failure executing checkout:", err);
    alert("Failed to communicate with authorization cluster.");
  } finally {
    setIsCheckingOut(false);
  }
};

  // Calculate total amount assuming a flat dummy rate of $60/game for display metrics
  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const modalContent = (
    <div className={`${cartmodalstyle.modalcontainer}  ${
      isOpen ? "pointer-events-auto" : "pointer-events-none"
    }`}>
      
      {/* Dark Backdrop Blur */}
      <div 
        onClick={onClose} 
        className={`${cartmodalstyle.backdrop} ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sliding Panel */}
      <div className={`${cartmodalstyle.slidingpanel} ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        
        {/* Header Block */}
        <div className={cartmodalstyle.headerblock}>
          <h2 className={cartmodalstyle.headertext}>
            Your Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </h2>
          <button onClick={onClose} className={cartmodalstyle.closebutton}>
            ✕
          </button>
        </div>

        {/* VISUAL CARDS TRACKER ARRAY */}
        <div className={cartmodalstyle.cartcard}>
          {cart.length === 0 ? (
            <div className={cartmodalstyle.cartempty}>
              Your temporary cart is currently empty.
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item._id} 
                className={cartmodalstyle.cardcontent}
              >
                {/* Visual Thumbnail Case */}
                <div className={cartmodalstyle.cardthumbnail}>
                  <img src={item.image} alt={item.title} className={cartmodalstyle.cardthumbnailimage} />
                </div>

                {/* Meta details */}
                <div className={cartmodalstyle.metadetailscontainer}>
                  <h4 className={cartmodalstyle.metadetailstext}>
                    {item.title}
                  </h4>
                  <p className={cartmodalstyle.metadetailsquantity}>
                    Qty: <span className="text-zinc-300 font-bold">{item.quantity}</span>{item.price}
                  </p>
                </div>

                {/* Remove single item action */}
                <button 
                  onClick={() => removeFromCart(item._id)}
                  className={cartmodalstyle.removecart}
                  aria-label="Remove item"
                >
                  Trash
                </button>
              </div>
            ))
          )}
        </div>

        {/* BOTTOM UTILITIES DRAWER */}
        {cart.length > 0 && (
          <div className={cartmodalstyle.utilitydrawer}>
            
            {/* Total Readout */}
            <div className={cartmodalstyle.totalreadout}>
              <span className="text-zinc-400 text-xs">Estimated Total:</span>
              {/* The formatter handles the "$" symbol and decimal points automatically */}
              <span className="text-white text-lg">{currencyFormatter.format(totalAmount)}</span>
            </div>

            {/* Clear Button & Checkout Split Block */}
            <div className="flex gap-3">
              {/* CLEAR BUTTON */}
              <button 
                onClick={() => {
                  clearCart();
                  console.log("LocalStorage cart wiped successfully.");
                }}
                className={cartmodalstyle.clearcartbutton}
              >
                Clear
              </button>

              {/* Checkout Placeholder */}
              <button 
                onClick={handleCheckoutSubmit}
                disabled={isCheckingOut}
                className={cartmodalstyle.checkoutbutton}
              >
                {isCheckingOut ? 'Processing Order...' : 'Proceed to Checkout'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
  return mounted ? createPortal(modalContent, document.body) : null;
}