'use client';

import DeleteIcon from '@/icons/DeleteIcon';
import EditIcon from '@/icons/EditIcon';
import { RolesResponse, UsersResponse } from '@/models/ApiResponse';
import { useState } from 'react';
import CreateUser from './CreateUser';
import notificationStore from '@/store/notificationStore';
import getErrorMessage from '@/utils/errorHandler';
import userStore from '@/store/userStore';
import AddUserIcon from '@/icons/AddUserIcon';

type Props = {
  roles: RolesResponse[];
  users: UsersResponse[]
};

export default function UsersPanel({ roles, users }: Props) {
  const updateNotification = notificationStore(state => state.actions.updateNotification)
  const currentUsername = userStore(state => state.username)
  const [showForm, setShowForm] = useState(false);
  const [usersList, setUsersList] = useState<UsersResponse[]>(users);

  async function getUsers() {
    try {
      const url = process.env.NEXT_PUBLIC_API_GETUSERS;

      if (!url) {
        throw new Error('Env API_GETUSERS not defined');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          credentials: 'include',
        },
      });

      if (!response.ok) {
        updateNotification({ message: 'Ocurrió un error al buscar los usuarios', type: 'error' });
      }

      const data = await response.json();
      setUsersList(data)
    } catch (error) {
      updateNotification({ message: getErrorMessage(error), type: 'error' });
    }
  }

  const editUser = async (userId: string) => {
    const params = {
      id: userId
    }

    try {
      const url = process.env.NEXT_PUBLIC_API_EDITUSER;

      if (!url) {
        throw new Error('Env API_EDITUSER not defined');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          credentials: 'include',
        },
        body: JSON.stringify(params)
      })

      if (response.ok) {
        updateNotification({ message: 'Usuario modificado', type: 'success' });
      }
      await getUsers()
    } catch (error) {
      updateNotification({ message: getErrorMessage(error), type: 'error' });
    }
  };

  const deleteUser = async (userId: string) => {
    const params = encodeURIComponent(userId);

    try {
      const url = process.env.NEXT_PUBLIC_API_DELETEUSER;

      if (!url) {
        throw new Error('Env API_DELETEUSER not defined');
      }

      const response = await fetch(url + params, {
        credentials: 'include',
        method: 'DELETE',
        cache: 'no-cache',
      });

      if (response.ok) {
        const data = await response.json()
        if (data.message === 'OK') {
          updateNotification({ message: 'Usuario eliminado correctamente', type: 'success' });
        }
      }
      return;
    } catch (error) {
      updateNotification({ message: getErrorMessage(error), type: 'error' });
      console.log(error);
    }
  };

  return (
    <div className='flex'>
      <div className='w-full'>
        <button onClick={() => setShowForm(!showForm)}
          className='ml-auto flex items-center rounded border-[1px] text-sm border-primary-600 bg-primary-600 py-1 px-2 text-white transition-all hover:bg-transparent hover:text-primary-600 font-medium'>
          <AddUserIcon className='mr-2 h-5'/>Añadir Usuario</button>
        {showForm && <CreateUser roles={roles} />}
        <table className='min-w-full mt-6 bg-white border table-auto border-gray-300'>
          <thead>
            <tr className='bg-gray-300 text-'>
              <th className='py-2 px-4 border-b text-left'>Nombre</th>
              <th className='py-2 px-4 border-b text-left'>Rol</th>
              <th className='py-2 px-4 border-b text-left'>Fecha de Creacion</th>
              <th className='py-2 px-4 border-b text-left'></th>
            </tr>
          </thead>
          <tbody>
            {usersList.length > 0 && usersList.map(user => (
              <tr key={user.id}>
                <td className='py-2 px-4 border-b'>{user.username}</td>
                <td className='py-2 px-4 border-b capitalize'>{user.role}</td>
                <td className='py-2 px-4 border-b'>{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
                <td className='mx-auto'>
                  <button onClick={() => editUser(user.id)} className='mr-2 hover:text-yellow-500 transition-all'>
                    <EditIcon />
                  </button>
                  {user.username != currentUsername &&
                    <button onClick={() => deleteUser(user.id)} className='hover:text-red-500 transition-all'>
                      <DeleteIcon />
                    </button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
