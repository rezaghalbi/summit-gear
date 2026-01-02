'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import Link from 'next/link';

export default function EditGearPage() {
  const router = useRouter();
  const params = useParams(); // Mengambil ID (UUID) dari URL
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerDay: '',
    stock: '',
    categoryId: '',
  });

  // 1. Ambil Data Kategori & Data Barang Lama
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Kategori
        const catRes = await fetch('http://localhost:8000/api/categories');
        const catJson = await catRes.json();
        if (catRes.ok) setCategories(catJson.data);

        // Fetch Detail Barang Lama berdasarkan ID di URL
        const gearRes = await fetch(
          `http://localhost:8000/api/gears/${params.id}`
        );
        const gearJson = await gearRes.json();

        if (gearRes.ok) {
          const gear = gearJson.data;
          setFormData({
            name: gear.name,
            description: gear.description,
            pricePerDay: gear.pricePerDay,
            stock: gear.stock,
            categoryId: gear.categoryId, // Pastikan backend kirim categoryId
          });
        } else {
          alert('Barang tidak ditemukan!');
          router.push('/admin/gears');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, router]);

  // 2. Handle Update (PATCH)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = Cookies.get('token');

    try {
      const res = await fetch(`http://localhost:8000/api/gears/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok) {
        alert('✅ Barang berhasil diupdate!');
        router.push('/admin/gears');
      } else {
        throw new Error(json.message || 'Gagal update barang');
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat data...
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-2xl">
        <Link
          href="/admin/gears"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-bold transition"
        >
          <ArrowLeft weight="bold" /> Batal & Kembali
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-lg">
              ✏️
            </span>
            Edit Barang
          </h1>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nama Barang
              </label>
              <input
                type="text"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Kategori
              </label>
              <select
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Harga Sewa /Hari
                </label>
                <input
                  type="number"
                  required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.pricePerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerDay: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Stok Tersedia
                </label>
                <input
                  type="number"
                  required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Deskripsi
              </label>
              <textarea
                required
                rows={4}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FloppyDisk weight="bold" size={20} />
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
