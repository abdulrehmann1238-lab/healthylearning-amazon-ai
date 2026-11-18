import React from 'react';
import type { Product } from '../../types';

interface BookCoverProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
}

export const BookCover: React.FC<BookCoverProps> = ({ product, size = 'sm' }) => {
  const dims =
    size === 'sm'
      ? 'w-9 h-12 rounded-[4px] p-1.5'
      : size === 'md'
        ? 'w-14 h-20 rounded-[5px] p-2'
        : 'w-24 h-32 rounded-[6px] p-3';

  return (
    <div
      className={`${dims} relative shrink-0 overflow-hidden shadow-[0_2px_6px_rgba(24,56,46,0.14)] flex flex-col justify-between select-none`}
      style={{ backgroundColor: product.coverTone.bg, color: product.coverTone.text }}
      aria-hidden="true"
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 opacity-90"
        style={{ backgroundColor: product.coverTone.stripe }}
      />
      <div
        className="h-[2px] w-4 rounded-full ml-1"
        style={{ backgroundColor: product.coverTone.accent }}
      />
      <div className="ml-1">
        {size === 'sm' ? (
          <div className="text-[7px] font-semibold leading-[1.15] line-clamp-3 tracking-tight opacity-95">
            {product.title.split(' ').slice(0, 3).join(' ')}
          </div>
        ) : size === 'md' ? (
          <div className="text-[8.5px] font-semibold leading-[1.2] line-clamp-3 tracking-tight opacity-95">
            {product.title}
          </div>
        ) : (
          <>
            <div className="text-[7.5px] uppercase tracking-[0.08em] opacity-75 mb-1">
              Healthy Learning
            </div>
            <div className="font-editorial text-[11px] font-medium leading-[1.2] line-clamp-4">
              {product.title}
            </div>
            <div
              className="mt-2 h-[1px] w-8 opacity-75"
              style={{ backgroundColor: product.coverTone.accent }}
            />
          </>
        )}
      </div>
    </div>
  );
};
