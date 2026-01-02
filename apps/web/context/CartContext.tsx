'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Tipe data item di keranjang
type CartItem = {
  id: number;
  name: string;
  pricePerDay: number;
  imageUrl: string;
  quantity: number;
  stock: number; // Agar kita bisa batasi max qty
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // 1. Load dari LocalStorage saat awal buka
  useEffect(() => {
    const savedCart = localStorage.getItem('sewatenda_cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // 2. Simpan ke LocalStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem('sewatenda_cart', JSON.stringify(items));
  }, [items]);

  // Tambah Barang
  const addToCart = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // Kalau sudah ada, tambah qty (tapi jangan melebihi stok)
        if (existing.quantity < product.stock) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        alert('Stok barang di keranjang sudah maksimal!');
        return prev;
      }
      // Kalau belum ada, masukkan baru
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          pricePerDay: product.pricePerDay,
          imageUrl: product.imageUrl,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
    alert('Barang masuk keranjang! 🛒');
  };

  // Hapus Barang
  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Update Quantity (+/-)
  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty > item.stock) return item; // Mentok stok
          if (newQty < 1) return item; // Minimal 1
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  // Total item unik (atau total quantity jika mau)
  const cartCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
