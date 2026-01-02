'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, UploadSimple, FloppyDisk } from '@phosphor-icons/react';

export default function CreateGearPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // 1. STATE UNTUK DATA KATEGORI
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerDay: '',
    stock: '',
    categoryId: '', // Default kosong
  });
  const [file, setFile] = useState<File | null>(null);

  // 2. AMBIL DATA KATEGORI DARI BACKEND
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/categories');
        const json = await res.json();

        if (res.ok && json.data) {
          setCategories(json.data);
          // Opsi: Set default ke kategori pertama
          if (json.data.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: json.data[0].id }));
          }
        }
      } catch (err) {
        console.error('Gagal load kategori:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = Cookies.get('token');
    if (!token) {
      alert('Sesi habis. Login ulang yuk!');
      return router.push('/login');
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('pricePerDay', formData.pricePerDay);
      data.append('stock', formData.stock);
      data.append('categoryId', formData.categoryId);

      if (file) {
        data.append('image', file);
      } else {
        throw new Error('Gambar wajib diupload!');
      }

      const res = await fetch('http://localhost:8000/api/gears', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal upload');

      alert('✅ Barang berhasil disimpan!');
      router.push('/admin/dashboard');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/dashboard"
            className="p-2 bg-white rounded-full text-slate-600 hover:bg-slate-100 transition shadow-sm"
          >
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Tambah Alat Baru
            </h1>
            <p className="text-slate-500 text-sm">
              Lengkapi data barang untuk disewakan
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Foto Barang
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {preview ? (
                  <div className="relative h-64 w-full rounded-lg overflow-hidden">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white font-bold">
                      Ganti Foto
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-400 py-4">
                    <UploadSimple size={48} weight="light" className="mb-2" />
                    <p className="text-sm font-medium">
                      Klik untuk upload gambar
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Nama & Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nama Alat
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Contoh: Tenda Dome"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  onChange={handleChange}
                />
              </div>

              {/* 3. DROPDOWN KATEGORI */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Pilih Kategori --
                    </option>
                    {categories.length === 0 && (
                      <option disabled>Loading data...</option>
                    )}

                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {/* Ikon Panah Kecil di Kanan */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Harga & Stok */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Harga Sewa (per hari)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    name="pricePerDay"
                    required
                    placeholder="50000"
                    className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Stok Tersedia
                </label>
                <input
                  type="number"
                  name="stock"
                  required
                  placeholder="10"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Deskripsi Lengkap
              </label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Spesifikasi alat..."
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                onChange={handleChange}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                'Menyimpan...'
              ) : (
                <>
                  <FloppyDisk size={20} weight="fill" /> Simpan Barang
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
