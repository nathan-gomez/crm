'use client';

import MoreIcon from '@/icons/MoreIcon';
import UsersIcon from '@/icons/UsersIcon';
import userStore from '@/store/userStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import HomeIcon from '../icons/HomeIcon';
import SettingsIcon from '../icons/SettingsIcon';

type Links = {
  icon: JSX.Element;
  label: string;
  link: string;
  adminOnly?: boolean;
};

const items: Links[] = [
  { icon: <HomeIcon className='h-6' />, label: 'Inicio', link: '/' },
  {
    icon: <UsersIcon className='h-6' />,
    label: 'Usuarios',
    link: '/users',
    adminOnly: true,
  },
  {
    icon: <SettingsIcon className='h-6' />,
    label: 'Ajustes',
    link: '/settings',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const userRole = userStore((state) => state.role);
  const username = userStore((state) => state.username);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  let filteredLinks = items;
  if (userRole !== 'admin') {
    filteredLinks = items.filter((links) => !links.adminOnly);
  }

  function openMenu() {}

  return (
    <aside className='flex h-screen w-[250px] shrink-0 flex-col border-r-[1px] border-neutral-200 p-3 shadow-md transition-all dark:border-neutral-800'>
      <div className='px-3 py-3 text-2xl font-bold'>
        <div className=''>Logo</div>
      </div>
      <ul>
        {filteredLinks.map((item) => (
          <Link href={item.link} key={item.label}>
            <li
              className={`hover-btn mb-2 flex cursor-pointer items-center rounded p-3 transition-all ${
                pathname === item.link &&
                'font-semibold text-primary-600 dark:text-primary-200'
              }`}>
              {item.icon}
              <span className='pl-2'>{item.label}</span>
            </li>
          </Link>
        ))}
      </ul>
      {username && (
        <div className='relative ml-auto mt-auto'>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='hover-btn flex items-center rounded px-2 py-3 transition-all'>
            <span>{username}</span>
            <MoreIcon className='h-6' />
          </button>
          {isMenuOpen && (
            <div className='absolute bottom-full left-full min-w-[200px] rounded border-[1px] bg-white p-4 shadow-md'>
              Menu
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
