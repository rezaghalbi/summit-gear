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
  UserGear,
  Package,
} from '@phosphor-icons/react';
// 1. IMPORT CONTEXT
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // 2. AMBIL DATA CART DARI CONTEXT
  const { cartCount } = useCart();

  useEffect(() => {
    const checkLogin = () => {
      const token = Cookies.get('token');
      const userCookie = Cookies.get('user');

      if (token && userCookie) {
        setIsLoggedIn(true);
        try {
          const user = JSON.parse(userCookie);
          setRole(user.role);
          setUserName(user.name || 'User');
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
        {/* LOGO */}
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

          {/* ICON KERANJANG (CART) - MUNCUL UNTUK SEMUA USER (KECUALI ADMIN) */}
          {role !== 'ADMIN' && (
            <Link
              href="/cart"
              className="relative p-2 text-slate-600 hover:text-orange-600 transition group"
              title="Keranjang Belanja"
            >
              <ShoppingCart size={24} weight="bold" />
              {/* BADGE ANGKA */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-4 border-l pl-8 border-slate-200">
              {/* DASHBOARD LINK */}
              <Link
                href={dashboardLink}
                className="flex items-center gap-2 font-bold text-slate-700 hover:text-slate-900 transition"
                title="Dashboard Saya"
              >
                {role === 'ADMIN' ? (
                  <Package size={20} weight="fill" />
                ) : (
                  <Package size={20} />
                )}
                <span>{role === 'ADMIN' ? 'Dashboard' : 'Pesanan Saya'}</span>
              </Link>

              {/* PROFILE LINK */}
              <Link
                href="/user/profile"
                className="flex items-center gap-2 bg-slate-50 py-1.5 px-3 rounded-full border border-slate-100 hover:bg-slate-100 transition"
                title="Edit Profile"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-900">
                  <User weight="fill" size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate">
                  {userName}
                </span>
              </Link>

              {/* LOGOUT */}
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
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU BTN */}
        <button
          className="md:hidden text-slate-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <List size={28} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-lg absolute w-full z-40">
          <Link href="/" className="block font-bold py-2 text-slate-600">
            Beranda
          </Link>
          <Link href="/catalog" className="block font-bold py-2 text-slate-600">
            Katalog
          </Link>

          {/* CART MOBILE */}
          {role !== 'ADMIN' && (
            <Link
              href="/cart"
              className="flex items-center justify-between font-bold py-2 text-slate-600"
            >
              <span>Keranjang Belanja</span>
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} weight="fill" />
                {cartCount > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {cartCount} Item
                  </span>
                )}
              </div>
            </Link>
          )}

          {isLoggedIn ? (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center gap-3 mb-2 px-2">
                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">
                  {userName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500">{role}</p>
                </div>
              </div>
              <Link
                href={dashboardLink}
                className="block bg-slate-50 p-3 rounded-lg font-bold text-slate-900 text-center"
              >
                {role === 'ADMIN' ? 'Dashboard Admin' : 'Pesanan Saya'}
              </Link>
              <Link
                href="/user/profile"
                className="block bg-slate-50 p-3 rounded-lg font-bold text-slate-900 text-center flex items-center justify-center gap-2"
              >
                <UserGear size={20} /> Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 p-3 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <SignOut size={20} /> Keluar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <Link
                href="/login"
                className="block text-center font-bold py-2 border rounded-xl"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="block text-center font-bold py-2 bg-slate-900 text-white rounded-xl"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
