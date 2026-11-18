import React from 'react';

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect x="1" y="1" width="30" height="30" rx="7" fill="#18382E" />
    <path
      d="M9.5 10.5L16 8.5L22.5 11.5M9.5 10.5L11 21.5L16 23.5M22.5 11.5L21 21.5L16 23.5M16 8.5V23.5M9.5 10.5L21 21.5"
      stroke="#82988A"
      strokeWidth="1.2"
      strokeOpacity="0.65"
    />
    <circle cx="9.5" cy="10.5" r="2.1" fill="#F7F8F6" />
    <circle cx="16" cy="8.5" r="2.1" fill="#B89B68" />
    <circle cx="22.5" cy="11.5" r="2.1" fill="#F7F8F6" />
    <circle cx="11" cy="21.5" r="2" fill="#E6EDE7" />
    <circle cx="16" cy="23.5" r="2.2" fill="#B89B68" />
    <circle cx="21" cy="21.5" r="2" fill="#E6EDE7" />
    <circle cx="16" cy="16" r="2.4" fill="#F7F8F6" />
  </svg>
);

export const BrandWordmark: React.FC<{ subtitle?: string; compact?: boolean }> = ({
  subtitle,
  compact = false,
}) => (
  <div className="flex items-center gap-2.5 select-none">
    <BrandMark size={compact ? 26 : 30} />
    <div className="flex flex-col leading-none">
      <span className="text-[14px] font-semibold tracking-[-0.015em] text-[#18382E]">
        Healthy Learning <span className="font-normal text-[#748078]">LLC</span>
      </span>
      {subtitle && (
        <span className="mt-0.5 text-[10.5px] font-medium tracking-[0.04em] uppercase text-[#748078]">
          {subtitle}
        </span>
      )}
    </div>
  </div>
);
