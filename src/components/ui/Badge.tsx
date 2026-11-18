import React from 'react';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'forest' | 'gold';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-[#F0F3EF] text-[#4C5850] border-[#E6EAE5]',
  success: 'bg-[#EBF2ED] text-[#355A42] border-[#CFE0D4]',
  warning: 'bg-[#F7F1E5] text-[#84622E] border-[#E8D8BC]',
  error: 'bg-[#F6EAE9] text-[#8E433E] border-[#E5C9C6]',
  forest: 'bg-[#E6EDE7] text-[#18382E] border-[#C9D8CC]',
  gold: 'bg-[#F5EFE3] text-[#7D6538] border-[#E2D4B7]',
};

const dotClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-[#748078]',
  success: 'bg-[#557F64]',
  warning: 'bg-[#B58B4F]',
  error: 'bg-[#B66A65]',
  forest: 'bg-[#244B3D]',
  gold: 'bg-[#B89B68]',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11.5px] font-medium leading-4 whitespace-nowrap ${variantClasses[variant]} ${className}`}
  >
    {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[variant]}`} aria-hidden="true" />}
    {children}
  </span>
);
