import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// DAFTAR HALAMAN RAHASIA (Private Routes)
// Tambahkan path lain di sini jika ingin dikunci
const protectedRoutes = ['/dashboard', '/profile', '/orders', '/checkout'];

// DAFTAR HALAMAN KHUSUS TAMU (Auth Routes)
// Kalau sudah login, tidak boleh masuk sini lagi (harus logout dulu)
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. CEK HALAMAN RAHASIA
  // Jika user mau masuk halaman rahasia TAPI tidak punya token
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      // Tendang ke halaman login
      const url = new URL('/login', request.url);
      // (Opsional) Simpan url tujuan biar nanti bisa balik lagi
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
  }

  // 2. CEK HALAMAN AUTH
  // Jika user SUDAH login, tapi iseng buka /login atau /register
  if (authRoutes.includes(pathname)) {
    if (token) {
      // Tendang balik ke katalog (Ngapain login lagi?)
      return NextResponse.redirect(new URL('/catalog', request.url));
    }
  }

  return NextResponse.next();
}

// Konfigurasi: Middleware ini jalan di route mana saja?
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (folder gambar public)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
