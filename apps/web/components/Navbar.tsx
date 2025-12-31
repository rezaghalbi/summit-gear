'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, SignOut } from '@phosphor-icons/react'; // Import Icon

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

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

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  if (!isMounted)
    return <nav className="h-16 border-b border-slate-200 bg-white" />;

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
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
            // --- JIKA LOGIN: Tampilkan Link Dashboard & Logout ---
            <div className="flex items-center gap-2">
              {/* LINK KE DASHBOARD */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition group"
                title="Ke Dashboard Saya"
              >
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition">
                  <User size={18} weight="bold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 leading-none">
                    Halo,
                  </span>
                  <span className="text-sm font-bold text-slate-700 leading-none group-hover:text-orange-600">
                    {user.name.split(' ')[0]}{' '}
                    {/* Ambil nama depan saja biar rapi */}
                  </span>
                </div>
              </Link>

              <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

              {/* TOMBOL LOGOUT */}
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"
                title="Keluar"
              >
                <SignOut size={20} weight="bold" />
              </button>
            </div>
          ) : (
            // --- JIKA BELUM LOGIN ---
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
  );
}
