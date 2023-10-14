import CloseIcon from '@/icons/CloseIcon';
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useRef } from 'react';

type Props = {
  children: ReactNode;
  closeModal: () => void;
  title?: string;
};

export default function Modal({ children, closeModal, title }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeModal]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      ref={backdropRef}
      className='fixed flex items-center justify-center top-0 bottom-0 left-0 right-0 z-20 bg-black/20'>
      <div
        ref={modalRef}
        className='px-6 pb-6 bg-white rounded min-w-[450px] md:min-w-[550px] lg:min-w-[700px]'>
        <div className='flex items-center my-4'>
          <h1 className='font-semibold text-xl text-gray-800'>{title}</h1>
          <button
            className='ml-auto block hover:text-red-500 hover-btn'
            onClick={() => closeModal()}>
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </motion.div>
  );
}
