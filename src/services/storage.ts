import type { ZakatData, UserSettings, ExchangeRates, NisabSettings } from '../types';

const STORAGE_KEY = 'easyzakat_data';
const APP_VERSION = '1.0.0';

// ─── Default exchange rates (user can update manually) ───────────────────────
const defaultExchangeRates: ExchangeRates = {
  SEK: 1,
  PKR: 0.033,    // 1 PKR ≈ 0.033 SEK
  USD: 10.5,     // 1 USD ≈ 10.5 SEK
  EUR: 11.4,     // 1 EUR ≈ 11.4 SEK
  GBP: 13.3,     // 1 GBP ≈ 13.3 SEK
  lastUpdated: new Date().toISOString(),
};

const defaultNisab: NisabSettings = {
  method: 'gold',
  goldPricePerGramSEK: 950,    // approximate — user should update
  silverPricePerGramSEK: 10.5, // approximate — user should update
};

export const defaultSettings: UserSettings = {
  displayCurrency: 'SEK',
  exchangeRates: defaultExchangeRates,
  nisab: defaultNisab,
  zakatYear: '2025-2026',
  hawlDate: new Date().toISOString().split('T')[0],
  nisabMetDate: '',
  hawlBroken: false,
};

export const defaultZakatData: ZakatData = {
  version: APP_VERSION,
  lastModified: new Date().toISOString(),
  settings: defaultSettings,
  assets: [],
};

// ─── Load from localStorage ──────────────────────────────────────────────────
export function loadData(): ZakatData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultZakatData };
    const parsed = JSON.parse(raw) as ZakatData;
    // Merge with defaults to handle new fields in newer app versions
    return {
      ...defaultZakatData,
      ...parsed,
      settings: {
        ...defaultSettings,
        ...parsed.settings,
        exchangeRates: {
          ...defaultExchangeRates,
          ...parsed.settings?.exchangeRates,
        },
        nisab: {
          ...defaultNisab,
          ...parsed.settings?.nisab,
        },
      },
    };
  } catch {
    return { ...defaultZakatData };
  }
}

// ─── Save to localStorage ────────────────────────────────────────────────────
export function saveData(data: ZakatData): void {
  const toSave: ZakatData = {
    ...data,
    lastModified: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

// ─── Export as JSON file (download) ─────────────────────────────────────────
export function exportData(data: ZakatData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `easyzakat-${data.settings.zakatYear}-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Import from JSON file ───────────────────────────────────────────────────
export function importData(file: File): Promise<ZakatData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as ZakatData;
        // Basic validation
        if (!parsed.assets || !parsed.settings) {
          reject(new Error('Invalid EasyZakat file format'));
          return;
        }
        resolve({
          ...defaultZakatData,
          ...parsed,
          settings: {
            ...defaultSettings,
            ...parsed.settings,
            exchangeRates: {
              ...defaultExchangeRates,
              ...parsed.settings?.exchangeRates,
            },
            nisab: {
              ...defaultNisab,
              ...parsed.settings?.nisab,
            },
          },
        });
      } catch {
        reject(new Error('Could not parse file. Please make sure it is a valid EasyZakat JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// ─── Export as CSV file (download) ──────────────────────────────────────────
export function exportCSV(data: ZakatData): void {
  const headers = [
    'Name',
    'Type',
    'Country',
    'Currency',
    'Amount / Value',
    'Units',
    'NAV per Unit',
    'Shares',
    'Price per Share',
    'Weight (g)',
    'Purity',
    'Fund Type',
    'Zakat Method',
    'Zakatable %',
    'Zakat Deducted at Source',
    'Zakat Amount Deducted',
    'Notes',
  ];

  const escape = (v: string | number | boolean | undefined | null): string => {
    if (v === undefined || v === null) return '';
    const s = String(v);
    // Wrap in quotes if it contains comma, quote or newline
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows: string[][] = data.assets.map((a) => {
    const base = [a.name, a.type];

    switch (a.type) {
      case 'cash':
        return [...base, a.country, a.currency, String(a.amount), '', '', '', '', '', '', '', '', '', '', '', a.notes ?? ''];
      case 'sweden_stock':
        return [...base, 'sweden', 'SEK', '', String(a.shares), '', String(a.shares), String(a.currentPricePerShare), '', '', '', '', '', '', '', a.notes ?? ''];
      case 'pakistan_stock':
        return [...base, 'pakistan', 'PKR', '', String(a.shares), '', String(a.shares), String(a.currentPricePerShare), '', '', '', '', '', String(a.zakatDeductedAtSource), String(a.zakatAmountDeducted ?? ''), a.notes ?? ''];
      case 'gold':
        return [...base, a.country, a.currency, '', '', '', '', '', String(a.weightGrams), a.purity, '', '', '', '', '', a.notes ?? ''];
      case 'silver':
        return [...base, a.country, a.currency, '', '', '', '', '', String(a.weightGrams), '', '', '', '', '', '', a.notes ?? ''];
      case 'business':
        return [...base, a.country, a.currency, String(a.marketValue), '', '', '', '', '', '', '', '', '', '', '', a.notes ?? ''];
      case 'receivable':
        return [...base, a.country, a.currency, String(a.amount), '', '', '', '', '', '', '', '', '', '', '', a.notes ?? ''];
      case 'liability':
        return [...base, a.country, a.currency, String(a.amount), '', '', '', '', '', '', '', '', '', '', '', a.notes ?? ''];
      case 'fund':
        return [...base, a.country, a.currency, '', String(a.units), String(a.navPerUnit), '', '', '', '', a.fundType, a.zakatMethod, String(a.zakatablePercent ?? ''), String(a.zakatDeductedAtSource), String(a.zakatAmountDeducted ?? ''), a.notes ?? ''];
      default:
        return [...base, ...Array(15).fill('')];
    }
  });

  const csvLines = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ];
  const csv = csvLines.join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `easyzakat-${data.settings.zakatYear}-${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Clear all data ──────────────────────────────────────────────────────────
export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
