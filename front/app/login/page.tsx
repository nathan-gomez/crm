import LoginForm from './LoginForm';

export default function Login() {
  return (
    <div className='flex h-full items-center justify-center px-8 py-12'>
      <div className='flex h-full grow items-center justify-evenly rounded border-[1px] shadow-sm dark:border-neutral-600'>
        <div className='hidden basis-1/2 items-center justify-center lg:flex'>
          <h1>Imagen</h1>
        </div>

        <div className='flex h-full grow basis-1/2 items-center justify-center px-10 dark:border-neutral-600 lg:border-l-[1px] xl:px-20'>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
