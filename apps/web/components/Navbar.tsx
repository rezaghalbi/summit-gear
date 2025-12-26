'use client';

import Link from 'next/link';
import { ShoppingCart } from '@phosphor-icons/react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-orange-600">
          Summit<span className="text-slate-900">Gear</span>
        </Link>

        {/* Menu Tengah */}
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <Link href="/catalog" className="hover:text-orange-600 transition">
            Katalog
          </Link>
        </div>

        {/* Tombol Kanan */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-full transition">
            <ShoppingCart size={24} className="text-slate-700" />
          </button>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-full hover:bg-slate-800 transition"
          >
            Masuk
          </Link>
        </div>
      </div>
    </nav>
  );
}
