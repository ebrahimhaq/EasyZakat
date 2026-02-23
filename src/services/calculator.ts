import type {
  Asset,
  ZakatData,
  ZakatCalculationResult,
  AssetCalculation,
  CategorySummary,
  Currency,
  ExchangeRates,
  HawlStatus,
} from '../types';

// ─── Hijri lunar year = 354 days ──────────────────────────────────────────────
const HIJRI_YEAR_DAYS = 354;

// ─── Nisab thresholds ────────────────────────────────────────────────────────
export const NISAB_GOLD_GRAMS = 85;    // 85 grams of gold
export const NISAB_SILVER_GRAMS = 595; // 595 grams of silver

// ─── Gold purity multipliers ─────────────────────────────────────────────────
export const GOLD_PURITY: Record<string, number> = {
  '24k': 1.0,
  '22k': 22 / 24,
  '21k': 21 / 24,
  '18k': 18 / 24,
};

// ─── Convert any currency to SEK ─────────────────────────────────────────────
export function toSEK(amount: number, currency: Currency, rates: ExchangeRates): number {
  return amount * rates[currency];
}

// ─── Convert SEK to display currency ─────────────────────────────────────────
export function fromSEK(amountSEK: number, currency: Currency, rates: ExchangeRates): number {
  if (rates[currency] === 0) return 0;
  return amountSEK / rates[currency];
}

// ─── Compute nisab in SEK ─────────────────────────────────────────────────────
export function getNisabSEK(data: ZakatData): number {
  const { nisab } = data.settings;
  if (nisab.method === 'gold') {
    return NISAB_GOLD_GRAMS * nisab.goldPricePerGramSEK;
  }
  return NISAB_SILVER_GRAMS * nisab.silverPricePerGramSEK;
}

// ─── Compute hawl (lunar year) status ────────────────────────────────────────
export function computeHawlStatus(data: ZakatData): HawlStatus {
  const { nisabMetDate, hawlBroken } = data.settings;

  if (hawlBroken) {
    return {
      state: 'broken',
      nisabMetDate: nisabMetDate ?? '',
      hawlDueDate: '',
      daysElapsed: 0,
      daysRemaining: HIJRI_YEAR_DAYS,
      progressPercent: 0,
    };
  }

  if (!nisabMetDate) {
    return {
      state: 'not_started',
      nisabMetDate: '',
      hawlDueDate: '',
      daysElapsed: 0,
      daysRemaining: HIJRI_YEAR_DAYS,
      progressPercent: 0,
    };
  }

  const start = new Date(nisabMetDate);
  const now = new Date();
  const dueDate = new Date(start);
  dueDate.setDate(dueDate.getDate() + HIJRI_YEAR_DAYS);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysElapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / msPerDay));
  const daysRemaining = Math.max(0, HIJRI_YEAR_DAYS - daysElapsed);
  const progressPercent = Math.min(100, Math.round((daysElapsed / HIJRI_YEAR_DAYS) * 100));

  return {
    state: daysElapsed >= HIJRI_YEAR_DAYS ? 'complete' : 'in_progress',
    nisabMetDate,
    hawlDueDate: dueDate.toISOString().split('T')[0],
    daysElapsed,
    daysRemaining,
    progressPercent,
  };
}

// ─── Main calculation ─────────────────────────────────────────────────────────
export function calculateZakat(data: ZakatData): ZakatCalculationResult {
  const { settings, assets } = data;
  const { exchangeRates, displayCurrency } = settings;
  const nisabSEK = getNisabSEK(data);

  const calculations: AssetCalculation[] = assets.map((asset) => calculateAsset(asset, exchangeRates));

  // Group by category
  const categoryMap = new Map<string, { label: string; items: AssetCalculation[] }>();

  const categoryDefs: Array<{ key: string; label: string }> = [
    { key: 'cash', label: 'Cash & Bank Accounts' },
    { key: 'sweden_stock', label: 'Sweden Stocks (Avanza / Nordnet)' },
    { key: 'pakistan_stock', label: 'Pakistan Stocks (PSX)' },
    { key: 'fund', label: 'Funds (Mutual / Index)' },
    { key: 'gold', label: 'Gold' },
    { key: 'silver', label: 'Silver' },
    { key: 'business', label: 'Business Assets & Inventory' },
    { key: 'receivable', label: 'Receivables (Money Owed to You)' },
    { key: 'liability', label: 'Liabilities & Debts' },
  ];

  for (const def of categoryDefs) {
    categoryMap.set(def.key, { label: def.label, items: [] });
  }

  for (const calc of calculations) {
    const key = calc.asset.type;
    if (!categoryMap.has(key)) {
      categoryMap.set(key, { label: key, items: [] });
    }
    categoryMap.get(key)!.items.push(calc);
  }

  const categories: CategorySummary[] = [];
  let totalWealthSEK = 0;
  let totalLiabilitiesSEK = 0;
  let totalZakatDueSEK = 0;
  let totalZakatAlreadyPaidSEK = 0;

  for (const [category, { label, items }] of categoryMap.entries()) {
    if (items.length === 0) continue;

    const totalValueSEK = items.reduce((s, i) => s + i.zakatableValueSEK, 0);
    const zakatDueSEK = items.reduce((s, i) => s + i.zakatDueSEK, 0);
    const zakatAlreadyPaidSEK = items.reduce((s, i) => s + i.zakatAlreadyPaidSEK, 0);
    const netZakatDueSEK = Math.max(0, zakatDueSEK - zakatAlreadyPaidSEK);

    if (category === 'liability') {
      totalLiabilitiesSEK += totalValueSEK;
    } else {
      totalWealthSEK += totalValueSEK;
      totalZakatDueSEK += zakatDueSEK;
      totalZakatAlreadyPaidSEK += zakatAlreadyPaidSEK;
    }

    categories.push({
      category,
      label,
      totalValueSEK,
      zakatDueSEK,
      zakatAlreadyPaidSEK,
      netZakatDueSEK,
      items,
    });
  }

  const netZakatableWealthSEK = Math.max(0, totalWealthSEK - totalLiabilitiesSEK);
  const meetsNisab = netZakatableWealthSEK >= nisabSEK;
  const netZakatOwedSEK = meetsNisab ? Math.max(0, totalZakatDueSEK - totalZakatAlreadyPaidSEK) : 0;
  const hawlStatus = computeHawlStatus(data);

  return {
    totalWealthSEK,
    totalLiabilitiesSEK,
    netZakatableWealthSEK,
    nisabValueSEK: nisabSEK,
    meetsNisab,
    totalZakatDueSEK: meetsNisab ? totalZakatDueSEK : 0,
    totalZakatAlreadyPaidSEK,
    netZakatOwedSEK,
    categories,
    totalZakatDueDisplay: fromSEK(meetsNisab ? totalZakatDueSEK : 0, displayCurrency, exchangeRates),
    netZakatOwedDisplay: fromSEK(netZakatOwedSEK, displayCurrency, exchangeRates),
    nisabValueDisplay: fromSEK(nisabSEK, displayCurrency, exchangeRates),
    displayCurrency,
    hawlStatus,
  };
}

// ─── Calculate individual asset ───────────────────────────────────────────────
function calculateAsset(asset: Asset, rates: ExchangeRates): AssetCalculation {
  switch (asset.type) {
    case 'cash': {
      const valueSEK = toSEK(asset.amount, asset.currency, rates);
      return {
        asset,
        zakatableValueSEK: valueSEK,
        zakatDueSEK: valueSEK * 0.025,
        zakatAlreadyPaidSEK: 0,
        isExcluded: false,
      };
    }

    case 'sweden_stock': {
      const valueSEK = asset.shares * asset.currentPricePerShare;
      return {
        asset,
        zakatableValueSEK: valueSEK,
        zakatDueSEK: valueSEK * 0.025,
        zakatAlreadyPaidSEK: 0,
        isExcluded: false,
      };
    }

    case 'pakistan_stock': {
      const valuePKR = asset.shares * asset.currentPricePerShare;
      const valueSEK = toSEK(valuePKR, 'PKR', rates);
      const zakatDueSEK = valueSEK * 0.025;
      const alreadyPaidPKR = asset.zakatDeductedAtSource
        ? (asset.zakatAmountDeducted ?? valuePKR * 0.025)
        : 0;
      const alreadyPaidSEK = toSEK(alreadyPaidPKR, 'PKR', rates);
      return {
        asset,
        zakatableValueSEK: valueSEK,
        zakatDueSEK,
        zakatAlreadyPaidSEK: alreadyPaidSEK,
        isExcluded: false,
      };
    }

    case 'gold': {
      const purityMultiplier = GOLD_PURITY[asset.purity] ?? 1;
      const pure24kGrams = asset.weightGrams * purityMultiplier;
      const valueSEK = toSEK(pure24kGrams * asset.pricePerGram, asset.currency, rates);
      return {
        asset,
        zakatableValueSEK: valueSEK,
        zakatDueSEK: valueSEK * 0.025,
        zakatAlreadyPaidSEK: 0,
        isExcluded: false,
      };
    }

    case 'silver': {
      const valueSEK = toSEK(asset.weightGrams * asset.pricePerGram, asset.currency, rates);
      return {
        asset,
        zakatableValueSEK: valueSEK,
        zakatDueSEK: valueSEK * 0.025,
        zakatAlreadyPaidSEK: 0,
        isExcluded: false,
      };
    }

    case 'business': {
      const valueSEK = toSEK(asset.marketValue, asset.currency, rates);
      return {
        asset,
        zakatableValueSEK: valueSEK,
        zakatDueSEK: valueSEK * 0.025,
        zakatAlreadyPaidSEK: 0,
        isExcluded: false,
      };
    }

    case 'receivable': {
      const valueSEK = asset.likelyToBeReceived
        ? toSEK(asset.amount, asset.currency, rates)
        : 0;
      return {
        asset,
        zakatableValueSEK: valueSEK,
        zakatDueSEK: valueSEK * 0.025,
        zakatAlreadyPaidSEK: 0,
        isExcluded: !asset.likelyToBeReceived,
        exclusionReason: !asset.likelyToBeReceived ? 'Marked as unlikely to be received' : undefined,
      };
    }

    case 'liability': {
      const valueSEK = toSEK(asset.amount, asset.currency, rates);
      return {
        asset,
        zakatableValueSEK: valueSEK,
        zakatDueSEK: 0,
        zakatAlreadyPaidSEK: 0,
        isExcluded: false,
      };
    }

    case 'fund': {
      const totalNAV = asset.units * asset.navPerUnit;
      // Apply zakatable portion based on chosen method
      const zakatableFraction =
        asset.zakatMethod === 'equity_ratio'
          ? (asset.zakatablePercent ?? 100) / 100
          : 1;
      const zakatableNAV = totalNAV * zakatableFraction;
      const valueSEK = toSEK(zakatableNAV, asset.currency, rates);
      const zakatDueSEK = valueSEK * 0.025;

      const alreadyPaid = asset.zakatDeductedAtSource
        ? (asset.zakatAmountDeducted ?? totalNAV * 0.025)
        : 0;
      const alreadyPaidSEK = toSEK(alreadyPaid, asset.currency, rates);

      return {
        asset,
        zakatableValueSEK: valueSEK,
        zakatDueSEK,
        zakatAlreadyPaidSEK: alreadyPaidSEK,
        isExcluded: false,
      };
    }
  }
}
