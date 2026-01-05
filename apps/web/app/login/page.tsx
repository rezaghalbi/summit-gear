'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Auto-Redirect jika sudah login (Cegah user login 2x)
  useEffect(() => {
    const token = Cookies.get('token');
    const userCookie = Cookies.get('user');

    if (token && userCookie) {
      try {
        const user = JSON.parse(userCookie);
        // Redirect sesuai role yang tersimpan
        if (user.role === 'ADMIN') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/user/dashboard');
        }
      } catch (e) {
        // Cookie rusak? Biarkan user login ulang.
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Mengirim request login...');

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await res.json();
      console.log('🔍 RAW RESPONSE:', responseJson);

      if (!res.ok) {
        throw new Error(
          responseJson.message || 'Gagal login. Periksa email/password.'
        );
      }

      // =========================================================
      // 🛠️ LOGIKA EKSTRAKSI DATA (SMART PARSER)
      // =========================================================

      // Ambil root data (bisa di properti 'data' atau root response itu sendiri)
      const dataRoot = responseJson.data || responseJson;

      // 1. CARI TOKEN
      let token =
        dataRoot.accessToken ||
        dataRoot.token ||
        responseJson.accessToken ||
        responseJson.token;

      // 2. CARI DATA USER
      // Cek 1: Apakah ada properti 'user'? (Nested)
      // Cek 2: Apakah 'dataRoot' punya 'role'? (Flattened)
      // Cek 3: Apakah root response punya 'role'?
      let userData =
        dataRoot.user ||
        (dataRoot.role ? dataRoot : null) ||
        (responseJson.role ? responseJson : null);

      // Validasi Akhir
      if (!token) throw new Error('Token tidak ditemukan di respons Backend!');
      if (!userData)
        throw new Error('Data User (Role) tidak ditemukan di respons Backend!');

      // Bersihkan data user dari token (agar cookie user tidak terlalu besar)
      // Kita buat object baru yang bersih
      const cleanUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      // Bersihkan token dari tanda kutip string jika ada
      if (typeof token === 'string') token = token.replace(/"/g, '');

      console.log('✅ Data Tervalidasi:');
      console.log('Token:', token.substring(0, 10) + '...');
      console.log('Role:', cleanUser.role);

      // =========================================================
      // 💾 SIMPAN COOKIE & REDIRECT
      // =========================================================

      Cookies.set('token', token, { expires: 1, path: '/' });
      Cookies.set('user', JSON.stringify(cleanUser), { expires: 1, path: '/' });

      // FORCE REDIRECT (Polisi Lalu Lintas) 👮‍♂️
      if (cleanUser.role === 'ADMIN') {
        console.log('🔀 Redirecting to ADMIN Dashboard');
        window.location.href = '/admin/dashboard';
      } else {
        console.log('🔀 Redirecting to USER Dashboard');
        window.location.href = '/user/dashboard';
      }
    } catch (err: any) {
      console.error('❌ Login Gagal:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 text-orange-600 mb-4 font-bold text-xl">
            S
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Masuk Akun</h1>
          <p className="text-slate-500 mt-2">
            Kelola penyewaan alat camping kamu
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center font-medium border border-red-100 animate-pulse">
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
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
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
            Daftar User Baru
          </Link>
        </p>
      </div>
    </main>
  );
}
