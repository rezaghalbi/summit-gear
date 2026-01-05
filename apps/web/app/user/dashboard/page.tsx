'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Package, Clock, CheckCircle } from '@phosphor-icons/react';
import { API_URL } from '@/lib/api';

export default function UserDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil Data Booking User
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) return router.push('/login');

    const fetchMyBookings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (res.ok) {
          setBookings(json.data);
        }
      } catch (error) {
        console.error('Gagal ambil data booking', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyBookings();
  }, [router]);

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
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard Saya 👋
            </h1>
            <p className="text-slate-500">
              Riwayat penyewaan alat outdoor Anda
            </p>
          </div>
          <button
            onClick={() => {
              Cookies.remove('token');
              router.push('/login');
            }}
            className="text-red-500 text-sm font-bold hover:underline"
          >
            Logout
          </button>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <p className="text-center py-10">Memuat data...</p>
          ) : bookings.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl text-center border border-slate-200">
              <Package size={48} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 font-medium">Belum ada penyewaan.</p>
              <p className="text-slate-400 text-sm mb-4">
                Yuk sewa alat outdoor pertamamu!
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition"
              >
                {/* Header Kartu */}
                <div className="flex justify-between items-start mb-4 border-b pb-4 border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Order ID: #{booking.id}
                    </p>
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status === 'PENDING' && <Clock weight="bold" />}
                      {booking.status === 'PAID' && (
                        <CheckCircle weight="bold" />
                      )}
                      {booking.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total Tagihan</p>
                    <p className="text-xl font-bold text-slate-900">
                      Rp {booking.totalPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* List Barang */}
                <div className="space-y-4">
                  {booking.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                        {item.gear.imageUrl && (
                          <Image
                            src={`${API_URL}${item.gear.imageUrl}`}
                            alt={item.gear.name}
                            fill
                            className="object-cover"
                            unoptimized //
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">
                          {item.gear.name}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {item.quantity} unit x Rp{' '}
                          {item.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Kartu */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-orange-500" weight="fill" />
                    {new Date(booking.startDate).toLocaleDateString(
                      'id-ID'
                    )} - {new Date(booking.endDate).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
