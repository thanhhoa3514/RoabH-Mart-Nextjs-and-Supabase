import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Providers } from '@/lib/providers';
import { CartProvider } from '@/lib/context/cart-context';
import { AlertProvider } from '@/lib/context/alert-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RoabH Mart - Your One-Stop Shop',
  description: 'Find the best products at the best prices',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AlertProvider>
          <Providers>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </CartProvider>
          </Providers>
        </AlertProvider>
      </body>
    </html>
  );
}
