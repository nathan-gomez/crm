'use client';

import { useEffect, useState } from 'react';
import DarkIcon from './ui/icons/DarkIcon';
import LightIcon from './ui/icons/LightIcon';
import LogoutIcon from './ui/icons/LogoutIcon';

export default function Navbar() {
  const theme = localStorage.getItem('theme');
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark' ? true : false);
  const setDarkTheme = () => {
    setIsDarkMode(true);
    const html = document.querySelector('html');
    html?.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  };

  const logoutHandler = () => {};

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
        <li>
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
        <li>
          <button
            onClick={logoutHandler}
            className='hover-btn flex items-center justify-center rounded-full p-2 transition-all'>
            <LogoutIcon className='h-6' />
          </button>
        </li>
      </ul>
    </nav>
  );
}
