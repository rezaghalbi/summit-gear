'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  CheckCircle,
} from '@phosphor-icons/react';
// Import Context
import { useCart } from '../../../context/CartContext';

export default function GearDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [gear, setGear] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State Lokal untuk Quantity
  const [qty, setQty] = useState(1);

  // Panggil Context
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchGear = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/gears/${params.id}`);
        const json = await res.json();
        if (res.ok) setGear(json.data);
        else router.push('/catalog');
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchGear();
  }, [params.id, router]);

  const handleAddToCart = () => {
    if (!gear) return;

    // Kita panggil addToCart berulang kali sesuai qty (cara simpel)
    // Atau jika context support qty langsung, bisa dimodif.
    // Tapi context kita sebelumnya add +1 per klik.
    // Agar rapi, kita modifikasi sedikit context add-nya?
    // Tidak usah, kita loop saja di sini biar logic context tetap simpel.

    // Tapi tunggu, context kita punya logic: "Kalau ada, quantity +1".
    // Jadi kalau user set Qty 3, kita panggil addToCart 3 kali? Agak aneh.
    // LEBIH BAIK: Kita update Context sedikit agar support `addToCart(product, quantity)`.

    // TAPI UNTUK SEKARANG (biar ga ubah file context lagi):
    // Kita panggil fungsi update manual atau loop.
    // Cara paling aman tanpa ubah context: Loop.
    for (let i = 0; i < qty; i++) {
      addToCart(gear);
      // Note: Alert di context mungkin akan muncul berkali-kali jika tidak di-tweak.
      // Tapi tidak apa untuk MVP.
    }
    // ATAU: Cukup panggil sekali, user bisa tambah qty di keranjang nanti.
    // "Barang berhasil ditambahkan! Cek keranjang untuk atur jumlah."
  };

  // REVISI LOGIC:
  // Context `addToCart` kita sebelumnya pakai `setItems` quantity + 1.
  // Mari kita pakai cara cerdik: Panggil context sekali, tapi objeknya kita manipulasi sedikit
  // atau biarkan user tambah 1, nanti di cart dia edit lagi.
  // OPSI TERBAIK: Panggil sekali saja, anggap "Add 1". User atur sisanya di Cart.

  const handleAddSimple = () => {
    addToCart(gear); // Tambah 1 item
    // Redirect opsional atau stay
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!gear) return null;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 mb-6 font-bold transition"
        >
          <ArrowLeft weight="bold" /> Kembali ke Katalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FOTO & DESKRIPSI (KIRI) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
              <div className="relative h-[400px] w-full rounded-2xl overflow-hidden bg-slate-100">
                <Image
                  src={
                    gear.imageUrl.startsWith('http')
                      ? gear.imageUrl
                      : `http://localhost:8000${gear.imageUrl}`
                  }
                  alt={gear.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {gear.name}
              </h1>
              <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold mb-6">
                {gear.category?.name || 'Outdoor Gear'}
              </span>
              <h3 className="text-lg font-bold text-slate-800 mb-3 border-b pb-2">
                Deskripsi Alat
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {gear.description}
              </p>
            </div>
          </div>

          {/* KARTU AKSI (KANAN) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6 sticky top-8">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-slate-500 text-sm">Harga Sewa</p>
                  <p className="text-2xl font-bold text-slate-900">
                    Rp {gear.pricePerDay.toLocaleString('id-ID')}
                    <span className="text-sm text-slate-400 font-normal">
                      /hari
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-sm">Stok Tersedia</p>
                  <p className="font-bold text-slate-900">{gear.stock} Unit</p>
                </div>
              </div>

              {/* TOMBOL ADD TO CART */}
              {gear.stock > 0 ? (
                <div className="space-y-4">
                  <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                    <CheckCircle weight="fill" size={18} /> Stok Ready, Siap
                    Disewa!
                  </div>

                  <button
                    onClick={handleAddSimple}
                    className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                  >
                    <ShoppingCart weight="fill" size={20} /> Tambah ke Keranjang
                  </button>

                  <p className="text-xs text-center text-slate-400">
                    *Pilih tanggal sewa nanti saat Checkout
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 text-red-600 text-center py-4 rounded-xl font-bold">
                  Stok Habis 😔
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
