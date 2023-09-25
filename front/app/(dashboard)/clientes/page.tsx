import ClientsList from './components/ClientsList';

export default function SettingsPage() {
  return (
    <>
      <h1 className='mx-8 mt-6 text-xl font-semibold text-gray-800'>Clientes</h1>
      <div className='mx-6 my-8 max-w-3xl border-[1px] border-neutral-200 shadow lg:mx-auto'>
        <ClientsList />
      </div>
    </>
  );
}
