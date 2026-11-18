import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padded = true,
  hoverable = false,
  className = '',
  ...props
}) => (
  <div
    className={`bg-white border border-[#E6EAE5] rounded-xl shadow-[0_1px_2px_rgba(32,41,35,0.03)] ${
      padded ? 'p-5' : ''
    } ${
      hoverable
        ? 'transition-all duration-200 hover:border-[#CFD8D0] hover:shadow-[0_4px_14px_rgba(24,56,46,0.06)]'
        : ''
    } ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
    <div>
      <h2 className="text-[15.5px] font-semibold tracking-[-0.01em] text-[#202923]">{title}</h2>
      {subtitle && <p className="text-[12.5px] text-[#748078] mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
  </div>
);
