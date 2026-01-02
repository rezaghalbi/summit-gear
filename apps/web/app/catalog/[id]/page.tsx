'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { ArrowLeft, Calendar, ShoppingBag } from '@phosphor-icons/react';

export default function GearDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [gear, setGear] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State Form Booking
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  // 1. Ambil Data Barang
  useEffect(() => {
    const fetchGear = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/gears/${params.id}`);
        const json = await res.json();
        if (res.ok) {
          setGear(json.data);
        } else {
          alert('Barang tidak ditemukan!');
          router.push('/');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchGear();
  }, [params.id, router]);

  // 2. Hitung Estimasi Harga (Frontend Only)
  useEffect(() => {
    if (startDate && endDate && gear) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const duration = diffDays === 0 ? 1 : diffDays;
      setTotalPrice(duration * gear.pricePerDay);
    }
  }, [startDate, endDate, gear]);

  // 3. Handle Booking (Kirim ke Backend)
  const handleBooking = async () => {
    const token = Cookies.get('token');

    if (!token) {
      const confirmLogin = confirm('Anda belum login. Mau login sekarang?');
      if (confirmLogin) router.push('/login');
      return;
    }

    if (!startDate || !endDate) {
      alert('⚠️ Harap pilih Tanggal Mulai dan Selesai dulu!');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('⚠️ Tanggal selesai tidak boleh mendahului tanggal mulai!');
      return;
    }

    try {
      const confirmBooking = confirm(
        `Sewa alat ini?\nTotal Estimasi: Rp ${totalPrice.toLocaleString(
          'id-ID'
        )}`
      );
      if (!confirmBooking) return;

      // PAYLOAD SESUAI BACKEND ANDA
      const payload = {
        startDate: startDate,
        endDate: endDate,
        items: [
          {
            gearId: gear.id,
            quantity: 1, // Default 1 unit
          },
        ],
      };

      const res = await fetch('http://localhost:8000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Gagal melakukan booking');
      }

      alert('✅ Booking Berhasil! Silakan cek Dashboard.');
      router.push('/user/dashboard');
    } catch (error: any) {
      console.error(error);
      alert(`❌ Error: ${error.message}`);
    }
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
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 mb-6 font-medium transition"
        >
          <ArrowLeft weight="bold" /> Kembali ke Katalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri: Info Barang */}
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

          {/* Kolom Kanan: Form Booking */}
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
                  <p className="text-slate-500 text-sm">Stok</p>
                  <p className="font-bold text-slate-900">{gear.stock} Unit</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mulai Sewa
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={20}
                    />
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-orange-500 outline-none"
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Selesai Sewa
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={20}
                    />
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-orange-500 outline-none"
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {totalPrice > 0 && (
                <div className="bg-orange-50 p-4 rounded-xl flex justify-between items-center mb-6 border border-orange-100">
                  <span className="text-orange-800 font-medium">
                    Total Estimasi
                  </span>
                  <span className="text-orange-900 font-bold text-lg">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <button
                onClick={handleBooking}
                className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
              >
                <ShoppingBag weight="fill" size={20} /> Sewa Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
