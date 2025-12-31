'use client';

import { useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Kirim Data ke Backend
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await res.json();

      // Debug: Intip isi respons di Console Browser
      console.log('🔍 RESPONS BACKEND:', responseJson);

      if (!res.ok) {
        throw new Error(responseJson.message || 'Gagal login.');
      }

      // 2. AMBIL TOKEN (Cari di semua kemungkinan tempat)
      // Backend Anda kemungkinan besar mengirim di responseJson.data.token
      let token =
        responseJson.accessToken ||
        responseJson.token ||
        (responseJson.data && responseJson.data.accessToken) ||
        (responseJson.data && responseJson.data.token);

      // 3. AMBIL DATA USER
      let userData =
        responseJson.user || (responseJson.data && responseJson.data.user);

      // Cek apakah token ketemu
      if (!token || token === 'undefined') {
        // Jika masih gagal, kita log struktur datanya biar tahu salahnya dimana
        console.error('Struktur JSON Backend:', responseJson);
        throw new Error('Token tidak ditemukan di dalam respons backend.');
      }

      // Bersihkan token jika ada tanda kutip string yang ikut
      if (typeof token === 'string') {
        token = token.replace(/"/g, '');
      }

      console.log('✅ Token Valid ditemukan:', token.substring(0, 10) + '...');

      // 4. SIMPAN KE COOKIE (Path '/' Wajib)
      Cookies.set('token', token, { expires: 1, path: '/' });

      // Simpan User (Buat data dummy jika backend lupa kirim user object)
      if (userData) {
        Cookies.set('user', JSON.stringify(userData), {
          expires: 1,
          path: '/',
        });
      } else {
        Cookies.set('user', JSON.stringify({ name: 'User', email }), {
          expires: 1,
          path: '/',
        });
      }

      console.log('✅ Cookie tersimpan. Mengalihkan ke Dashboard...');

      // 5. HARD RELOAD ke Dashboard
      // Menggunakan window.location agar Middleware membaca cookie baru
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Selamat Datang Kembali
          </h1>
          <p className="text-slate-500 mt-2">
            Masuk untuk mengelola penyewaan alat
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="text-orange-600 font-bold hover:underline"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
