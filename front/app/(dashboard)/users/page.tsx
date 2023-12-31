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
    <>
      <h1 className='mx-8 mt-6 text-xl font-semibold text-gray-800'>Usuarios</h1>
      <div className='mx-6 my-8 max-w-6xl border-[1px] border-neutral-200 shadow lg:mx-auto'>
        <UsersPanel roles={data} />
      </div>
    </>
  );
}
