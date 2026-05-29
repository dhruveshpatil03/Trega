import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { MobileNav } from '@/components/layout/MobileNav';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Trega – Hyperlocal P2P Marketplace',
  description: 'Buy & sell used, refurbished items safely in your neighbourhood.',
  manifest: '/manifest.json',
  themeColor: '#09090b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-surface text-content-primary antialiased`}>
        <AuthProvider>
          {children}
          <MobileNav />
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#18181b', color: '#fafafa', border: '1px solid rgba(39,39,42,0.6)' },
          }}
        />
      </body>
    </html>
  );
}
