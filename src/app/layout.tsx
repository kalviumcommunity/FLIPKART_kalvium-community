import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Flipkart | Smart Wishlist',
  description: 'Smart Wishlist Management System — real-time stock synchronization for your saved products.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 container mx-auto max-w-[1248px] px-4 py-4">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
