'use client';

import MoreIcon from '@/icons/MoreIcon';
import UsersIcon from '@/icons/UsersIcon';
import userStore from '@/store/userStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import HomeIcon from '../icons/HomeIcon';
import SettingsIcon from '../icons/SettingsIcon';
import UserMenu from './UserMenu';
import { UserDataResponse } from '@/models/ApiResponse';

type Links = {
  icon: JSX.Element;
  label: string;
  link: string;
  adminOnly?: boolean;
};

const items: Links[] = [
  { icon: <HomeIcon className='h-6' />, label: 'Inicio', link: '/' },
  { icon: <UsersIcon className='h-6' />, label: 'Usuarios', link: '/users', adminOnly: true },
  { icon: <SettingsIcon className='h-6' />, label: 'Ajustes', link: '/settings' },
];

type Props = {
  user: UserDataResponse
}

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const updateUser = userStore(state => state.actions.updateUser)

  useEffect(() => {
    updateUser(user)
  }, [])

  let filteredLinks = items;
  if (user.role !== 'admin') {
    filteredLinks = items.filter((links) => !links.adminOnly);
  }

  return (
    <aside className='flex h-screen w-[250px] shrink-0 flex-col border-r-[1px] border-neutral-200 p-3 shadow-md transition-all'>
      <div className='px-3 py-3 text-2xl font-bold'>
        <div className=''>Logo</div>
      </div>
      <ul>
        {filteredLinks.map((item) => (
          <Link href={item.link} key={item.label}>
            <li
              className={`hover-btn mb-2 flex cursor-pointer items-center rounded p-3 transition-all ${pathname === item.link && 'font-semibold text-primary-600'}`}>
              {item.icon}
              <span className='pl-2'>{item.label}</span>
            </li>
          </Link>
        ))}
      </ul>
      <div className='relative ml-auto mt-auto'>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className='hover-btn flex items-center rounded px-2 py-3 transition-all'>
          <span>{user.username}</span>
          <MoreIcon className='h-6' />
        </button>
        {isMenuOpen && (
          <div className='absolute bottom-full left-full min-w-[230px] rounded border-[1px] bg-white p-4 shadow-md'>
            <UserMenu />
          </div>)}
      </div>
    </aside>
  );
}
