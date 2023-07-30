'use client';

import { useState } from 'react';
import ArrowLeftIcon from './ui/icons/ArrowLeftIcon';
import ArrowRightIcon from './ui/icons/ArrowRightIcon';
import HomeIcon from './ui/icons/HomeIcon';

const items = [
  { icon: <HomeIcon />, label: 'Item 1' },
  { icon: <HomeIcon />, label: 'Item 2' },
  { icon: <HomeIcon />, label: 'Item 3' },
  { icon: <HomeIcon />, label: 'Item 4' },
  { icon: <HomeIcon />, label: 'Item 5' },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMenu = () => setIsExpanded(!isExpanded);

  return (
    <aside
      className={`${
        isExpanded ? 'w-[230px]' : 'w-[130px]'
      } h-screen border-r-[1px] border-r-neutral-400 transition-all`}>
      <div className='flex items-center justify-between px-4 py-6 text-2xl font-bold'>
        <div className=''>Logo</div>
        <button
          onClick={toggleMenu}
          className={`transition-all ${
            isExpanded ? 'hover:pr-2' : 'hover:pl-4'
          }`}>
          {isExpanded ? <ArrowLeftIcon /> : <ArrowRightIcon />}
        </button>
      </div>
      <ul className=''>
        {items.map((item) => (
          <li
            className={`flex cursor-pointer items-center border-y-[1px] border-l-8 border-transparent py-3 pl-2 transition-all hover:border-primary-600 hover:pl-4 hover:text-primary-600 ${
              !isExpanded && ''
            }`}>
            {item.icon}
            <span className={`pl-2 ${!isExpanded && 'hidden'}`}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
