'use client';

import EyeIcon from '@/icons/EyeIcon';
import EyeSlashIcon from '@/icons/EyeSlashIcon';
import LoadingIcon from '@/icons/LoadingIcon';
import UserIcon from '@/icons/UserIcon';
import { DefaultResponse } from '@/models/ApiResponse';
import notificationStore from '@/store/notificationStore';
import getErrorMessage from '@/utils/errorHandler';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const userRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShowingPassword, setIsShowingPassword] = useState(false);
  const togglePass = () => setIsShowingPassword(!isShowingPassword);
  const updateNotification = notificationStore((state) => state.actions.updateNotification);

  const loginHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const params = {
      username: userRef.current!.value.trim(),
      password: passRef.current!.value.trim(),
    };

    try {
      const url = process.env.NEXT_PUBLIC_API_LOGIN;

      if (!url) {
        throw new Error('Env API_LOGIN not defined');
      }

      const response = await fetch(url, {
        credentials: 'include',
        method: 'POST',
        cache: 'no-cache',
        body: JSON.stringify(params),
      });

      switch (response.status) {
        case 204:
          setError('No se encontró un usuario con ese nombre.');
          setIsLoading(false);
          return;
        case 401:
          setError('Contraseña inválida.');
          setIsLoading(false);
          return;
        case 200:
          const data: DefaultResponse = await response.json();
          if ('error' in data) {
            setError(data.error);
            updateNotification({ message: data.error, type: 'error' });
            setIsLoading(false);
            return;
          }

          if (data.message === 'OK') {
            router.replace('/');
          }
          return;
      }
    } catch (error) {
      updateNotification({ message: getErrorMessage(error), type: 'error' });
      console.log(error);
    }
  };

  return (
    <form action='post' onSubmit={loginHandler} className='w-full max-w-lg'>
      <div className='mb-2'>
        <label htmlFor='user' className='mb-1 block font-medium'>
          Nombre de Usuario
        </label>
        <div className='relative'>
          <input
            type='text'
            name='user'
            id='user'
            ref={userRef}
            required
            className='w-full rounded-lg peer border bg-transparent py-2 pl-6 pr-14 outline-none transition-all focus:border-primary-500'
          />
          <span className='absolute bottom-0 right-0 top-0 flex items-center peer-focus:text-primary-500'>
            <UserIcon className='mr-3 h-6' />
          </span>
        </div>
      </div>

      <div className='mb-6'>
        <label htmlFor='pass' className='mb-1 block font-medium'>
          Contraseña
        </label>
        <div className='relative'>
          <input
            type={!isShowingPassword ? 'password' : 'text'}
            name='pass'
            id='pass'
            ref={passRef}
            required
            className='w-full rounded-lg border bg-transparent py-2 pl-6 pr-14 outline-none transition-all peer focus:border-primary-500'
          />
          <span className='absolute bottom-0 right-0 top-0 flex items-center peer-focus:text-primary-500'>
            <button
              type='button'
              onClick={togglePass}
              className='rounded-full transition-all hover:text-primary-600'>
              {!isShowingPassword ? (
                <EyeIcon className='mr-3 h-6' />
              ) : (
                <EyeSlashIcon className='mr-3 h-6' />
              )}
            </button>
          </span>
        </div>
      </div>
      <button
        type='submit'
        className='w-full rounded border-[1px] border-primary-600 bg-primary-600 p-3 text-white transition-all hover:bg-transparent hover:text-primary-600 font-medium'>
        {!isLoading ? 'Ingresar' : <LoadingIcon className='mx-auto h-6' />}
      </button>
      {error && (
        <div className='mt-4'>
          <p className='text-red-500'>{error}</p>
        </div>
      )}
    </form>
  );
}
