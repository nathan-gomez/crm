'use client';

import LoadingModal from '@/components/LoadingModal';
import Modal from '@/components/Modal';
import debounce from '@/lib/debounce';
import { ClientResponse } from '@/models/ApiResponse';
import notificationStore from '@/store/notificationStore';
import getErrorMessage from '@/utils/errorHandler';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import AddClient from './AddClient';

let clientsList: ClientResponse[] = [];

export default function ClientsList() {
  const updateNotification = notificationStore((state) => state.actions.updateNotification);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filteredList, setFilteredList] = useState<ClientResponse[]>([]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toLowerCase().trim();

    if (!input) {
      setFilteredList(clientsList);
      return;
    }

    const filteredList = clientsList.filter((client) =>
      client.nombre.toLowerCase().includes(input)
    );
    setFilteredList(filteredList);
  };

  const debounceSearch = debounce(handleSearch, 300);

  const getClients = useCallback(async () => {
    try {
      setLoading(true);
      const url = process.env.NEXT_PUBLIC_API_GET_CLIENTS;

      if (!url) {
        throw new Error('Env API_GET_CLIENTS; not defined');
      }

      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        updateNotification({ message: 'Ocurrió un error al buscar los clientes', type: 'error' });
      }

      const data = await response.json();
      clientsList = data;
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
      await getClients();
    })();
  }, [getClients]);

  return (
    <>
      <div className='p-4'>
        <div className='flex justify-between'>
          <div className='shrink-0 grow mr-6'>
            <input
              onChange={debounceSearch}
              className='w-full rounded border bg-transparent flex-1 py-1 px-4'
              id='search-client'
              placeholder='Buscar cliente'
              type='text'
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className='rounded border-[1px] text-sm border-primary-600 bg-primary-600 py-1 px-2 text-white hover-btn hover:bg-transparent hover:text-primary-600 font-medium'>
            Añadir Cliente
          </button>
        </div>
        <ul className='w-full mt-4'>
          {filteredList.length > 0 &&
            filteredList.map((user) => (
              <Link key={user.id} href={`/clientes/${user.id}`}>
                <li
                  key={user.id}
                  className='hover:bg-gray-100 transition-all p-2 rounded-sm  cursor-pointer'>
                  {user.nombre}
                </li>
              </Link>
            ))}
        </ul>
      </div>
      <AnimatePresence>
        {showCreateForm && (
          <Modal
            closeModal={() => setShowCreateForm(false)}
            title='Nuevo Cliente'
            key='create-client'>
            <AddClient getClients={getClients} closeModal={() => setShowCreateForm(false)} />
          </Modal>
        )}
        {loading && <LoadingModal message='Cargando Clientes' key='loading-modal' />}
      </AnimatePresence>
    </>
  );
}
