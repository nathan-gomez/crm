import notificationStore from '@/store/notificationStore';
import userStore from '@/store/userStore';
import getErrorMessage from '@/utils/errorHandler';
import { useRouter } from 'next/navigation';
import { RefObject, useEffect, useRef } from 'react';
import LogoutIcon from '../icons/LogoutIcon';

type Props = {
  setIsMenuOpen: (isOpen: boolean) => void;
  buttonRef: RefObject<HTMLButtonElement>;
};

export default function UserMenu({ setIsMenuOpen, buttonRef }: Props) {
  const menuRef = useRef<HTMLUListElement>(null);
  const updateUser = userStore((state) => state.actions.updateUser);
  const updateNotification = notificationStore((state) => state.actions.updateNotification);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        event.target &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logoutHandler = async () => {
    const url = process.env.NEXT_PUBLIC_API_LOGOUT;

    if (!url) {
      throw new Error('Env API_LOGOUT not defined');
    }

    try {
      const response = await fetch(url, {
        credentials: 'include',
        method: 'GET',
      });

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
        type: 'error',
      });
      console.log(getErrorMessage(error));
    }
  };

  return (
    <ul ref={menuRef}>
      <li className='flex'>
        <button onClick={logoutHandler} className='hover-btn flex w-full items-center rounded p-2'>
          <LogoutIcon className='h-6' />
          <p className='pl-3'>Salir</p>
        </button>
      </li>
    </ul>
  );
}
