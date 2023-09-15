import LoadingIcon from '@/icons/LoadingIcon';
import { motion } from 'framer-motion';

type Props = {
  message?: string;
};

export default function LoadingModal({ message }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='absolute flex items-center justify-center top-0 bottom-0 left-0 right-0 z-20 bg-black/20'>
      <div className='p-8 bg-white rounded flex-col min-h-[250px] min-w-[450px] flex items-center justify-center text-gray-700'>
        <LoadingIcon className='h-20 mb-6 stroke-white' />
        <h1 className='font-bold text-2xl'>{message ? message : 'Cargando'}</h1>
      </div>
    </motion.div>
  );
}
