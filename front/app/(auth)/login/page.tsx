import loginPic from '@/public/login-img.jpg';
import Image from 'next/image';
import LoginForm from './LoginForm';

export default function Login() {
  return (
    <div className='py-12 h-full px-8 max-w-6xl mx-auto'>
      <div className='flex h-full items-center rounded border-[1px] shadow-sm'>
        <div className='relative hidden basis-1/2 items-center justify-center xl:flex'>
          <Image
            src={loginPic}
            alt='Stock image'
            className='h-[829px] w-full'
            placeholder='blur'
            priority
            style={{
              objectFit: 'cover',
            }}
          />
        </div>

        <div className='flex h-full flex-1 items-center justify-center p-10 lg:border-l-[1px]'>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
