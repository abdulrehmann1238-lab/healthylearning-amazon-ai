import type { DateRangeKey, InventoryStatus, Product } from '../types';

export function formatCurrency(value: number, decimals = 0): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(abs);
  return value < 0 ? `-${formatted}` : formatted;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatPercent(value: number, includeSign = false, decimals = 1): string {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatRoas(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function getDateRangeMultiplier(range: DateRangeKey): number {
  switch (range) {
    case '7d':
      return 0.24;
    case '30d':
      return 1;
    case '90d':
      return 2.88;
    case 'ytd':
      return 9.65;
  }
}

export function getDateRangeLabel(range: DateRangeKey): string {
  switch (range) {
    case '7d':
      return 'Last 7 Days';
    case '30d':
      return 'Last 30 Days';
    case '90d':
      return 'Last 90 Days';
    case 'ytd':
      return 'Year to Date';
  }
}

export function getCoverageDays(product: Product): number {
  if (product.availableUnits <= 0) return 0;
  if (product.dailyVelocity <= 0) return 999;
  return Math.round(product.availableUnits / product.dailyVelocity);
}

export function getInventoryStatus(
  product: Product,
  lowThresholdDays: number,
  criticalThresholdDays: number
): InventoryStatus {
  if (product.availableUnits <= 0) return 'Out of Stock';
  const days = getCoverageDays(product);
  if (days <= criticalThresholdDays) return 'Critical';
  if (days <= lowThresholdDays) return 'Low Stock';
  return 'Healthy';
}
