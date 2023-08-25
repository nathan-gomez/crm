type Props = {
  className?: string;
};

export default function MoreIcon({ className }: Props) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 20 24'
      strokeWidth={2}
      stroke='currentColor'
      className={className ? className : 'h-5'}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z'
      />
    </svg>
  );
}
