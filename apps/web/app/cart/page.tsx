'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useCart } from '../../context/CartContext';
import { API_URL } from '@/lib/api';
import {
  Trash,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
} from '@phosphor-icons/react';

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart } = useCart(); // Ambil dari Global

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Hitung Durasi
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;

  // Hitung Total
  const subTotal = items.reduce(
    (acc, item) => acc + item.pricePerDay * item.quantity,
    0
  );
  const grandTotal = subTotal * (duration > 0 ? duration : 1);

  const handleCheckout = async () => {
    const token = Cookies.get('token');
    if (!token) return router.push('/login');
    if (items.length === 0) return alert('Keranjang kosong!');
    if (duration < 1) return alert('Minimal sewa 1 hari!');

    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          items: items.map((i) => ({ gearId: i.id, quantity: i.quantity })),
        }),
      });

      if (res.ok) {
        alert('✅ Order Berhasil Dibuat!');
        clearCart(); // Kosongkan keranjang
        router.push('/user/dashboard');
      } else {
        const json = await res.json();
        alert(json.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart size={40} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Keranjang Kosong</h1>
        <p className="text-slate-500 mb-6">Belum ada barang yang disewa.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold"
        >
          Cari Barang Dulu
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <ShoppingCart weight="fill" className="text-orange-600" /> Keranjang
          Sewa
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* LIST BARANG */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center"
              >
                {/* Gambar */}
                <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden relative flex-shrink-0">
                  <img
                    src={
                      item.imageUrl.startsWith('http')
                        ? item.imageUrl
                        : `${item.imageUrl}`
                    }
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500">
                    Rp {item.pricePerDay.toLocaleString()}/hari
                  </p>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center gap-3 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 hover:text-orange-600"
                  >
                    <Minus weight="bold" size={12} />
                  </button>
                  <span className="font-bold text-sm w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 hover:text-orange-600"
                  >
                    <Plus weight="bold" size={12} />
                  </button>
                </div>

                {/* Hapus */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-slate-300 hover:text-red-500 transition p-2"
                >
                  <Trash size={20} weight="bold" />
                </button>
              </div>
            ))}
          </div>

          {/* CHECKOUT CARD */}
          <div className="w-full md:w-96">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Ringkasan Sewa</h3>

              {/* Tanggal */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Mulai Sewa
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg bg-slate-50 text-sm font-bold"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Selesai Sewa
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg bg-slate-50 text-sm font-bold"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Kalkulasi */}
              <div className="space-y-2 text-sm mb-6 border-t pt-4 border-dashed">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Harga Barang</span>
                  <span className="font-bold">
                    Rp {subTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Durasi</span>
                  <span className="font-bold">{duration} Hari</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 mt-2 pt-2 border-t">
                  <span>Total Bayar</span>
                  <span className="text-orange-600">
                    Rp {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                Checkout <ArrowRight weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
