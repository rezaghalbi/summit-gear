'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal login. Periksa email/password.');
      }

      // --- LOGIKA PENYIMPANAN TOKEN ---
      Cookies.set('token', data.accessToken, { expires: 1 });
      Cookies.set('user', JSON.stringify(data.user), { expires: 1 });

      console.log('Login Sukses! Token:', data.accessToken);
      if (data.user) {
        Cookies.set('user', JSON.stringify(data.user), { expires: 1 });
      } else {
        const fallbackUser = { name: 'Pengguna', email: email };
        Cookies.set('user', JSON.stringify(fallbackUser), { expires: 1 });
      }
      // Pindah ke Katalog
      alert('Login Berhasil!');
      window.location.href = '/catalog';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Selamat Datang Kembali
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Masuk untuk mulai menyewa alat
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition disabled:bg-slate-400"
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="text-orange-600 font-bold hover:underline"
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </main>
  );
}
