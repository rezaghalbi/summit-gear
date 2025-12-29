'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Gear } from '@/types/gear';

export default function CatalogPage() {
  const [gears, setGears] = useState<Gear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Tambah state untuk pesan error

  useEffect(() => {
    async function fetchGears() {
      try {
        console.log('Mencoba mengambil data...');

        const res = await fetch('http://localhost:8000/api/gears');

        if (!res.ok) {
          throw new Error(`Gagal Fetch: ${res.status} ${res.statusText}`);
        }

        const responseJson = await res.json(); // Ganti nama variabel biar jelas
        console.log('Data mentah dari backend:', responseJson);

        // --- PERBAIKAN UTAMA DI SINI ---
        // Kita ambil .data. Jika kosong, kita kasih array kosong [] biar tidak error .map
        const gearsArray = responseJson.data || [];

        setGears(gearsArray);
      } catch (err: any) {
        console.error('🔥 ERROR PARAH:', err);
        setError(err.message || 'Gagal mengambil data dari server');
      } finally {
        setLoading(false);
      }
    }

    fetchGears();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold animate-pulse text-orange-600">
          Sedang Memuat Data...
        </div>
      </div>
    );

  // Jika Error, tampilkan pesan merah, jangan loading terus
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center max-w-md">
          <h3 className="font-bold text-lg mb-2">Terjadi Kesalahan</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
        <p className="mt-4 text-slate-500 text-sm">
          Pastikan Server Backend (port 8000) sudah menyala.
        </p>
      </div>
    );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Katalog Alat</h1>
          <p className="text-slate-500 mt-2">
            Pilih perlengkapan terbaik untuk petualanganmu
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {gears.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* GAMBAR */}
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <Image
                src={
                  item.imageUrl
                    ? `http://localhost:8000${item.imageUrl}`
                    : 'https://placehold.co/600x400?text=No+Image'
                }
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-700">
                {item.category?.name || 'Outdoor'}
              </div>
            </div>

            {/* KONTEN */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-slate-900 mb-1 truncate">
                {item.name}
              </h3>
              <p className="text-orange-600 font-bold mb-3">
                Rp {item.pricePerDay.toLocaleString('id-ID')}
                <span className="text-xs text-slate-500 font-normal">
                  {' '}
                  / hari
                </span>
              </p>

              <Link
                href={`/catalog/${item.id}`}
                className="block w-full bg-slate-900 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
              >
                Lihat Detail
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
