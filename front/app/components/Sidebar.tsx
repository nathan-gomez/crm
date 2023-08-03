'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HomeIcon from './ui/icons/HomeIcon';
import SettingsIcon from './ui/icons/SettingsIcon';

const items = [
  { icon: <HomeIcon />, label: 'Home', link: '/' },
  { icon: <SettingsIcon />, label: 'Settings', link: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className='h-screen w-[230px] shrink-0 border-r-[1px] border-neutral-200 px-3 shadow-md transition-all dark:border-neutral-800'>
      <div className='px-2 py-6 text-2xl font-bold'>
        <div className=''>Logo</div>
      </div>
      <ul>
        {items.map((item) => (
          <Link href={item.link} key={item.label}>
            <li
              className={`hover-btn mb-2 flex cursor-pointer items-center rounded px-2 py-3 transition-all ${
                pathname === item.link &&
                'text-primary-600 dark:text-primary-200'
              }`}>
              {item.icon}
              <span className='pl-2'>{item.label}</span>
            </li>
          </Link>
        ))}
      </ul>
    </aside>
  );
}
