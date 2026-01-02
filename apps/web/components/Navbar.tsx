'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  User,
  SignOut,
  List,
  X,
  Mountains,
} from '@phosphor-icons/react';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = Cookies.get('token');
      const userCookie = Cookies.get('user');

      if (token && userCookie) {
        setIsLoggedIn(true);
        try {
          const user = JSON.parse(userCookie);
          setRole(user.role);
        } catch (e) {
          console.error(e);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    window.location.href = '/login';
  };

  const dashboardLink =
    role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard';

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        {/* LOGO BARU: SUMMIT GEAR */}
        <Link
          href="/"
          className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <Mountains size={22} weight="fill" />
          </div>
          Summit Gear.
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Beranda
          </Link>
          <Link
            href="/catalog"
            className="font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Katalog
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-4 border-l pl-8 border-slate-200">
              {/* IKON CART (Hanya User) */}
              {role === 'USER' && (
                <Link
                  href="/user/dashboard"
                  className="relative p-2 text-slate-600 hover:text-slate-900 transition"
                  title="Pesanan Saya"
                >
                  <ShoppingCart size={24} weight="bold" />
                </Link>
              )}

              {/* IKON AKUN */}
              <Link
                href={dashboardLink}
                className="flex items-center gap-2 text-slate-900 font-bold hover:text-slate-600 transition"
              >
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                  <User weight="fill" size={18} />
                </div>
                <span className="text-sm">Akun</span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-600 transition ml-2"
                title="Keluar"
              >
                <SignOut size={24} />
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                href="/login"
                className="font-bold text-slate-900 hover:text-slate-600 transition py-2"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 text-sm"
              >
                Daftar Sekarang
              </Link>
            </div>
          )}
        </div>

        <button
          className="md:hidden text-slate-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <List size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-lg absolute w-full">
          <Link href="/" className="block font-bold py-2">
            Beranda
          </Link>
          <Link href="/catalog" className="block font-bold py-2">
            Katalog
          </Link>
          {isLoggedIn && (
            <Link
              href={dashboardLink}
              className="block font-bold text-slate-900 py-2"
            >
              Dashboard Saya
            </Link>
          )}
          {!isLoggedIn && (
            <Link href="/login" className="block font-bold py-2">
              Masuk
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
