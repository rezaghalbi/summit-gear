import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Perhatikan: titik dua (..) artinya mundur satu langkah dari folder 'app'
// untuk mencari folder 'components'
import Navbar from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Summit Gear',
  description: 'Rental Outdoor App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar /> {/* <--- Navbar dipasang di sini */}
        {children}
      </body>
    </html>
  );
}
