'use client';

import { useEffect, useState } from 'react';
import ChevronDownIcon from './ui/icons/ChevronDownIcon';
import ChevronUpIcon from './ui/icons/ChevronUpIcon';
import DarkIcon from './ui/icons/DarkIcon';
import LightIcon from './ui/icons/LightIcon';

export default function Navbar() {
  const theme = localStorage.getItem('theme');
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark' ? true : false);

  const openMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const setDarkTheme = () => {
    setIsDarkMode(true);
    const html = document.querySelector('html');
    html?.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  };

  const setLightTheme = () => {
    setIsDarkMode(false);
    const html = document.querySelector('html');
    html?.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  };

  useEffect(() => {
    const html = document.querySelector('html');

    if (!theme) {
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      if (theme === 'dark') {
        setIsDarkMode(true);
        html?.classList.add('dark');
      } else {
        setIsDarkMode(false);
        html?.classList.remove('dark');
      }
    }
  }, []);

  return (
    <nav className='border-b-[1px] border-neutral-200 px-4 py-3 shadow-sm dark:border-neutral-800'>
      <ul className='flex items-center justify-end'>
        <li className=''>
          {!isDarkMode ? (
            <button
              className='hover-btn rounded-full p-2'
              onClick={setDarkTheme}>
              <DarkIcon className='h-6' />
            </button>
          ) : (
            <button
              className='hover-btn rounded-full p-2'
              onClick={setLightTheme}>
              <LightIcon className='h-6' />
            </button>
          )}
        </li>
        <li className='ml-2'>
          <button
            onClick={openMenu}
            className='hover-btn flex items-center justify-center rounded px-3 py-1 transition-all'>
            Profile
            {isOpen ? (
              <ChevronUpIcon className='ml-2 h-5' />
            ) : (
              <ChevronDownIcon className='ml-2 h-5' />
            )}
          </button>
        </li>
      </ul>
    </nav>
  );
}
