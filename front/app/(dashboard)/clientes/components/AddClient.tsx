import LoadingIcon from '@/icons/LoadingIcon';
import { DefaultResponse } from '@/models/ApiResponse';
import notificationStore from '@/store/notificationStore';
import getErrorMessage from '@/utils/errorHandler';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';

type Props = {
  getClients: () => Promise<void>;
  closeModal: () => void;
};

export default function AddClient({ getClients, closeModal }: Props) {
  const updateNotification = notificationStore((state) => state.actions.updateNotification);
  const nombreRef = useRef<HTMLInputElement>(null);
  const numeroRef = useRef<HTMLInputElement>(null);
  const rucRef = useRef<HTMLInputElement>(null);
  const comentarioRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tipoInput, setTipoInput] = useState('F');

  const handleTipoInput = (e: ChangeEvent<HTMLInputElement>) => setTipoInput(e.target.value);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_API_CREATE_CLIENT;
      const params = {
        nombre: nombreRef.current?.value.trim(),
        nro_tel: numeroRef.current?.value.trim(),
        ruc: rucRef.current?.value.trim(),
        comentario: comentarioRef.current?.value.trim(),
        tipo: tipoInput,
      };

      if (!url) {
        throw new Error('Env API_CREATE_CLIENT not defined');
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

        if (data.message === 'OK') {
          await getClients();
          updateNotification({ message: 'Cliente añadido', type: 'success' });
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
    <form onSubmit={submitHandler}>
      <div className='mb-2 flex items-center justify-end'>
        <label htmlFor='username' className='w-[130px] font-bold pr-6'>
          Nombre
        </label>
        <input
          ref={nombreRef}
          id='nombre'
          name='nombre'
          type='text'
          autoFocus
          className='w-full rounded border bg-transparent flex-1 py-1 px-4'
          required
        />
      </div>

      <div className='mb-2 flex items-center'>
        <label htmlFor='pass' className='w-[130px] font-bold cursor-pointer pr-6'>
          Número de Contacto
        </label>
        <input
          ref={numeroRef}
          id='numero'
          name='numero'
          type='text'
          className='w-full rounded border bg-transparent py-1 pl-4 pr-10 flex-1'
        />
      </div>

      <div className='mb-3 flex items-center'>
        <label htmlFor='ruc-ci' className='w-[130px] cursor-pointer font-bold pr-6'>
          RUC/CI
        </label>
        <input
          ref={rucRef}
          id='ruc-ci'
          name='ruc-ci'
          type='text'
          className='w-full rounded border bg-transparent py-1 pl-4 pr-10 flex-1'
        />
      </div>

      <div className='flex items-center mb-4'>
        <p className='w-[130px] shrink-0 block font-bold '>Tipo</p>
        <div className='flex w-full'>
          <div className='flex mr-3 cursor-pointer'>
            <input
              name='tipo'
              id='fisico'
              value='F'
              type='radio'
              onChange={handleTipoInput}
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
              onChange={handleTipoInput}
              checked={tipoInput === 'J'}
            />
            <label htmlFor='juridico' className='pl-2 cursor-pointer'>
              Jurídico
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className='block mb-2 font-semibold cursor-pointer' htmlFor='comentario'>
          Comentario
        </label>
        <textarea
          ref={comentarioRef}
          rows={5}
          id='comentario'
          name='comentario'
          className='w-full rounded-sm border bg-transparent py-1 pl-4 pr-10'
        />
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
            'Añadir Cliente'
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
