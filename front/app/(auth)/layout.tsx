import Notification from '@/components/Notification';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Login',
  description: '',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={`relative flex h-screen ${inter.className}`}>
        <main className='grow h-full'>{children}</main>
        <Notification />
      </body>
    </html>
  );
}
