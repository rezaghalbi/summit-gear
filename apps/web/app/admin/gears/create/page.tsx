'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, UploadSimple, FloppyDisk } from '@phosphor-icons/react';

export default function CreateGearPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // State Form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerDay: '',
    stock: '',
    categoryId: '1', // Default category ID 1 (Pastikan ID 1 ada di DB)
  });
  const [file, setFile] = useState<File | null>(null);

  // Handle Perubahan Input Teks
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Gambar (Preview)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Bikin preview url sementara
    }
  };

  // Handle Submit ke Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = Cookies.get('token');
    if (!token) {
      alert('Sesi habis, silakan login ulang.');
      return router.push('/login');
    }

    try {
      // 1. Bungkus data dalam FormData (Wajib untuk upload file)
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('pricePerDay', formData.pricePerDay);
      data.append('stock', formData.stock);
      data.append('categoryId', formData.categoryId);

      if (file) {
        // 'image' harus sesuai dengan backend: uploader.single('image')
        data.append('image', file);
      } else {
        throw new Error('Wajib upload gambar barang!');
      }

      // 2. Kirim ke Backend
      const res = await fetch('http://localhost:8000/api/gears', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Browser otomatis set Content-Type: multipart/form-data
        },
        body: data,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Gagal upload barang');
      }

      alert('✅ Barang berhasil ditambahkan!');
      router.push('/admin/dashboard'); // Balik ke dashboard
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
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

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Upload Gambar */}
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
                    <p className="text-xs">JPG, PNG max 2MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Nama & Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nama Alat
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Contoh: Tenda Dome 4P"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Kategori ID
                </label>
                <input
                  type="number"
                  name="categoryId"
                  required
                  defaultValue={1}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  onChange={handleChange}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  *Pastikan ID Kategori ada di database
                </p>
              </div>
            </div>

            {/* 3. Harga & Stok */}
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

            {/* 4. Deskripsi */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Deskripsi Lengkap
              </label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Jelaskan spesifikasi alat..."
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Tombol Simpan */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                'Mengupload...'
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
