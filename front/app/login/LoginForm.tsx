'use client';

import { FormEvent, useRef, useState } from 'react';
import EyeIcon from '../components/ui/icons/EyeIcon';
import EyeSlashIcon from '../components/ui/icons/EyeSlashIcon';
import UserIcon from '../components/ui/icons/UserIcon';

export default function LoginForm() {
  const userRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [isShowingPassword, setIsShowingPassword] = useState(false);
  const togglePass = () => setIsShowingPassword(!isShowingPassword);

  const loginHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      user: userRef.current!.value,
      pass: passRef.current!.value,
    };
  };

  return (
    <form action='post' onSubmit={loginHandler} className='w-full'>
      <div className='mb-6'>
        <label htmlFor='user' className='mb-2 block'>
          User
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
          Password
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
        Login
      </button>
    </form>
  );
}
