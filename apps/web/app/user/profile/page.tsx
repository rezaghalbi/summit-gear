'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import {
  UserCircle,
  Envelope,
  LockKey,
  FloppyDisk,
  ArrowLeft,
} from '@phosphor-icons/react';
import Link from 'next/link';

export default function UserProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // State Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Kosongkan jika tidak ingin ganti

  // 1. Ambil Data User dari Cookie saat Load
  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      const user = JSON.parse(userCookie);
      setName(user.name || '');
      setEmail(user.email || '');
    } else {
      router.push('/login');
    }
  }, [router]);

  // 2. Handle Update Profile
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = Cookies.get('token');

    try {
      const res = await fetch('${API_URL}/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          password: password, // Backend akan abaikan jika string kosong
        }),
      });

      const json = await res.json();

      if (res.ok) {
        alert('✅ Profil berhasil diperbarui!');

        // Update Cookie dengan Nama Baru
        const userCookie = Cookies.get('user');
        if (userCookie) {
          const oldUser = JSON.parse(userCookie);
          const newUser = { ...oldUser, name: json.data.name };
          Cookies.set('user', JSON.stringify(newUser), { expires: 1 });
        }

        // Refresh halaman agar Navbar berubah
        window.location.reload();
      } else {
        alert(`Gagal update: ${json.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-xl">
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-bold transition"
        >
          <ArrowLeft weight="bold" /> Kembali ke Dashboard
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 border-4 border-white shadow-sm">
              <UserCircle size={64} weight="light" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Profil</h1>
            <p className="text-slate-500 text-sm">
              Perbarui informasi akun Anda
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Email (Read Only) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Envelope
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-1">
                *Email tidak dapat diubah
              </p>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <UserCircle
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Nama Anda"
                />
              </div>
            </div>

            {/* Password Baru */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Password Baru (Opsional)
              </label>
              <div className="relative">
                <LockKey
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Isi jika ingin ganti password..."
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-1">
                *Kosongkan jika tidak ingin mengganti password
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-200"
            >
              <FloppyDisk weight="bold" size={20} />
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
