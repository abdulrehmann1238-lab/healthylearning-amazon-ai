import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[#244B3D] text-white border border-[#244B3D] hover:bg-[#18382E] active:scale-[0.99] shadow-[0_1px_2px_rgba(24,56,46,0.12)]',
  secondary:
    'bg-[#F0F3EF] text-[#202923] border border-[#E6EAE5] hover:bg-[#E6EDE7] active:scale-[0.99]',
  outline:
    'bg-white text-[#202923] border border-[#DCE2DB] hover:bg-[#F7F8F6] hover:border-[#C5CFC7] active:scale-[0.99]',
  ghost:
    'bg-transparent text-[#4F5B53] border border-transparent hover:bg-[#F0F3EF] hover:text-[#202923]',
  danger:
    'bg-[#B66A65] text-white border border-[#B66A65] hover:bg-[#9E5651] active:scale-[0.99]',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-2.5 py-1.5 text-[12.5px] rounded-md gap-1.5',
  md: 'px-3.5 py-2 text-[13.5px] rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-[14px] rounded-lg gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => (
  <button
    className={`inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);
