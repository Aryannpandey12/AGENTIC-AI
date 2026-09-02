import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cloudkitchen-flow-cart";

function readCartFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readCartFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((current) => {
      const existing = current.find((cartItem) => cartItem.item_id === item.item_id);
      if (existing) {
        return current.map((cartItem) =>
          cartItem.item_id === item.item_id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem
        );
      }

      return [
        ...current,
        {
          item_id: item.item_id,
          item_name: item.item_name,
          category: item.category,
          price: Number(item.price || 0),
          image_url: item.image_url,
          qty: 1
        }
      ];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((current) => current.filter((item) => item.item_id !== itemId));
  };

  const increaseQty = (itemId) => {
    setCartItems((current) =>
      current.map((item) => (item.item_id === itemId ? { ...item, qty: item.qty + 1 } : item))
    );
  };

  const decreaseQty = (itemId) => {
    setCartItems((current) =>
      current
        .map((item) => (item.item_id === itemId ? { ...item, qty: Math.max(0, item.qty - 1) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () => cartItems.reduce((sum, item) => sum + Number(item.price || 0) * item.qty, 0);

  const getCartCount = () => cartItems.reduce((sum, item) => sum + item.qty, 0);

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      increaseQty,
      decreaseQty,
      clearCart,
      getCartTotal,
      getCartCount
    }),
    [cartItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
