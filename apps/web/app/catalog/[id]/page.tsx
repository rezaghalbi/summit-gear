'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CaretLeft, Calendar } from '@phosphor-icons/react';
import { Gear } from '@/types/gear';

export default function DetailPage() {
  const params = useParams();
  const [gear, setGear] = useState<Gear | null>(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  // --- LOGIKA VALIDASI TANGGAL ---
  // 1. Dapatkan tanggal hari ini (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function fetchGear() {
      try {
        const res = await fetch(`http://localhost:8000/api/gears/${params.id}`);
        const responseJson = await res.json();
        setGear(responseJson.data);
      } catch (error) {
        console.error('Gagal ambil data:', error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchGear();
  }, [params.id]);

  useEffect(() => {
    if (startDate && endDate && gear) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validasi Tambahan: Jika End Date sebelum Start Date, reset harga
      if (end < start) {
        setTotalPrice(0);
        return;
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      setTotalPrice(diffDays * gear.pricePerDay);
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, gear]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!gear)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Barang tidak ditemukan
      </div>
    );

  return (
    <main className="container mx-auto px-4 py-8">
      <Link
        href="/catalog"
        className="inline-flex items-center text-slate-500 hover:text-orange-600 mb-6"
      >
        <CaretLeft size={20} className="mr-2" /> Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* GAMBAR */}
        <div className="relative h-[400px] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
          <Image
            src={`http://localhost:8000${gear.imageUrl}`}
            alt={gear.name}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        </div>

        {/* DETAIL & FORM */}
        <div>
          <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
            {gear.category?.name || 'Outdoor'}
          </span>

          <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-2">
            {gear.name}
          </h1>
          <p className="text-2xl font-semibold text-orange-600 mb-6">
            Rp {gear.pricePerDay.toLocaleString('id-ID')}{' '}
            <span className="text-sm text-slate-500 font-normal">/ hari</span>
          </p>
          <p className="text-slate-600 leading-relaxed mb-8">
            {gear.description || 'Tidak ada deskripsi.'}
          </p>

          {/* FORM BOOKING */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-orange-600" /> Atur Jadwal
              Sewa
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Mulai
                </label>
                {/* VALIDASI 1: Min = Hari Ini */}
                <input
                  type="date"
                  min={today}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Selesai
                </label>
                {/* VALIDASI 2: Min = Tanggal Mulai (Kalau belum pilih mulai, pakai hari ini) */}
                <input
                  type="date"
                  min={startDate || today}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-t border-dashed border-slate-200 mb-4">
              <span className="text-slate-500">Total Estimasi</span>
              <span className="text-xl font-bold text-slate-900">
                Rp {totalPrice.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Tombol disabled jika tanggal belum lengkap ATAU Total 0 (karena tanggal salah) */}
            <button
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!startDate || !endDate || totalPrice <= 0}
              onClick={() => alert('Fitur booking akan segera aktif!')}
            >
              Sewa Sekarang
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
