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
  getUsers: () => Promise<void>;
  closeModal: () => void;
};

export default function CreateUser({ roles, getUsers, closeModal }: Props) {
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
          await getUsers();
          updateNotification({ message: 'Usuario creado exitosamente', type: 'success' });
          closeModal();
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
    <form onSubmit={submitHandler} className='pt-3'>
      <div className='mb-2 flex items-center justify-end'>
        <label htmlFor='username' className='w-[130px] font-bold pr-6'>
          Usuario
        </label>
        <input
          ref={userRef}
          id='username'
          type='text'
          className='w-full rounded border bg-transparent flex-1 py-1 px-4'
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
            className='w-full rounded border bg-transparent py-1 pl-4 pr-10 peer'
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

      <div className='flex items-center'>
        <label htmlFor='roles' className='w-[130px] shrink-0 block font-bold '>
          Tipo
        </label>
        <div className='relative w-full'>
          <select
            ref={roleRef}
            name='roles'
            id='roles-select'
            className='relative bg-transparent w-full min-w-[200px] pl-2 z-20 pr-8 py-1 border outline-none focus:border-primary-500 appearance-none rounded cursor-pointer capitalize'>
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

      <div className='flex items-center mt-6'>
        <button className='ml-auto hover-btn secondary-btn' onClick={closeModal} type='button'>
          Cancelar
        </button>
        <button
          disabled={isLoading}
          className='ml-2 hover-btn primary-btn flex items-center'
          type='submit'>
          {!isLoading ? (
            'Crear Usuario'
          ) : (
            <>
              Cargando <LoadingIcon className='h-6 ml-2' />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
