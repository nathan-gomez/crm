import userStore from '@/store/userStore';
import getErrorMessage from '@/utils/errorHandler';
import { useRouter } from 'next/navigation';
import LogoutIcon from '../icons/LogoutIcon';
import notificationStore from '@/store/notificationStore';

export default function UserMenu() {
  const updateUser = userStore((state) => state.actions.updateUser);
  const updateNotification = notificationStore((state) => state.actions.updateNotification);
  const router = useRouter();

  const logoutHandler = async () => {
    const url = process.env.NEXT_PUBLIC_API_LOGOUT;

    if (!url) {
      throw new Error('Env API_LOGOUT not defined');
    }

    try {
      const response = await fetch(url, {
        credentials: 'include',
        method: 'GET'
      })

      if (response.ok) {
        updateUser({
          role: null,
          username: null,
        });
        router.push('/login');
      }
    } catch (error) {
      updateNotification({
        message: getErrorMessage(error),
        type: 'error'
      })
      console.log(getErrorMessage(error));
    }
  };

  return (
    <ul>
      <li className='flex'>
        <button onClick={logoutHandler} className='hover-btn flex w-full items-center rounded p-2'>
          <p className='mr-auto'>Salir</p>
          <LogoutIcon className='h-6' />
        </button>
      </li>
    </ul>
  );
}
