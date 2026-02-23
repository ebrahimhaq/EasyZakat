import type { Currency } from '../types';

export function formatCurrency(
  amount: number,
  currency: Currency,
  compact = false
): string {
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  };
  try {
    return new Intl.NumberFormat('en-SE', opts).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString('en-SE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  SEK: 'kr',
  PKR: '₨',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  SEK: 'SEK – Swedish Krona',
  PKR: 'PKR – Pakistani Rupee',
  USD: 'USD – US Dollar',
  EUR: 'EUR – Euro',
  GBP: 'GBP – British Pound',
};
