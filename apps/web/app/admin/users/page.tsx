'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { ArrowLeft, Users, ShieldCheck, User } from '@phosphor-icons/react';
import { API_URL } from '@/lib/api';

export default function AdminUserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Data Users
  const fetchUsers = async () => {
    const token = Cookies.get('token');
    try {
      const res = await fetch('${API_URL}/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setUsers(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header Navigasi */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-bold transition"
        >
          <ArrowLeft weight="bold" /> Kembali ke Dashboard
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={28} weight="fill" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Daftar Pengguna
            </h1>
            <p className="text-slate-500">Lihat semua user yang terdaftar</p>
          </div>
        </div>

        {/* Tabel User */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">No</th>
                <th className="p-4">Nama User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Bergabung Sejak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    Memuat data user...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Belum ada user.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono text-slate-400">
                      {index + 1}
                    </td>
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          user.role === 'ADMIN'
                            ? 'bg-orange-600'
                            : 'bg-slate-400'
                        }`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {user.email}
                    </td>
                    <td className="p-4">
                      {user.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold border border-orange-200">
                          <ShieldCheck weight="fill" /> ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                          <User weight="fill" /> USER
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center text-xs text-slate-400">
          Total {users.length} pengguna terdaftar
        </div>
      </div>
    </main>
  );
}
