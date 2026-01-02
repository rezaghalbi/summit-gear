'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  User,
  Envelope,
  CheckCircle,
  XCircle,
  Receipt,
} from '@phosphor-icons/react';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Detail Booking
  const fetchBookingDetail = async () => {
    const token = Cookies.get('token');
    try {
      const res = await fetch(
        `http://localhost:8000/api/bookings/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Cek error sebelum parse JSON
      if (!res.ok) {
        alert('Booking tidak ditemukan atau terjadi kesalahan.');
        router.push('/admin/dashboard');
        return;
      }

      const json = await res.json();
      setBooking(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchBookingDetail();
  }, [params.id]);

  // 2. Fungsi Update Status
  const handleUpdateStatus = async (newStatus: string) => {
    const token = Cookies.get('token');
    const confirmMsg =
      newStatus === 'PAID'
        ? 'Konfirmasi Pembayaran Diterima?'
        : 'Batalkan Pesanan ini?';
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/bookings/${params.id}/status`,
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
        fetchBookingDetail(); // Refresh data
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat Struk...
      </div>
    );
  if (!booking) return null;

  // Hitung durasi hari
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* --- TOMBOL KEMBALI (BACK BUTTON) --- */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-bold transition bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft weight="bold" /> Kembali ke Dashboard
        </Link>
        {/* ------------------------------------ */}

        {/* KARTU UTAMA (STRUK) */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header Struk */}
          <div className="bg-slate-900 text-white p-8 flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">
                INVOICE
              </p>
              <h1 className="text-3xl font-mono font-bold">#{booking.id}</h1>
              <div className="mt-4 flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-slate-900 bg-white`}
                >
                  Status: {booking.status}
                </span>
              </div>
            </div>
            <Receipt size={48} className="text-slate-700" weight="duotone" />
          </div>

          <div className="p-8">
            {/* Info User & Tanggal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">
                  Penyewa
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <User size={20} weight="fill" className="text-slate-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {booking.user?.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {booking.user?.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm pl-12">
                  <Envelope size={16} /> {booking.user?.email}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">
                  Detail Sewa
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={24} className="text-orange-600" />
                    <div>
                      <p className="font-bold text-slate-900">
                        {startDate.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-slate-400">Tanggal Ambil</p>
                    </div>
                  </div>
                  <div className="pl-9 text-xs font-bold text-slate-400">
                    ↓ {diffDays} Hari Sewa
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={24} className="text-slate-900" />
                    <div>
                      <p className="font-bold text-slate-900">
                        {endDate.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-slate-400">Tanggal Kembali</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabel Barang */}
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">
              Barang yang Disewa
            </h3>
            <div className="border rounded-xl overflow-hidden mb-8">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4">Nama Barang</th>
                    <th className="p-4 text-right">Harga/Hari</th>
                    <th className="p-4 text-center">Qty</th>
                    <th className="p-4 text-right">Durasi</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {booking.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden relative">
                          {item.gear?.imageUrl && (
                            <Image
                              src={
                                item.gear.imageUrl.startsWith('http')
                                  ? item.gear.imageUrl
                                  : `http://localhost:8000${item.gear.imageUrl}`
                              }
                              fill
                              className="object-cover"
                              alt="gear"
                              unoptimized
                            />
                          )}
                        </div>
                        {item.gear?.name}
                      </td>
                      <td className="p-4 text-right">
                        Rp {item.gear?.pricePerDay.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right">{diffDays} Hari</td>
                      <td className="p-4 text-right font-bold">
                        Rp{' '}
                        {(
                          item.gear?.pricePerDay *
                          item.quantity *
                          diffDays
                        ).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold text-slate-900">
                  <tr>
                    <td colSpan={4} className="p-4 text-right">
                      TOTAL TAGIHAN
                    </td>
                    <td className="p-4 text-right text-lg text-orange-600">
                      Rp {booking.totalPrice.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Action Buttons */}
            {booking.status === 'PENDING' && (
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleUpdateStatus('PAID')}
                  className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={24} weight="fill" /> Terima Pembayaran
                  (LUNAS)
                </button>
                <button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="flex-1 bg-red-100 text-red-600 py-4 rounded-xl font-bold hover:bg-red-200 transition flex items-center justify-center gap-2"
                >
                  <XCircle size={24} weight="fill" /> Tolak Pesanan
                </button>
              </div>
            )}

            {booking.status === 'PAID' && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2 border border-green-200">
                <CheckCircle size={24} weight="fill" /> Pesanan Selesai & Lunas
              </div>
            )}
            {booking.status === 'CANCELLED' && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2 border border-red-200">
                <XCircle size={24} weight="fill" /> Pesanan Dibatalkan
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
