'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import {
  CheckCircle,
  XCircle,
  Package,
  Plus,
  Archive,
  Users,
  MagnifyingGlass,
  Funnel,
  SortAscending,
  SortDescending,
} from '@phosphor-icons/react';

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE FILTER & SEARCH ---
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, PAID, CANCELLED
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest

  // 1. Fetch Data
  const fetchBookings = async () => {
    const token = Cookies.get('token');
    if (!token) return router.push('/login');

    try {
      const res = await fetch('${API_URL}/api/bookings', {
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

  // 2. LOGIKA FILTERING & SORTING 🧠
  const filteredBookings = bookings
    .filter((booking) => {
      // Filter Status
      if (filterStatus !== 'ALL' && booking.status !== filterStatus)
        return false;

      // Filter Search (ID atau Nama User)
      const query = search.toLowerCase();
      const matchId = String(booking.id).toLowerCase().includes(query); // Support UUID/Number
      const matchName = booking.user?.name?.toLowerCase().includes(query) || '';
      return matchId || matchName;
    })
    .sort((a, b) => {
      // Sort Tanggal
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // 3. Handle Update Status
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    const token = Cookies.get('token');
    const confirmMsg =
      newStatus === 'PAID' ? 'Tandai LUNAS?' : 'Batalkan pesanan?';
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        alert('Status diperbarui!');
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
        {/* HEADER */}
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
            <Link
              href="/admin/users"
              className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition flex items-center gap-2 text-sm shadow-sm"
            >
              <Users weight="bold" size={18} /> Users
            </Link>
            <Link
              href="/admin/gears"
              className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition flex items-center gap-2 text-sm shadow-sm"
            >
              <Archive weight="bold" size={18} /> Barang
            </Link>
            <Link
              href="/admin/gears/create"
              className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 transition flex items-center gap-2 text-sm shadow-lg shadow-slate-200"
            >
              <Plus weight="bold" size={18} /> Tambah
            </Link>
          </div>
        </div>

        {/* STATISTIK CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">
              {bookings.filter((b) => b.status === 'PAID').length}
            </div>
            <div>
              <p className="text-slate-500 text-sm">Sudah Lunas</p>
              <h3 className="text-lg font-bold">Pesanan Aktif</h3>
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

        {/* --- TOOLBAR FILTER & SEARCH --- */}
        <div className="bg-white p-4 rounded-t-3xl border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
          {/* Kiri: Search */}
          <div className="relative w-full md:w-1/3">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari ID atau Nama User..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition"
            />
          </div>

          {/* Kanan: Filter & Sort */}
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['ALL', 'PENDING', 'PAID', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterStatus === status
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {status === 'ALL' ? 'Semua' : status}
                </button>
              ))}
            </div>

            {/* Sort Button */}
            <button
              onClick={() =>
                setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')
              }
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition font-bold text-xs whitespace-nowrap"
            >
              {sortOrder === 'newest' ? (
                <SortDescending size={18} />
              ) : (
                <SortAscending size={18} />
              )}
              {sortOrder === 'newest' ? 'Terbaru' : 'Terlama'}
            </button>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-white rounded-b-3xl shadow-sm border border-slate-200 border-t-0 overflow-hidden">
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
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="p-4 font-mono font-bold text-slate-400 text-xs">
                        #{booking.id.toString().slice(0, 8)}...
                      </td>
                      <td className="p-4">
                        <div className="font-bold">{booking.user?.name}</div>
                        <div className="text-xs text-slate-400">
                          {booking.user?.email}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(booking.createdAt).toLocaleDateString(
                          'id-ID',
                          { day: 'numeric', month: 'short' }
                        )}
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
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/admin/bookings/${booking.id}`}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition"
                            title="Detail"
                          >
                            <MagnifyingGlass weight="bold" size={16} />
                          </Link>
                          {booking.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(booking.id, 'PAID')
                                }
                                className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-600 hover:text-white transition"
                              >
                                <CheckCircle weight="fill" size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(booking.id, 'CANCELLED')
                                }
                                className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-600 hover:text-white transition"
                              >
                                <XCircle weight="fill" size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info Jumlah Data */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 text-center">
            Menampilkan {filteredBookings.length} dari {bookings.length} total
            pesanan
          </div>
        </div>
      </div>
    </main>
  );
}
