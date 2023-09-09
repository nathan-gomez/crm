import ChevronDownIcon from '@/icons/ChevronDownIcon';
import EyeIcon from '@/icons/EyeIcon';
import EyeSlashIcon from '@/icons/EyeSlashIcon';
import LoadingIcon from '@/icons/LoadingIcon';
import { DefaultResponse, RolesResponse } from '@/models/ApiResponse';
import notificationStore from '@/store/notificationStore';
import getErrorMessage from '@/utils/errorHandler';
import { FormEvent, useRef, useState } from 'react';

type Props = {
  roles: RolesResponse[];
};

export default function CreateUser({ roles }: Props) {
  const updateNotification = notificationStore((state) => state.actions.updateNotification);
  const userRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowingPassword, setIsShowingPassword] = useState(false);
  const togglePass = () => setIsShowingPassword(!isShowingPassword);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_API_CREATE_USER;
      const params = {
        username: userRef.current?.value.trim(),
        password: passRef.current?.value.trim(),
        role: roleRef.current?.value,
      };

      if (!url) {
        throw new Error('Env API_CREATE_USER not defined');
      }

      const response = await fetch(url, {
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data: DefaultResponse = await response.json();
        if ('error' in data) {
          updateNotification({ message: data.error, type: 'error' });
          return;
        }

        if (data.message === 'Username taken') {
          updateNotification({ message: 'Nombre de usuario en uso', type: 'warning' });
          return;
        }

        if (data.message === 'OK') {
          updateNotification({ message: 'Usuario creado exitosamente', type: 'success' });
          userRef.current!.value = '';
          passRef.current!.value = '';
          return;
        }
      }
    } catch (error) {
      updateNotification({ message: getErrorMessage(error), type: 'error' });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={submitHandler}>
      <div className='mb-4 flex items-center justify-end'>
        <label htmlFor='username' className='w-[130px] font-bold pr-6'>
          Nombre de usuario
        </label>
        <input
          ref={userRef}
          id='username'
          type='text'
          className='w-full rounded-lg border bg-transparent flex-1 py-2 px-6 peer'
          required
        />
      </div>

      <div className='mb-2 flex items-center'>
        <label htmlFor='pass' className='w-[130px] font-bold pr-6'>
          Contraseña
        </label>
        <div className='relative w-full flex-1'>
          <input
            type={!isShowingPassword ? 'password' : 'text'}
            name='pass'
            id='pass'
            ref={passRef}
            required
            className='w-full rounded-lg border bg-transparent py-2 px-6 peer'
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

      <div className='mb-2 py-2 flex items-center'>
        <label htmlFor='roles' className='w-[130px] block font-bold '>
          Tipo :
        </label>
        <div className='relative'>
          <select
            ref={roleRef}
            name='roles'
            id='roles-select'
            className='relative bg-transparent min-w-[200px] pl-2 z-20 pr-8 py-2 border outline-none focus:border-primary-500 appearance-none rounded-lg cursor-pointer capitalize'>
            {roles.map((role) => (
              <option key={role.id} value={role.role}>
                {role.role}
              </option>
            ))}
          </select>
          <span className='absolute z-10 bottom-0 right-0 top-0 flex items-center mr-2 peer-focus:text-primary-500'>
            <ChevronDownIcon className='h-5' />
          </span>
        </div>
      </div>

      <button
        type='submit'
        disabled={isLoading}
        className='w-full rounded border-[1px] border-primary-600 bg-primary-600 p-3 text-white transition-all hover:bg-transparent hover:text-primary-600 font-medium'>
        {!isLoading ? 'Crear Usuario' : <LoadingIcon className='mx-auto h-6' />}
      </button>
    </form>
  );
}
