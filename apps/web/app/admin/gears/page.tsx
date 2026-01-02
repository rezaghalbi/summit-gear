'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  PencilSimple,
  Trash,
  Plus,
  MagnifyingGlass,
  ArrowLeft,
} from '@phosphor-icons/react';

export default function AdminGearList() {
  const router = useRouter();
  const [gears, setGears] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 1. Fetch Data Barang
  const fetchGears = async () => {
    try {
      const query = search ? `?search=${search}` : '';
      const res = await fetch(`http://localhost:8000/api/gears${query}`);
      const json = await res.json();
      if (res.ok) {
        setGears(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGears();
  }, [search]);

  // 2. Handle Delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus permanen "${name}"?`)) return;

    const token = Cookies.get('token');
    try {
      const res = await fetch(`http://localhost:8000/api/gears/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('Barang berhasil dihapus!');
        fetchGears(); // Refresh list
      } else {
        const json = await res.json();
        alert(`Gagal hapus: ${json.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan sistem');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header dengan Tombol Kembali */}
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 font-bold transition"
          >
            <ArrowLeft weight="bold" /> Kembali ke Dashboard
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Inventory Barang 📦
              </h1>
              <p className="text-slate-500">Kelola stok dan harga peralatan</p>
            </div>
            <Link
              href="/admin/gears/create"
              className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600 transition flex items-center gap-2"
            >
              <Plus weight="bold" /> Tambah Barang
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex items-center gap-3">
          <MagnifyingGlass size={20} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama barang..."
            className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tabel Barang */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Foto</th>
                <th className="p-4">Nama Barang</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Stok</th>
                <th className="p-4">Harga /Hari</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    Memuat...
                  </td>
                </tr>
              ) : gears.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada barang ditemukan.
                  </td>
                </tr>
              ) : (
                gears.map((gear) => (
                  <tr key={gear.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="relative w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        {gear.imageUrl && (
                          <Image
                            src={
                              gear.imageUrl.startsWith('http')
                                ? gear.imageUrl
                                : `http://localhost:8000${gear.imageUrl}`
                            }
                            alt={gear.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {gear.name}
                    </td>
                    <td className="p-4">
                      <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-bold">
                        {gear.category?.name}
                      </span>
                    </td>
                    <td className="p-4">{gear.stock} Unit</td>
                    <td className="p-4 font-mono">
                      Rp {gear.pricePerDay.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {/* Tombol Edit */}
                        <Link
                          href={`/admin/gears/edit/${gear.id}`}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
                          title="Edit"
                        >
                          <PencilSimple size={18} weight="bold" />
                        </Link>

                        {/* Tombol Hapus */}
                        <button
                          onClick={() => handleDelete(gear.id, gear.name)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                          title="Hapus"
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
