'use client';

import EyeIcon from '@/icons/EyeIcon';
import EyeSlashIcon from '@/icons/EyeSlashIcon';
import LoadingIcon from '@/icons/LoadingIcon';
import UserIcon from '@/icons/UserIcon';
import { DefaultResponse, LoginResponse } from '@/models/ApiResponse';
import userStore from '@/store/userStore';
import axios from '@/utils/axiosConfig';
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
  const updateUser = userStore((state) => state.actions.updateUser);

  const loginHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const url = '/api/login';
    const params = {
      username: userRef.current!.value.trim(),
      password: passRef.current!.value.trim(),
    };

    try {
      const response = await axios.post<LoginResponse | DefaultResponse>(
        url,
        params
      );

      if (response.status === 204) {
        setError('No se encontró un usuario con ese nombre.');
        return;
      }

      if (response.status === 401) {
        setError('Contraseña inválida.');
        return;
      }

      if ('error' in response.data) {
        setError(response.data.error);
        return;
      }

      if ('id' in response.data) {
        console.log(response.data);
        updateUser({
          role: response.data.role,
          userId: response.data.id,
          username: response.data.username,
        });
        router.replace('/');
      }
    } catch (error) {
      setError(getErrorMessage(error));
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action='post' onSubmit={loginHandler} className='w-full max-w-lg'>
      <div className='mb-6'>
        <label htmlFor='user' className='mb-2 block'>
          Nombre de usuario
        </label>
        <div className='relative'>
          <input
            type='text'
            name='user'
            id='user'
            ref={userRef}
            required
            className='w-full rounded-lg border bg-transparent py-4 pl-6 pr-14 outline-none transition-all focus:border-primary-500 dark:focus:border-white'
          />
          <span className='absolute bottom-0 right-0 top-0 flex items-center'>
            <UserIcon className='mr-3 h-6' />
          </span>
        </div>
      </div>

      <div className='mb-8'>
        <label htmlFor='pass' className='mb-2 block'>
          Contraseña
        </label>
        <div className='relative'>
          <input
            type={!isShowingPassword ? 'password' : 'text'}
            name='pass'
            id='pass'
            ref={passRef}
            required
            className='w-full rounded-lg border bg-transparent py-4 pl-6 pr-14 outline-none transition-all focus:border-primary-500 dark:focus:border-white'
          />
          <span className='absolute bottom-0 right-0 top-0 flex items-center'>
            <button
              type='button'
              onClick={togglePass}
              className='rounded-full transition-all hover:text-primary-600 hover:dark:text-primary-200'>
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
        className='w-full rounded border-[1px] border-primary-600 bg-primary-600 p-3 text-white transition-all hover:bg-transparent hover:text-primary-600 dark:border-primary-900 dark:bg-primary-900 dark:hover:border-white dark:hover:bg-transparent dark:hover:text-white'>
        {!isLoading ? 'Login' : <LoadingIcon className='mx-auto h-6' />}
      </button>
      {error && (
        <div className='mt-4'>
          <p className='text-red-500'>{error}</p>
        </div>
      )}
    </form>
  );
}
