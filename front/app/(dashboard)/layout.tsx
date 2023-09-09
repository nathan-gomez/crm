import Notification from '@/components/Notification';
import Sidebar from '@/components/Sidebar';
import { UserDataResponse } from '@/models/ApiResponse';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dashboard',
  description: '',
};

//FIX: deleting cookie session
async function getUserData() {
  const url = process.env.API_USERDATA;
  const apiKey = process.env.API_KEY;

  if (!url) {
    throw new Error('Env API_USERDATA not defined');
  }

  if (!apiKey) {
    throw new Error('Env API_KEY not defined');
  }

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      'x-api-key': apiKey,
      Cookie: cookies().toString(),
    },
  });

  if (!response.ok) {
    redirect('/login');
  }
  return await response.json();
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data: UserDataResponse = await getUserData();

  return (
    <html lang='en'>
      <body className={`relative flex max-h-screen ${inter.className}`}>
        <Sidebar user={data} />
        <div className='flex shrink-0 grow flex-col'>
          <main className='grow overflow-auto'>{children}</main>
        </div>
        <Notification />
      </body>
    </html>
  );
}
