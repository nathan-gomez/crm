'use client';

import CloseIcon from '@/icons/CloseIcon';
import notificationStore from '@/store/notificationStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

export type NotificationType = {
  type: 'error' | 'warning' | 'success' | 'info' | '';
  message: string;
};

const getTypeClass = (type: NotificationType['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-200 border-green-500';
    case 'error':
      return 'bg-red-200 border-red-500';
    case 'info':
      return 'bg-blue-200 border-blue-500';
    case 'warning':
      return 'bg-yellow-200 border-yellow-500';
    default:
      return 'bg-gray-200 border-gray-500';
  }
};

export default function Notification() {
  const updateNotification = notificationStore((state) => state.actions.updateNotification);
  const message = notificationStore((state) => state.message);
  const type = notificationStore((state) => state.type);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (message) {
      timeout = setTimeout(() => {
        updateNotification({ type: '', message: '' });
      }, 7000);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [message]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key='notification-toast'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-5 right-0 mr-8 min-w-[300px] max-w-[700px] rounded-md border-l-4 ${getTypeClass(
            type
          )}`}>
          <div className='flex w-full items-center justify-between p-2'>
            <p className='w-full p-3 text-neutral-800'>{message}</p>
            <button
              onClick={() => updateNotification({ type: '', message: '' })}
              className='h-full transition-all hover:scale-110'>
              <CloseIcon className='h-6' />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
