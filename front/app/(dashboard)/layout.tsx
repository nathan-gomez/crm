import Sidebar from '@/components/Sidebar';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Notification from '@/components/Notification'
import '../globals.css';
import { UserDataResponse } from '@/models/ApiResponse';
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dashboard',
  description: '',
};

async function getUserData() {
  const url = process.env.API_USERDATA;
  const apiKey = process.env.API_KEY
  const cookieStore = cookies()
  const sessionToken = cookieStore.get('session_token')

  if (!url) {
    throw new Error('Env API_USERDATA not defined');
  }

  if (!apiKey) {
    throw new Error('Env API_USERDATA not defined');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      token: sessionToken?.value
    })
  })
  if (!response.ok) {
    return null
  }
  return await response.json()
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const data: UserDataResponse = await getUserData()

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
