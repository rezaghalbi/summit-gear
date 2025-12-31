'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Package, Calendar, Clock, User } from '@phosphor-icons/react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ambil Token
    const token = Cookies.get('token');
    const userCookie = Cookies.get('user');

    // Cek Token Kosong/Rusak
    if (!token || token === 'undefined') {
      console.log('Token invalid, redirect ke login');
      router.push('/login');
      return;
    }

    // Parse User Data
    if (userCookie && userCookie !== 'undefined') {
      try {
        setUser(JSON.parse(userCookie));
      } catch (e) {
        setUser({ name: 'User', email: 'user@example.com' });
      }
    }

    // 2. Fetch Data Booking
    async function fetchMyBookings() {
      try {
        console.log(
          'Mengambil data dengan token:',
          token?.substring(0, 10) + '...'
        );

        const res = await fetch(
          'http://localhost:8000/api/bookings/my-bookings',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401 || res.status === 403) {
          throw new Error('Sesi habis, silakan login ulang');
        }

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gagal Fetch: ${errText}`);
        }

        const responseJson = await res.json();
        // Backend Anda mengirim { data: [...] }, jadi kita ambil .data
        setBookings(responseJson.data || []);
      } catch (error) {
        console.error('Error Dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMyBookings();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'FINISHED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">
        Memuat data kamu...
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* HEADER PROFILE */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <User size={40} weight="fill" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Halo, {user?.name || 'Petualang'}! 👋
            </h1>
            <p className="text-slate-500">{user?.email}</p>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Package size={24} className="text-orange-600" /> Riwayat
              Penyewaan
            </h2>
            <Link
              href="/catalog"
              className="text-sm font-bold text-orange-600 hover:underline"
            >
              + Sewa Lagi
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 mb-6">
                Kamu belum pernah menyewa alat apapun.
              </p>
              <Link
                href="/catalog"
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
              >
                Mulai Petualangan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Barang</th>
                    <th className="p-4">Tanggal Sewa</th>
                    <th className="p-4">Total Harga</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => {
                    // Ambil item pertama sebagai perwakilan tampilan
                    const firstItem = booking.items && booking.items[0];
                    const gearName =
                      firstItem?.gear?.name || 'Item Tidak Dikenal';
                    const gearImage = firstItem?.gear?.imageUrl;

                    return (
                      <tr
                        key={booking.id}
                        className="hover:bg-slate-50 transition"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-200 border border-slate-200">
                              <Image
                                src={
                                  gearImage
                                    ? `http://localhost:8000${gearImage}`
                                    : 'https://placehold.co/100?text=No+Img'
                                }
                                alt="Alat"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {gearName}
                              </div>
                              {booking.items && booking.items.length > 1 && (
                                <div className="text-xs text-slate-400">
                                  +{booking.items.length - 1} alat lain
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />{' '}
                              {new Date(booking.startDate).toLocaleDateString(
                                'id-ID'
                              )}
                            </span>
                            <span className="text-xs text-slate-400">s/d</span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />{' '}
                              {new Date(booking.endDate).toLocaleDateString(
                                'id-ID'
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          Rp {booking.totalPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
