import notificationStore from '@/store/notificationStore';
import getErrorMessage from '@/utils/errorHandler';
import { useState } from 'react';

type Props = {
  userId: string;
  getUsers: () => Promise<void>;
  closeModal: () => void;
};

export default function DeleteUser({ userId, getUsers, closeModal }: Props) {
  const updateNotification = notificationStore((state) => state.actions.updateNotification);
  const [loading, setLoading] = useState(false);

  const deleteUser = async (userId: string) => {
    setLoading(true);
    const params = encodeURIComponent(userId);

    try {
      const url = process.env.NEXT_PUBLIC_API_DELETEUSER;

      if (!url) {
        throw new Error('Env API_DELETEUSER not defined');
      }

      const response = await fetch(url + params, {
        credentials: 'include',
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === 'OK') {
          updateNotification({ message: 'Usuario eliminado correctamente', type: 'success' });
          closeModal();
          await getUsers();
        }
      }
      return;
    } catch (error) {
      updateNotification({ message: getErrorMessage(error), type: 'error' });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <p className=''>Esta accion es permanente</p>
      <div className='flex items-center mt-4'>
        <button className='ml-auto hover-btn secondary-btn' onClick={closeModal} type='button'>
          Cancelar
        </button>
        <button
          disabled={loading}
          className='flex items-center ml-2 hover-btn border-red-600 bg-red-600 text-white border-[1px] py-1 px-2 hover:bg-red-800 hover:border-red-800 font-medium rounded'
          onClick={() => deleteUser(userId)}>
          {loading ? 'Eliminando' : 'Eliminar Usuario'}
        </button>
      </div>
    </div>
  );
}
