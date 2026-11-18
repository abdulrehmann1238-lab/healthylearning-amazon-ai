import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  comparison?: string;
  icon: React.ReactNode;
  sparkline?: number[];
  onClick?: () => void;
  active?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  delta,
  deltaPositive = true,
  comparison,
  icon,
  sparkline,
  onClick,
  active = false,
}) => {
  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const span = max - min || 1;
    const width = 68;
    const height = 24;
    const pts = sparkline
      .map((val, i) => {
        const x = (i / (sparkline.length - 1)) * width;
        const y = height - ((val - min) / span) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
    const stroke = deltaPositive ? '#244B3D' : '#B58B4F';

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden="true">
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pts}
        />
      </svg>
    );
  };

  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`text-left w-full bg-white border rounded-xl p-4 sm:p-5 transition-all duration-200 ${
        active
          ? 'border-[#244B3D] ring-1 ring-[#244B3D]/15'
          : 'border-[#E6EAE5] shadow-[0_1px_2px_rgba(32,41,35,0.03)]'
      } ${
        onClick
          ? 'hover:border-[#C7D3C9] hover:shadow-[0_6px_18px_rgba(24,56,46,0.06)] hover:-translate-y-[1px]'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[12.5px] font-medium text-[#748078] truncate">{label}</span>
        <span className="w-7 h-7 rounded-lg bg-[#F0F3EF] text-[#244B3D] flex items-center justify-center shrink-0">
          {icon}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[22px] sm:text-[24px] font-semibold tracking-[-0.025em] text-[#202923] tabular-nums leading-tight">
            {value}
          </div>
          {(delta || comparison) && (
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              {delta && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[12px] font-medium tabular-nums ${
                    deltaPositive ? 'text-[#557F64]' : 'text-[#B58B4F]'
                  }`}
                >
                  {deltaPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {delta}
                </span>
              )}
              {comparison && <span className="text-[11.5px] text-[#748078]">{comparison}</span>}
            </div>
          )}
        </div>
        {sparkline && <div className="shrink-0 pb-0.5">{renderSparkline()}</div>}
      </div>
    </Comp>
  );
};
