// ─── Currencies supported ───────────────────────────────────────────────────
export type Currency = 'SEK' | 'PKR' | 'USD' | 'EUR' | 'GBP';

// ─── Base asset ─────────────────────────────────────────────────────────────
export interface BaseAsset {
  id: string;
  name: string;
  notes?: string;
}

// ─── Cash & Bank Accounts ───────────────────────────────────────────────────
export interface CashAccount extends BaseAsset {
  type: 'cash';
  country: 'sweden' | 'pakistan' | 'other';
  amount: number;
  currency: Currency;
}

// ─── Sweden Stocks (Avanza / Nordnet / ISK) ─────────────────────────────────
export interface SwedenStock extends BaseAsset {
  type: 'sweden_stock';
  ticker: string;
  shares: number;
  currentPricePerShare: number; // in SEK
  broker: string; // e.g. Avanza, Nordnet
}

// ─── Pakistan Stocks (PSX) ───────────────────────────────────────────────────
export interface PakistanStock extends BaseAsset {
  type: 'pakistan_stock';
  ticker: string;
  shares: number;
  currentPricePerShare: number; // in PKR
  zakatDeductedAtSource: boolean; // CDC deducts 2.5% automatically
  zakatAmountDeducted?: number;   // PKR amount already deducted
}

// ─── Gold ───────────────────────────────────────────────────────────────────
export type GoldPurity = '24k' | '22k' | '21k' | '18k';

export interface GoldAsset extends BaseAsset {
  type: 'gold';
  weightGrams: number;
  purity: GoldPurity;
  country: 'sweden' | 'pakistan' | 'other';
  currency: Currency;
  pricePerGram: number; // in chosen currency
}

// ─── Silver ─────────────────────────────────────────────────────────────────
export interface SilverAsset extends BaseAsset {
  type: 'silver';
  weightGrams: number;
  country: 'sweden' | 'pakistan' | 'other';
  currency: Currency;
  pricePerGram: number;
}

// ─── Business Inventory / Trade Goods ───────────────────────────────────────
export interface BusinessAsset extends BaseAsset {
  type: 'business';
  description: string;
  marketValue: number;
  currency: Currency;
  country: 'sweden' | 'pakistan' | 'other';
}

// ─── Receivables (money owed to you) ─────────────────────────────────────────
export interface Receivable extends BaseAsset {
  type: 'receivable';
  amount: number;
  currency: Currency;
  country: 'sweden' | 'pakistan' | 'other';
  likelyToBeReceived: boolean;
}

// ─── Liabilities / Debts (reduce zakatable wealth) ──────────────────────────
export interface Liability extends BaseAsset {
  type: 'liability';
  amount: number;
  currency: Currency;
  country: 'sweden' | 'pakistan' | 'other';
}

// ─── Mutual / Index Funds ────────────────────────────────────────────────────
export type FundType = 'equity' | 'mixed' | 'money_market' | 'islamic' | 'index';

/**
 * Zakat method for funds:
 *  - 'full_nav'      : Full market value is zakatable (simpler, conservative)
 *  - 'equity_ratio'  : Only the zakatable portion of the fund's holdings (e.g. 30% equity ratio)
 *                      Scholar opinion for passive long-term investors
 */
export type FundZakatMethod = 'full_nav' | 'equity_ratio';

export interface FundAsset extends BaseAsset {
  type: 'fund';
  fundType: FundType;
  country: 'sweden' | 'pakistan' | 'other';
  broker: string;              // e.g. Avanza, Meezan Bank, NBP Funds
  units: number;               // number of units / shares held
  navPerUnit: number;          // current Net Asset Value per unit
  currency: Currency;
  zakatMethod: FundZakatMethod;
  // For equity_ratio method: what % of the fund is zakatable assets (0–100)
  zakatablePercent?: number;
  // For Pakistan funds: zakat may be deducted at source by the fund
  zakatDeductedAtSource: boolean;
  zakatAmountDeducted?: number; // in the fund's currency
}

// ─── Union type for all assets ───────────────────────────────────────────────
export type Asset =
  | CashAccount
  | SwedenStock
  | PakistanStock
  | GoldAsset
  | SilverAsset
  | BusinessAsset
  | Receivable
  | Liability
  | FundAsset;

// ─── Exchange rates (relative to SEK as base for Swedish users) ──────────────
export interface ExchangeRates {
  // How many SEK per 1 unit of currency
  SEK: number; // always 1
  PKR: number;
  USD: number;
  EUR: number;
  GBP: number;
  lastUpdated: string; // ISO date string
}

// ─── Nisab settings ──────────────────────────────────────────────────────────
export interface NisabSettings {
  // Nisab = 85g gold OR 595g silver — user can choose
  method: 'gold' | 'silver';
  // Current gold price in SEK per gram (24k)
  goldPricePerGramSEK: number;
  // Current silver price in SEK per gram
  silverPricePerGramSEK: number;
}

// ─── User settings ───────────────────────────────────────────────────────────
export interface UserSettings {
  displayCurrency: Currency;
  exchangeRates: ExchangeRates;
  nisab: NisabSettings;
  zakatYear: string; // e.g. "2025-2026"
  hawlDate: string; // ISO date — date one lunar year of ownership was completed (legacy, kept for compat)
  /** ISO date — the day your wealth first reached or exceeded the nisab */
  nisabMetDate: string;
  /** True if wealth dropped below nisab during the year (hawl is reset/broken) */
  hawlBroken: boolean;
}

// ─── Hawl (lunar year) status ─────────────────────────────────────────────────
export type HawlState =
  | 'not_started'   // nisabMetDate not set yet
  | 'in_progress'   // nisab met, counting down
  | 'complete'      // 354+ days elapsed, zakat is due
  | 'broken';       // user marked wealth dropped below nisab mid-year

export interface HawlStatus {
  state: HawlState;
  nisabMetDate: string;          // ISO date
  hawlDueDate: string;           // ISO date — nisabMetDate + 354 days
  daysElapsed: number;
  daysRemaining: number;
  progressPercent: number;       // 0–100
}

// ─── Complete app data (stored locally) ──────────────────────────────────────
export interface ZakatData {
  version: string;
  lastModified: string;
  settings: UserSettings;
  assets: Asset[];
}

// ─── Calculation result types ─────────────────────────────────────────────────
export interface AssetCalculation {
  asset: Asset;
  zakatableValueSEK: number; // value converted to SEK
  zakatDueSEK: number;       // 2.5% of zakatable value
  zakatAlreadyPaidSEK: number;
  isExcluded: boolean;
  exclusionReason?: string;
}

export interface CategorySummary {
  category: string;
  label: string;
  totalValueSEK: number;
  zakatDueSEK: number;
  zakatAlreadyPaidSEK: number;
  netZakatDueSEK: number;
  items: AssetCalculation[];
}

export interface ZakatCalculationResult {
  totalWealthSEK: number;
  totalLiabilitiesSEK: number;
  netZakatableWealthSEK: number;
  nisabValueSEK: number;
  meetsNisab: boolean;
  totalZakatDueSEK: number;
  totalZakatAlreadyPaidSEK: number;
  netZakatOwedSEK: number;
  categories: CategorySummary[];
  // Converted to display currency
  totalZakatDueDisplay: number;
  netZakatOwedDisplay: number;
  nisabValueDisplay: number;
  displayCurrency: Currency;
  // Hawl tracking
  hawlStatus: HawlStatus;
}
