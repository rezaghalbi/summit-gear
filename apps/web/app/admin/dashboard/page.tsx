'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
} from '@phosphor-icons/react';

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 1. Ambil Data Semua Booking
  const fetchBookings = async () => {
    const token = Cookies.get('token');
    const userCookie = Cookies.get('user');

    // A. Cek Login
    if (!token || !userCookie) {
      return router.push('/login');
    }

    // B. Cek Role Admin
    try {
      const user = JSON.parse(userCookie);
      if (user.role !== 'ADMIN') {
        alert('⛔ Akses Ditolak! Halaman ini khusus Admin.');
        return router.push('/dashboard');
      }
    } catch (e) {
      return router.push('/login');
    }

    // C. FETCH DATA KE BACKEND (Bagian ini yang tadi hilang)
    try {
      const res = await fetch('http://localhost:8000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setBookings(data.data || []);
    } catch (error) {
      console.error('Gagal ambil data admin:', error);
    } finally {
      // D. MATIKAN LOADING (Penting!)
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 2. Fungsi Update Status (Terima/Tolak)
  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: 'APPROVED' | 'REJECTED'
  ) => {
    const token = Cookies.get('token');
    if (!confirm(`Yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    setProcessingId(bookingId);

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

      if (!res.ok) throw new Error('Gagal update status');

      await fetchBookings(); // Refresh data
      alert(`Berhasil! Status booking kini: ${newStatus}`);
    } catch (error) {
      alert('Gagal mengupdate status.');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">
        Memuat Data Admin...
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Admin Dashboard 👮‍♂️
            </h1>
            <p className="text-slate-500">Kelola semua penyewaan masuk</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-slate-700">
            Total Order: {bookings.length}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Barang Sewaan</th>
                  <th className="p-4">Jadwal</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => {
                  const firstItem = booking.items?.[0];

                  return (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      {/* PELANGGAN */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                            <User weight="bold" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {booking.user?.name || 'User'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {booking.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* BARANG */}
                      <td className="p-4">
                        <div className="font-medium text-slate-800">
                          {firstItem?.gear?.name || 'Unknown'}
                        </div>
                        {booking.items.length > 1 && (
                          <span className="text-xs text-slate-400">
                            +{booking.items.length - 1} lainnya
                          </span>
                        )}
                      </td>

                      {/* JADWAL */}
                      <td className="p-4 text-slate-600">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="flex items-center gap-1">
                            Start:{' '}
                            {new Date(booking.startDate).toLocaleDateString(
                              'id-ID'
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            End:{' '}
                            {new Date(booking.endDate).toLocaleDateString(
                              'id-ID'
                            )}
                          </span>
                        </div>
                      </td>

                      {/* TOTAL */}
                      <td className="p-4 font-bold text-slate-900">
                        Rp {booking.totalPrice.toLocaleString('id-ID')}
                      </td>

                      {/* STATUS */}
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      {/* AKSI (Hanya muncul jika PENDING) */}
                      <td className="p-4">
                        {booking.status === 'PENDING' ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                handleUpdateStatus(booking.id, 'APPROVED')
                              }
                              disabled={!!processingId}
                              className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200 transition disabled:opacity-50"
                              title="Terima (Approve)"
                            >
                              <CheckCircle size={20} weight="fill" />
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(booking.id, 'REJECTED')
                              }
                              disabled={!!processingId}
                              className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 transition disabled:opacity-50"
                              title="Tolak (Reject)"
                            >
                              <XCircle size={20} weight="fill" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-slate-400 italic">
                            Selesai
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
