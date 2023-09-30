'use client';

import LoadingModal from '@/components/LoadingModal';
import EditIcon from '@/icons/EditIcon';
import LeftArrowIcon from '@/icons/LeftArrowIcon';
import { ClientResponse, DefaultResponse } from '@/models/ApiResponse';
import notificationStore from '@/store/notificationStore';
import getErrorMessage from '@/utils/errorHandler';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

type Params = {
  params: {
    id: string;
  };
};

export default function ClientPage({ params }: Params) {
  const router = useRouter();
  const updateNotification = notificationStore((state) => state.actions.updateNotification);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [clientData, setClientData] = useState<ClientResponse>();
  const [tipoInput, setTipoInput] = useState('F');
  const nombreRef = useRef<HTMLInputElement>(null);
  const rucRef = useRef<HTMLInputElement>(null);
  const nroTelRef = useRef<HTMLInputElement>(null);
  const comentarioRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const url = process.env.NEXT_PUBLIC_API_UPDATE_CLIENT;
      const nombre = nombreRef.current?.value.trim();

      if (!nombre) {
        updateNotification({
          message: 'El nombre del cliente no puede estar vacio',
          type: 'warning',
        });
        return;
      }

      const req: ClientResponse = {
        id: parseInt(params.id),
        nombre,
        ruc: rucRef.current?.value,
        tipo: tipoInput,
        nro_tel: nroTelRef.current?.value,
        comentario: comentarioRef.current?.value,
      };

      if (!url) {
        throw new Error('Env API_UPDATE_CLIENT not defined');
      }

      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify(req),
      });

      if (!response.ok) {
        updateNotification({
          message: 'Ocurrió un error al actualizar los datos del cliente, intente de nuevo',
          type: 'error',
        });
      }

      const data: DefaultResponse = await response.json();

      if ('message' in data) {
        await getClient();
        updateNotification({ message: 'Cliente actualizado', type: 'success' });
      } else {
        updateNotification({ message: getErrorMessage(data.error), type: 'error' });
      }
    } catch (error) {
      updateNotification({ message: getErrorMessage(error), type: 'error' });
      console.log(error);
    } finally {
      setLoading(false);
    }

    setEditMode(false);
  };

  const getClient = useCallback(async () => {
    try {
      setLoading(true);
      const url = process.env.NEXT_PUBLIC_API_GET_CLIENT;

      if (!url) {
        throw new Error('Env API_GET_CLIENT not defined');
      }

      const response = await fetch(url + params.id, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        updateNotification({
          message: 'Ocurrió un error al buscar los datos del cliente, intente de nuevo',
          type: 'error',
        });
      }

      const data: ClientResponse = await response.json();
      setClientData(data);
      setTipoInput(data.tipo || 'F');
    } catch (error) {
      updateNotification({ message: getErrorMessage(error), type: 'error' });
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [params.id, updateNotification]);

  useEffect(() => {
    (async () => {
      await getClient();
    })();
  }, [getClient]);

  return (
    <>
      <div className='m-4'>
        <button
          onClick={router.back}
          className='flex items-center justify-center hover-btn hover:text-primary-500'>
          <LeftArrowIcon className='h-6' />
        </button>
      </div>

      <div className='mx-6 my-8 max-w-3xl border-[1px] border-neutral-200 shadow lg:mx-auto p-4 relative'>
        {clientData !== null &&
          (!editMode ? (
            <>
              <h1 className='text-xl'>{clientData?.nombre}</h1>
              <p className='mb-2'>{clientData?.tipo === 'F' ? 'Físico' : 'Jurídico'}</p>
              <p className='mb-2'>
                <span className='font-semibold'>RUC:</span>{' '}
                {clientData?.ruc ? clientData.ruc : <span className='text-gray-500'>N/A</span>}
              </p>
              <p className='mb-2'>
                <span className='font-semibold'>Contacto:</span>{' '}
                {clientData?.nro_tel ? (
                  clientData.nro_tel
                ) : (
                  <span className='text-gray-500'>N/A</span>
                )}
              </p>
              <p className='mb-3'>
                <span className='font-semibold'>Comentario:</span>{' '}
                {clientData?.comentario ? (
                  clientData.comentario
                ) : (
                  <span className='text-gray-500'>N/A</span>
                )}
              </p>
              <button
                className='hover-btn primary-btn ml-auto block'
                type='button'
                onClick={() => setEditMode(true)}>
                Editar
              </button>
            </>
          ) : (
            <>
              <EditIcon className='h-5 absolute top-0 right-0 m-3' />
              <form onSubmit={handleSubmit}>
                <input
                  ref={nombreRef}
                  className='text-xl block py-1 px-3 rounded-sm mb-3 border'
                  required
                  defaultValue={clientData?.nombre}
                />

                <div className='flex w-full mb-2'>
                  <p className='mr-2 shrink-0 block font-bold '>Tipo</p>
                  <div className='flex mr-3 cursor-pointer'>
                    <input
                      name='tipo'
                      id='fisico'
                      value='F'
                      type='radio'
                      onChange={() => setTipoInput('F')}
                      checked={tipoInput === 'F'}
                    />
                    <label htmlFor='fisico' className='pl-2 cursor-pointer'>
                      Físico
                    </label>
                  </div>

                  <div className='flex'>
                    <input
                      name='tipo'
                      id='juridico'
                      value='J'
                      type='radio'
                      onChange={() => setTipoInput('J')}
                      checked={tipoInput === 'J'}
                    />
                    <label htmlFor='juridico' className='pl-2 cursor-pointer'>
                      Jurídico
                    </label>
                  </div>
                </div>

                <div className='flex flex-col mb-2'>
                  <label className='font-semibold mb-1'>RUC</label>
                  <input
                    ref={rucRef}
                    className='py-1 px-3 rounded-sm border'
                    defaultValue={clientData?.ruc}
                  />
                </div>

                <div className='flex flex-col mb-2'>
                  <label className='font-semibold mb-1'>Contacto</label>
                  <input
                    ref={nroTelRef}
                    className='py-1 px-3 rounded-sm border'
                    defaultValue={clientData?.nro_tel}
                  />
                </div>

                <label className='font-semibold mb-2 block'>Comentario</label>
                <textarea
                  ref={comentarioRef}
                  className='mb-3 w-full rounded-sm border bg-transparent py-1 pl-4 pr-10'
                  rows={5}
                  defaultValue={clientData?.comentario}
                />
                <div className='flex justify-end'>
                  <button
                    className='hover-btn secondary-btn mr-2'
                    onClick={() => setEditMode(false)}
                    type='button'>
                    Cancelar
                  </button>
                  <button className='hover-btn primary-btn' type='submit'>
                    Guardar
                  </button>
                </div>
              </form>
            </>
          ))}
      </div>
      <AnimatePresence>
        {loading && <LoadingModal message='Cargando' key='loading-modal' />}
      </AnimatePresence>
    </>
  );
}
