import { RolesResponse } from '@/models/ApiResponse';
import { cookies } from 'next/headers';
import UsersPanel from './components/UsersPanel';

async function getRoles() {
  const url = process.env.API_ROLES;
  const apiKey = process.env.API_KEY;

  if (!url) {
    throw new Error('Env API_ROLES not defined');
  }

  if (!apiKey) {
    throw new Error('Env API_KEY not defined');
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      Cookie: cookies().toString(),
    },
  });

  if (!response.ok) {
    console.log(response.json());
  }
  return await response.json();
}

export default async function UsersPage() {
  const data: RolesResponse[] = await getRoles();

  return (
    <div className='mx-8 py-6 min-h-screen'>
      <h1 className='text-xl py-4 font-semibold'>Usuarios</h1>
      <div className='p-8 h-full max-w-6xl border-[1px] border-neutral-200 shadow mx-auto'>
        <UsersPanel roles={data} />
      </div>
    </div>
  );
}
