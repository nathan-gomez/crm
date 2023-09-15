import ChevronDownIcon from '@/icons/ChevronDownIcon';
import { RolesResponse, UsersResponse } from '@/models/ApiResponse';
import notificationStore from '@/store/notificationStore';
import getErrorMessage from '@/utils/errorHandler';
import { FormEvent, useRef } from 'react';

type Props = {
  roles: RolesResponse[];
  selectedUser: UsersResponse;
  getUsers: () => Promise<void>;
  closeModal: () => void;
};

export default function EditUser({ roles, selectedUser, getUsers, closeModal }: Props) {
  const updateNotification = notificationStore((state) => state.actions.updateNotification);
  const usernameRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //TODO: validation for same value inputs
    const params = {
      id: selectedUser.id,
      username: usernameRef.current?.value,
      role: roleRef.current?.value,
    };

    try {
      const url = process.env.NEXT_PUBLIC_API_EDITUSER;

      if (!url) {
        throw new Error('Env API_EDITUSER not defined');
      }

      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(params),
      });

      if (response.ok) {
        await getUsers();
        updateNotification({ message: 'Usuario modificado', type: 'success' });
        closeModal();
      }
    } catch (error) {
      updateNotification({ message: getErrorMessage(error), type: 'error' });
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <div className='mb-2 flex items-center'>
        <label htmlFor='username' className='w-[100px] shrink-0 font-bold pr-6'>
          Nombre
        </label>
        <input
          id='username'
          type='text'
          ref={usernameRef}
          className='w-full rounded border bg-transparent flex-1 py-1 px-3'
          defaultValue={selectedUser.username}
          required
        />
      </div>

      <div className='mb-2 flex items-center'>
        <label htmlFor='roles' className='w-[100px] shrink-0 block font-bold '>
          Tipo
        </label>
        <div className='relative w-full'>
          <select
            ref={roleRef}
            name='roles'
            defaultValue={selectedUser.role}
            id='roles-select'
            className='relative bg-transparent w-full px-3 z-20 py-1 border outline-none focus:border-primary-500 appearance-none rounded cursor-pointer capitalize'>
            {roles.map((role) => (
              <option key={role.id} value={role.role}>
                {role.role}
              </option>
            ))}
          </select>
          <span className='absolute z-10 bottom-0 right-0 top-0 flex items-center mr-2 peer-focus:text-primary-500'>
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      <div className='flex items-center mt-6'>
        <button className='ml-auto hover-btn secondary-btn' onClick={closeModal} type='button'>
          Cancelar
        </button>
        <button className='ml-2 primary-btn hover-btn' type='submit'>
          Guardar
        </button>
      </div>
    </form>
  );
}
