'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, SignOut, WarningCircle } from '@phosphor-icons/react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // State untuk mengontrol muncul/tidaknya Modal Konfirmasi
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const userCookie = Cookies.get('user');

    if (userCookie && userCookie !== 'undefined') {
      try {
        setUser(JSON.parse(userCookie));
      } catch (error) {
        Cookies.remove('user');
      }
    }
  }, []);

  // Fungsi Eksekusi Logout (Dijalankan jika user klik "Ya")
  const handleConfirmLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    setShowLogoutModal(false); // Tutup modal

    // Refresh halaman dan arahkan ke login
    window.location.href = '/login';
  };

  if (!isMounted)
    return <nav className="h-16 border-b border-slate-200 bg-white" />;

  return (
    <>
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* 1. LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:rotate-12 transition">
              S
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Summit<span className="text-orange-600">Gear</span>
            </span>
          </Link>

          {/* 2. MENU TENGAH */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/catalog"
              className="text-sm font-medium text-slate-600 hover:text-orange-600 transition"
            >
              Katalog Alat
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-slate-600 hover:text-orange-600 transition"
            >
              Cara Sewa
            </Link>
          </div>

          {/* 3. MENU KANAN (USER AREA) */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                {/* LINK DASHBOARD */}
                <Link
                  href={
                    user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
                  }
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition group"
                  title="Ke Dashboard"
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition">
                    <User size={18} weight="bold" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 leading-none">
                      Halo,
                    </span>
                    <span className="text-sm font-bold text-slate-700 leading-none group-hover:text-orange-600">
                      {user.name ? user.name.split(' ')[0] : 'User'}
                    </span>
                  </div>
                </Link>

                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

                {/* TOMBOL LOGOUT (Hanya Membuka Modal) */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="text-slate-400 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"
                  title="Keluar"
                >
                  <SignOut size={20} weight="bold" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-slate-900 font-medium text-sm"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition hover:shadow-lg"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- MODAL KONFIRMASI LOGOUT --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <WarningCircle size={32} weight="fill" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Konfirmasi Keluar
              </h3>
              <p className="text-sm text-slate-500">
                Apakah Anda yakin ingin keluar dari akun ini? Anda harus login
                kembali untuk menyewa alat.
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex border-t border-slate-100">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition border-r border-slate-100"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
