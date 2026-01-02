'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { UserCircle, Envelope, FloppyDisk } from '@phosphor-icons/react';

export default function ProfilePage() {
  const [user, setUser] = useState({ name: '', email: '', role: '' });

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Pengaturan Akun ⚙️
        </h1>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <UserCircle size={64} weight="light" />
            </div>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-slate-400 mt-1">
                *Hubungi admin untuk ubah nama
              </p>
            </div>

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
                  defaultValue={user.email}
                  className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-3 bg-slate-50 text-slate-500 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-4">
                Ingin ganti password?
              </p>
              <button
                type="button"
                className="w-full border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition"
              >
                Ganti Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
