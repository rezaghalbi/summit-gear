'use client';

import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie'; // Import Cookies
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Cek status login saat halaman dimuat
  useEffect(() => {
    setIsMounted(true);
    const userCookie = Cookies.get('user');

    // PENGAMAN GANDA
    if (userCookie && userCookie !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userCookie);
        setUser(parsedUser);
      } catch (error) {
        console.error('Cookie rusak ditemukan, menghapus...', error);
        Cookies.remove('user'); // Hapus otomatis biar gak crash lagi
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    // Hapus Token & User dari Cookie
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    router.push('/login');
    router.refresh(); // Refresh agar tampilan update
  };

  // Agar tidak error hydration, tampilkan default sebelum mounted
  if (!isMounted) return null;

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Summit<span className="text-orange-600">Gear</span>
          </span>
        </Link>

        {/* MENU TENGAH */}
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
          <Link
            href="#"
            className="text-sm font-medium text-slate-600 hover:text-orange-600 transition"
          >
            Tentang Kami
          </Link>
        </div>

        {/* MENU KANAN (LOGIC LOGIN/LOGOUT) */}
        <div className="flex items-center gap-4">
          {user ? (
            // JIKA SUDAH LOGIN
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700">
                Hi, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 font-medium hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            // JIKA BELUM LOGIN
            <>
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 font-medium text-sm"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
