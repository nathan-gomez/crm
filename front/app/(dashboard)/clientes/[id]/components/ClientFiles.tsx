import LoadingModal from '@/components/LoadingModal';
import Modal from '@/components/Modal';
import { ClientFilesResponse, FileDownloadResponse } from '@/models/ApiResponse';
import notificationStore from '@/store/notificationStore';
import userStore from '@/store/userStore';
import { base64ToFile, fileToBase64 } from '@/utils/files';
import { AnimatePresence } from 'framer-motion';
import { ChangeEvent, FormEvent, useState } from 'react';

type Props = {
  fileList: ClientFilesResponse;
  getClientFiles: () => Promise<void>;
  codigoCliente: string;
};

export default function ClientFiles({ fileList, getClientFiles, codigoCliente }: Props) {
  const [loading, setLoading] = useState(false);
  const updateNotification = notificationStore((state) => state.actions.updateNotification);
  const [file, setFile] = useState<File | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docCommentInput, setDocCommentInput] = useState('');
  const userName = userStore((state) => state.username);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const closeDocModal = () => {
    setFile(null)
    setDocCommentInput('')
    setShowDocModal(false);
  };

  const docCommentInputHandler = (e: ChangeEvent<HTMLTextAreaElement>) => setDocCommentInput(e.target.value)

  const downloadFileHandler = async (path: string) => {
    setLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_DOWNLOAD;

      if (!url) {
        throw new Error('Env API_DOWNLOAD not defined');
      }

      const request = { path: path, type: 'asd' };

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        updateNotification({
          message: 'No se encontró el archivo',
          type: 'warning',
        });
      }

      const data: FileDownloadResponse = await response.json();
      base64ToFile(data.file, data.type);
    } catch (err) {
      updateNotification({
        message: 'Ocurrió un error al descargar el documento, intente de nuevo',
        type: 'error',
      });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadFileHandler = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_API_UPLOAD;

      if (!url) {
        throw new Error('Env API_UPLOAD not defined');
      }

      if (!file) {
        updateNotification({
          message: 'Ningun archivo seleccionado',
          type: 'warning',
        });
        return;
      }

      const base64String = await fileToBase64(file);

      const request = {
        file: base64String,
        fileName: file.name,
        user: userName,
        codigoCliente,
        comentario: docCommentInput?.trim()
      };

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        updateNotification({
          message: 'Documento guardado.',
          type: 'success',
        });
        await getClientFiles();
        closeDocModal()
        return;
      }
    } catch (err) {
      updateNotification({
        message: 'Ocurrió un error al subir el documento, intente de nuevo',
        type: 'error',
      });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='mb-4 border-[1px] border-neutral-200 shadow p-4 relative'>
        <h2 className='text-gray-800 font-semibold text-lg'>Documentos</h2>
        <ul className='mt-2'>
          <div className='mb-3'>
            <button
              className='cursor-pointer button hover-btn primary-btn'
              onClick={() => setShowDocModal(true)}>
              Adjuntar Documento
            </button>
          </div>
          {fileList.length > 0 ? (
            <ul>
              {fileList.map((item, i) => (
                <li key={i} className='mb-2'>
                  <div
                    className='hover-btn border hover:bg-gray-100 w-full p-2 flex justify-between cursor-pointer'
                    onClick={() => downloadFileHandler(item.path)}>
                    <p className='text-sm'>{item.path}</p>
                    <p>{new Date(item.uploadDate).toLocaleString('es-ES')}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className='mt-1'>
              <p className='text-gray-500 text-sm'>El cliente no posee documentos</p>
            </div>
          )}
        </ul>
      </div>
      <AnimatePresence>
        {loading && <LoadingModal message='Cargando' key='loading-modal' />}
        {showDocModal && (
          <Modal closeModal={closeDocModal} title='Nuevo Documento'>
            <form onSubmit={uploadFileHandler}>
              <label htmlFor='new-file' autoFocus className='cursor-pointer primary-btn max-w-sm mx-auto hover-btn block text-center border'>
                Añadir
              </label>
              <input type='file' id='new-file' className='hidden' onChange={handleFileChange} />
              <div className='mt-4'>
                <p className='text-gray-500 mb-1'>
                  <span className='font-semibold text-sm'>Nombre</span>
                  <span className='pl-2'>{file?.name}</span>
                </p>
                <label className='text-gray-500 font-semibold text-sm block mb-1'>Comentario</label>
                <textarea
                  rows={5}
                  onChange={docCommentInputHandler}
                  value={docCommentInput}
                  className='w-full bg-gray-100 rounded border p-2' />
              </div>
              <div className='flex justify-end mt-2'>
                <button className='hover-btn secondary-btn mr-2' type='button' onClick={closeDocModal}>
                  Cancelar
                </button>
                <button className='hover-btn primary-btn' type='submit'>Guardar</button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
