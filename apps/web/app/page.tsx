'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MagnifyingGlass,
  ArrowRight,
  ShoppingCart,
} from '@phosphor-icons/react';

export default function LandingPage() {
  const [gears, setGears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data barang dari API Public yang baru kita buat
  useEffect(() => {
    async function fetchGears() {
      try {
        const res = await fetch('http://localhost:8000/api/gears');
        const data = await res.json();
        setGears(data.data || []);
      } catch (error) {
        console.error('Gagal ambil data katalog:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchGears();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* --- HERO SECTION --- */}
      <section className="relative h-[500px] flex items-center bg-slate-900 overflow-hidden">
        {/* Background Image Gelap */}
        <div className="absolute inset-0 z-0 opacity-50">
          <Image
            src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2070&auto=format&fit=crop"
            alt="Camping Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Jelajahi Alam <br /> Tanpa Batas
          </h1>
          <p className="text-lg text-slate-200 mb-8 max-w-2xl mx-auto">
            Sewa peralatan camping premium dengan harga terjangkau. Persiapkan
            petualanganmu sekarang juga.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="#katalog"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-bold transition flex items-center gap-2"
            >
              Mulai Sewa <ArrowRight weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- SEARCH & KATALOG --- */}
      <section id="katalog" className="py-16 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Pilihan Alat Terbaik
            </h2>
            <p className="text-slate-500 mt-1">Siap menemani perjalananmu</p>
          </div>

          {/* Search Bar Sederhana */}
          <div className="relative w-full md:w-80">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari tenda, tas, sepatu..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        {/* GRID BARANG */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold">
            Memuat Katalog...
          </div>
        ) : gears.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {gears.map((item) => (
              <div
                key={item.id}
                className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition duration-300 flex flex-col h-full"
              >
                {/* Gambar */}
                <div className="relative h-64 bg-slate-100 overflow-hidden">
                  <Image
                    src={
                      item.imageUrl
                        ? `http://localhost:8000${item.imageUrl}`
                        : 'https://placehold.co/400x400?text=No+Image'
                    }
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                    unoptimized
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                    Stok: {item.stock}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">
                    {item.description || 'Deskripsi alat belum tersedia.'}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Harga Sewa</span>
                      <span className="text-lg font-bold text-orange-600">
                        Rp {item.pricePerDay.toLocaleString('id-ID')}
                        <span className="text-xs text-slate-500 font-normal">
                          /hari
                        </span>
                      </span>
                    </div>
                    {/* Tombol Add (Sementara link ke Login/Detail) */}
                    <Link
                      href="/catalog"
                      className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition shadow-lg"
                    >
                      <ShoppingCart weight="fill" size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <h3 className="text-xl font-bold text-slate-700">
              Belum ada barang
            </h3>
            <p className="text-slate-500">
              Admin belum menambahkan stok barang apapun.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
