'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, MagnifyingGlass, Funnel } from '@phosphor-icons/react';
// Import Context
import { useCart } from '../../context/CartContext';
import { API_URL } from '@/lib/api';

export default function CatalogPage() {
  const [gears, setGears] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Panggil fungsi addToCart dari Context
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchGears = async () => {
      try {
        const res = await fetch('${API_URL}/api/gears');
        const json = await res.json();
        if (res.ok) setGears(json.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGears();
  }, []);

  // Filter Barang
  const filteredGears = gears.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Katalog Alat ⛺
            </h1>
            <p className="text-slate-500">Pilih perlengkapan petualanganmu</p>
          </div>
          <div className="relative w-full md:w-96">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari Tenda, Tas, Sepatu..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* GRID BARANG */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-400">
            Memuat Katalog...
          </div>
        ) : filteredGears.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            Barang tidak ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredGears.map((gear) => (
              <div
                key={gear.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition group overflow-hidden flex flex-col"
              >
                {/* GAMBAR */}
                <Link
                  href={`/catalog/${gear.id}`}
                  className="relative h-48 w-full bg-slate-100 block"
                >
                  {gear.imageUrl && (
                    <Image
                      src={
                        gear.imageUrl.startsWith('http')
                          ? gear.imageUrl
                          : `${API_URL}${gear.imageUrl}`
                      }
                      alt={gear.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      unoptimized
                    />
                  )}
                  {gear.stock < 1 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                      STOK HABIS
                    </div>
                  )}
                </Link>

                {/* INFO */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3
                      className="font-bold text-slate-900 line-clamp-1"
                      title={gear.name}
                    >
                      {gear.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-3">
                      {gear.category?.name || 'Outdoor'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-orange-600 font-bold">
                      Rp {gear.pricePerDay.toLocaleString('id-ID')}
                      <span className="text-xs text-slate-400">/hr</span>
                    </div>

                    {/* TOMBOL ADD TO CART MINI */}
                    <button
                      onClick={() => addToCart(gear)}
                      disabled={gear.stock < 1}
                      className="bg-slate-900 text-white p-2 rounded-lg hover:bg-orange-600 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                      title="Tambah ke Keranjang"
                    >
                      <ShoppingCart size={18} weight="fill" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
