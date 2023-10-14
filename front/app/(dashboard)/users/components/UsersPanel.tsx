'use client';

import LoadingModal from '@/components/LoadingModal';
import Modal from '@/components/Modal';
import AddUserIcon from '@/icons/AddUserIcon';
import DeleteIcon from '@/icons/DeleteIcon';
import EditIcon from '@/icons/EditIcon';
import { RolesResponse, UsersResponse } from '@/models/ApiResponse';
import notificationStore from '@/store/notificationStore';
import userStore from '@/store/userStore';
import debounce from '@/utils/debounce';
import getErrorMessage from '@/utils/errorHandler';
import { AnimatePresence } from 'framer-motion';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import CreateUser from './CreateUser';
import DeleteUser from './DeleteUser';
import EditUser from './EditUser';

type Props = {
  roles: RolesResponse[];
};

let usersList: UsersResponse[] = [];

export default function UsersPanel({ roles }: Props) {
  const updateNotification = notificationStore((state) => state.actions.updateNotification);
  const currentUsername = userStore((state) => state.username);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editFormData, setEditFormData] = useState<UsersResponse | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string>('');
  const [filteredList, setFilteredList] = useState<UsersResponse[]>([]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toLowerCase().trim();

    if (!input) {
      setFilteredList(usersList);
      return;
    }

    const filteredList = usersList.filter((user) => user.username.toLowerCase().includes(input));
    setFilteredList(filteredList);
  };

  const debounceSearch = debounce(handleSearch, 300);

  const getUsers = useCallback(async () => {
    try {
      setLoading(true);
      const url = process.env.NEXT_PUBLIC_API_GETUSERS;

      if (!url) {
        throw new Error('Env API_GETUSERS not defined');
      }

      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        updateNotification({ message: 'Ocurrió un error al buscar los usuarios', type: 'error' });
        return;
      }

      const data = await response.json();

      usersList = data;
      setFilteredList(data);
    } catch (error) {
      updateNotification({ message: getErrorMessage(error), type: 'error' });
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [updateNotification]);

  useEffect(() => {
    (async () => {
      await getUsers();
    })();
  }, [getUsers]);

  return (
    <>
      <div className='p-6'>
        <div className='flex'>
          <div className='shrink-0 grow mr-6'>
            <input
              onChange={debounceSearch}
              className='w-full rounded border bg-transparent flex-1 py-1 px-4'
              id='search-user'
              placeholder='Buscar usuario'
              type='text'
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className='ml-auto flex items-center rounded border-[1px] text-sm border-primary-600 bg-primary-600 py-1 px-2 text-white transition-all hover:bg-transparent hover:text-primary-600 font-medium'>
            <AddUserIcon className='mr-2 h-5' />
            Añadir Usuario
          </button>
        </div>
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
            {filteredList.length > 0 &&
              filteredList.map((user) => (
                <tr key={user.id} className='hover:bg-gray-50 transition-all'>
                  <td className='py-2 px-4 border-b'>{user.username}</td>
                  <td className='py-2 px-4 border-b capitalize'>{user.role}</td>
                  <td className='py-2 px-4 border-b'>
                    {new Date(user.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className='mx-auto py-2 px-4 border-b'>
                    {user && user.username !== currentUsername && (
                      <div className='flex justify-center'>
                        <button
                          onClick={() => setEditFormData(user)}
                          className='mr-2 hover:text-yellow-500 transition-all'>
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation(user.id)}
                          className='hover:text-red-500 transition-all'>
                          <DeleteIcon />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {showCreateForm && (
          <Modal
            closeModal={() => setShowCreateForm(false)}
            title='Nuevo Usuario'
            key='create-user'>
            <CreateUser
              roles={roles}
              getUsers={getUsers}
              closeModal={() => setShowCreateForm(false)}
            />
          </Modal>
        )}
        {editFormData && (
          <Modal closeModal={() => setEditFormData(null)} title='Editar' key='edit-user'>
            <EditUser
              roles={roles}
              selectedUser={editFormData}
              getUsers={getUsers}
              closeModal={() => setEditFormData(null)}
            />
          </Modal>
        )}
        {deleteConfirmation && (
          <Modal closeModal={() => setDeleteConfirmation('')} title='Advertencia' key='delete-user'>
            <DeleteUser
              userId={deleteConfirmation}
              getUsers={getUsers}
              closeModal={() => setDeleteConfirmation('')}
            />
          </Modal>
        )}
        {loading && <LoadingModal message='Cargando Datos' key='loading-modal' />}
      </AnimatePresence>
    </>
  );
}
