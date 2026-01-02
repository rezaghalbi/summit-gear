'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Package,
  Plus,
  Archive,
} from '@phosphor-icons/react';

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Data (Sama seperti sebelumnya)
  const fetchBookings = async () => {
    const token = Cookies.get('token');
    if (!token) return router.push('/login');

    try {
      const res = await fetch('http://localhost:8000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setBookings(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [router]);

  // 2. Handle Status Update (Sama seperti sebelumnya)
  const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
    const token = Cookies.get('token');
    const confirmMsg =
      newStatus === 'PAID'
        ? 'Tandai pesanan ini LUNAS?'
        : 'Batalkan pesanan ini?';
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/bookings/${bookingId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        alert('Status berhasil diperbarui!');
        fetchBookings();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* HEADER DASHBOARD */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Dashboard 👮‍♂️
            </h1>
            <p className="text-slate-500">
              Pantau pesanan dan kelola inventaris
            </p>
          </div>

          <div className="flex gap-3">
            {/* --- TOMBOL BARU: KELOLA BARANG --- */}
            <Link
              href="/admin/gears"
              className="bg-white text-slate-700 border border-slate-300 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2 shadow-sm"
            >
              <Archive weight="bold" size={18} /> Kelola Barang
            </Link>

            {/* Tombol Tambah Barang */}
            <Link
              href="/admin/gears/create"
              className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-lg shadow-slate-200"
            >
              <Plus weight="bold" size={18} /> Tambah Baru
            </Link>

            {/* Logout */}
            <button
              onClick={() => {
                Cookies.remove('token');
                router.push('/login');
              }}
              className="px-5 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* --- STATISTIK & TABEL (Sama seperti kode sebelumnya) --- */}
        {/* Copy bagian statistik dan tabel di bawah ini dari file sebelumnya, 
            karena tidak ada perubahan logika di bagian bawah sini. */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Statistik Cards... */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl">
              {bookings.filter((b) => b.status === 'PENDING').length}
            </div>
            <div>
              <p className="text-slate-500 text-sm">Perlu Diproses</p>
              <h3 className="text-lg font-bold">Pesanan Baru</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Package size={24} weight="fill" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Total Transaksi</p>
              <h3 className="text-lg font-bold">{bookings.length} Order</h3>
            </div>
          </div>
        </div>

        {/* Tabel Pesanan */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">
              Daftar Pesanan Masuk
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-bold">ID</th>
                  <th className="p-4 font-bold">Penyewa</th>
                  <th className="p-4 font-bold">Tanggal</th>
                  <th className="p-4 font-bold">Total</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      Memuat...
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="p-4 font-mono font-bold text-slate-400">
                        #{booking.id}
                      </td>
                      <td className="p-4 font-bold">{booking.user?.name}</td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(booking.startDate).toLocaleDateString(
                          'id-ID'
                        )}{' '}
                        -{' '}
                        {new Date(booking.endDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        Rp {booking.totalPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {booking.status === 'PENDING' && (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                handleUpdateStatus(booking.id, 'PAID')
                              }
                              className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-600 hover:text-white transition"
                            >
                              <CheckCircle weight="fill" />
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(booking.id, 'CANCELLED')
                              }
                              className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-600 hover:text-white transition"
                            >
                              <XCircle weight="fill" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
