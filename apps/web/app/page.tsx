'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MagnifyingGlass, Funnel, ArrowRight } from '@phosphor-icons/react';

export default function Home() {
  const [gears, setGears] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // State untuk Filter
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Ambil Daftar Kategori (Sekali saja saat load)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categories');
        const json = await res.json();
        if (res.ok) setCategories(json.data);
      } catch (err) {
        console.error('Gagal load kategori', err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Ambil Barang (Dipanggil saat Search / Kategori berubah)
  useEffect(() => {
    const fetchGears = async () => {
      setIsLoading(true);
      try {
        // Susun URL Query
        // Contoh hasil: /api/gears?search=tenda&cat=1
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCat) params.append('cat', selectedCat);

        const res = await fetch(
          `http://localhost:8000/api/gears?${params.toString()}`
        );
        const json = await res.json();

        if (res.ok) {
          setGears(json.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce (Jeda sedikit agar tidak spam API saat mengetik cepat)
    const timeoutId = setTimeout(() => {
      fetchGears();
    }, 500); // Tunggu 500ms setelah user selesai mengetik

    return () => clearTimeout(timeoutId);
  }, [search, selectedCat]); // Jalankan ulang jika search / selectedCat berubah

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO SECTION */}
      <section className="bg-slate-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Jelajahi Alam <span className="text-orange-500">Tanpa Batas.</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
            Sewa peralatan camping & hiking terbaik dengan harga terjangkau.
            Persiapkan petualanganmu sekarang juga.
          </p>

          {/* SEARCH BAR */}
          <div className="bg-white p-2 rounded-full max-w-xl mx-auto flex items-center shadow-2xl shadow-orange-900/20">
            <div className="pl-4 text-slate-400">
              <MagnifyingGlass size={24} weight="bold" />
            </div>
            <input
              type="text"
              placeholder="Cari barang (misal: Tenda, Tas)..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-slate-900 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-700 transition">
              Cari
            </button>
          </div>
        </div>

        {/* Background Pattern (Hiasan) */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-[-10%] top-[-10%] w-[500px] h-[500px] bg-orange-500 rounded-full blur-[120px]"></div>
          <div className="absolute left-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px]"></div>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section className="container mx-auto max-w-6xl py-12 px-4">
        {/* FILTER KATEGORI */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          <button
            onClick={() => setSelectedCat('')}
            className={`px-5 py-2 rounded-full font-bold text-sm transition border ${
              selectedCat === ''
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-900'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(String(cat.id))}
              className={`px-5 py-2 rounded-full font-bold text-sm transition border ${
                selectedCat === String(cat.id)
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-slate-200 border-t-orange-600 rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Mencari perlengkapan...</p>
          </div>
        ) : gears.length === 0 ? (
          // EMPTY STATE
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-xl font-bold text-slate-700">
              Barang tidak ditemukan 😔
            </p>
            <p className="text-slate-400">
              Coba kata kunci lain atau reset filter.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCat('');
              }}
              className="mt-4 text-orange-600 font-bold hover:underline"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          // GRID BARANG
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {gears.map((gear) => (
              <Link
                href={`/catalog/${gear.id}`}
                key={gear.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                {/* Image Container */}
                <div className="relative h-64 bg-slate-100 overflow-hidden">
                  {gear.imageUrl ? (
                    <Image
                      src={
                        gear.imageUrl.startsWith('http')
                          ? gear.imageUrl
                          : `http://localhost:8000${gear.imageUrl}`
                      }
                      alt={gear.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      unoptimized // Biar localhost aman
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      No Image
                    </div>
                  )}
                  {/* Badge Category */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                    {gear.category?.name || 'Umum'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition">
                    {gear.name}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
                    {gear.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold">
                        Harga Sewa
                      </span>
                      <p className="text-orange-600 font-bold text-lg">
                        Rp {gear.pricePerDay.toLocaleString('id-ID')}
                        <span className="text-xs text-slate-400 font-normal">
                          /hari
                        </span>
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition">
                      <ArrowRight weight="bold" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
