import HomeIcon from './ui/icons/HomeIcon';
import SettingsIcon from './ui/icons/SettingsIcon';

const items = [
  { icon: <HomeIcon />, label: 'Home' },
  { icon: <SettingsIcon />, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className='h-screen w-[230px] shrink-0 border-r-[1px] border-neutral-200 px-4 shadow-md transition-all dark:border-neutral-800'>
      <div className='py-6 text-2xl font-bold'>
        <div className=''>Logo</div>
      </div>
      <ul className=''>
        {items.map((item) => (
          <li
            key={item.label}
            className='hover-btn mb-2 flex cursor-pointer items-center rounded px-2 py-3 transition-all'>
            {item.icon}
            <span className='pl-2'>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
