import Image from 'next/image';
import Link from 'next/link';
import { Gear } from '../../types/gear';

async function getGears() {
  try {
    const res = await fetch('http://localhost:8000/api/gears', {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Gagal fetch data');
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return { data: [] };
  }
}

export default async function CatalogPage() {
  const response = await getGears();
  const gears: Gear[] = response.data || [];

  return (
    <main className="min-h-screen bg-slate-50 pb-20 pt-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Katalog Alat</h1>
        <p className="text-slate-600 mb-8">Pilih perlengkapan terbaikmu</p>

        {/* Grid Barang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gears.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-slate-200"
            >
              {/* */}

              <div className="relative h-48 w-full bg-slate-100">
                <Image
                  src={`http://localhost:8000${item.imageUrl}`}
                  alt={item.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {item.category?.name || 'Umum'}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-slate-900 truncate">
                  {item.name}
                </h3>
                <p className="text-orange-600 font-bold mt-1">
                  Rp {(item.pricePerDay || 0).toLocaleString('id-ID')}{' '}
                  <span className="text-xs text-slate-500 font-normal">
                    / hari
                  </span>
                </p>

                <Link
                  href={`/catalog/${item.id}`}
                  className="block mt-4 w-full bg-slate-900 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
