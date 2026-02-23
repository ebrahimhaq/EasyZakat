import { useState } from 'react';
import { X, Info } from 'lucide-react';
import type { FundAsset, FundType, FundZakatMethod, Currency } from '../../types';
import { Input, Select, Button, Toggle } from '../ui';
import { generateId } from '../../utils/format';

const CURRENCIES = [
  { value: 'SEK', label: 'SEK – Swedish Krona' },
  { value: 'PKR', label: 'PKR – Pakistani Rupee' },
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'GBP', label: 'GBP – British Pound' },
];

const FUND_TYPES: Array<{ value: FundType; label: string }> = [
  { value: 'equity', label: 'Equity Fund (stocks only)' },
  { value: 'index', label: 'Index Fund (e.g. S&P 500, OMXS30)' },
  { value: 'mixed', label: 'Mixed / Balanced Fund (stocks + bonds)' },
  { value: 'islamic', label: 'Islamic / Shariah-compliant Fund' },
  { value: 'money_market', label: 'Money Market / Fixed Income Fund' },
];

const COUNTRIES = [
  { value: 'sweden', label: 'Sweden' },
  { value: 'pakistan', label: 'Pakistan' },
  { value: 'other', label: 'Other' },
];

const ZAKAT_METHODS: Array<{ value: FundZakatMethod; label: string }> = [
  { value: 'full_nav', label: 'Full NAV value (simpler, conservative)' },
  { value: 'equity_ratio', label: 'Zakatable % of holdings (scholar-guided)' },
];

interface Props {
  existing?: FundAsset;
  onSave: (asset: FundAsset) => void;
  onClose: () => void;
}

export function FundForm({ existing, onSave, onClose }: Props) {
  const [form, setForm] = useState<Partial<FundAsset>>(
    existing ?? {
      type: 'fund',
      fundType: 'equity',
      country: 'sweden',
      currency: 'SEK',
      broker: '',
      units: 0,
      navPerUnit: 0,
      zakatMethod: 'full_nav',
      zakatablePercent: 100,
      zakatDeductedAtSource: false,
    }
  );

  const set = (k: keyof FundAsset, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const totalNAV = (Number(form.units) || 0) * (Number(form.navPerUnit) || 0);
  const zakatableFraction =
    form.zakatMethod === 'equity_ratio'
      ? (Number(form.zakatablePercent) || 100) / 100
      : 1;
  const zakatableNAV = totalNAV * zakatableFraction;
  const estimatedZakat = zakatableNAV * 0.025;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.units || !form.navPerUnit) return;
    const deducted = form.zakatDeductedAtSource ?? false;
    onSave({
      id: form.id ?? generateId(),
      type: 'fund',
      name: form.name.trim(),
      fundType: (form.fundType as FundType) ?? 'equity',
      country: (form.country as FundAsset['country']) ?? 'sweden',
      broker: form.broker ?? '',
      units: Number(form.units),
      navPerUnit: Number(form.navPerUnit),
      currency: (form.currency as Currency) ?? 'SEK',
      zakatMethod: (form.zakatMethod as FundZakatMethod) ?? 'full_nav',
      zakatablePercent:
        form.zakatMethod === 'equity_ratio'
          ? Number(form.zakatablePercent) || 100
          : 100,
      zakatDeductedAtSource: deducted,
      zakatAmountDeducted: deducted
        ? form.zakatAmountDeducted !== undefined
          ? Number(form.zakatAmountDeducted)
          : estimatedZakat
        : 0,
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">
            {existing ? 'Edit' : 'Add'} Fund
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name & Fund Type */}
          <Input
            label="Fund Name"
            placeholder="e.g. Länsförsäkringar Global, Meezan Islamic Fund"
            value={form.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Fund Type"
              value={form.fundType ?? 'equity'}
              options={FUND_TYPES}
              onChange={(e) => set('fundType', e.target.value)}
            />
            <Select
              label="Country"
              value={form.country ?? 'sweden'}
              options={COUNTRIES}
              onChange={(e) => set('country', e.target.value)}
            />
          </div>

          <Input
            label="Broker / Platform"
            placeholder="e.g. Avanza, Nordnet, Meezan Bank, NBP Funds"
            value={form.broker ?? ''}
            onChange={(e) => set('broker', e.target.value)}
          />

          {/* Holdings */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Units / Shares held"
              type="number"
              min="0"
              step="0.0001"
              placeholder="0.0000"
              value={form.units ?? ''}
              onChange={(e) => set('units', e.target.value)}
              required
            />
            <Input
              label="Current NAV per unit"
              type="number"
              min="0"
              step="0.0001"
              placeholder="0.00"
              value={form.navPerUnit ?? ''}
              onChange={(e) => set('navPerUnit', e.target.value)}
              required
            />
          </div>

          <Select
            label="Currency"
            value={form.currency ?? 'SEK'}
            options={CURRENCIES}
            onChange={(e) => set('currency', e.target.value)}
          />

          {/* Zakat method */}
          <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4 space-y-3">
            <Select
              label="Zakat Calculation Method"
              value={form.zakatMethod ?? 'full_nav'}
              options={ZAKAT_METHODS}
              onChange={(e) => set('zakatMethod', e.target.value)}
            />

            {form.zakatMethod === 'equity_ratio' ? (
              <div className="space-y-2">
                <Input
                  label="Zakatable % of fund holdings"
                  hint="The % of the fund's assets that are zakatable (cash, receivables, inventory). Ask your fund manager or use the published fund factsheet."
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="e.g. 65"
                  value={form.zakatablePercent ?? ''}
                  onChange={(e) => set('zakatablePercent', e.target.value)}
                  suffix="%"
                />
                <div className="flex items-start gap-2 text-xs text-emerald-700">
                  <Info size={13} className="mt-0.5 shrink-0" />
                  <span>
                    For equity funds, many scholars suggest only the zakatable portion of the 
                    underlying assets (cash + receivables + inventory ÷ total assets × NAV). 
                    If unsure, use "Full NAV" for a safe, conservative estimate.
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs text-emerald-700">
                <Info size={13} className="mt-0.5 shrink-0" />
                <span>
                  The entire current market value (units × NAV) is treated as zakatable. 
                  This is the simpler, conservative approach recommended for most investors.
                </span>
              </div>
            )}
          </div>

          {/* Summary preview */}
          {totalNAV > 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total fund value</span>
                <span className="font-medium">{form.currency} {totalNAV.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              {form.zakatMethod === 'equity_ratio' && (
                <div className="flex justify-between text-gray-600">
                  <span>Zakatable portion ({form.zakatablePercent ?? 100}%)</span>
                  <span className="font-medium">{form.currency} {zakatableNAV.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-emerald-700 pt-1 border-t border-gray-200">
                <span>Estimated zakat (2.5%)</span>
                <span>{form.currency} {estimatedZakat.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          {/* Pakistan: zakat deducted at source */}
          <div className={`border rounded-xl p-4 space-y-3 ${
            form.country === 'pakistan' ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'
          }`}>
            <Toggle
              checked={form.zakatDeductedAtSource ?? false}
              onChange={(v) => set('zakatDeductedAtSource', v)}
              label="Zakat already deducted at source"
              description={
                form.country === 'pakistan'
                  ? 'Some Pakistani fund houses (e.g. Meezan, NBP, MCB) deduct zakat automatically at the start of Ramadan on their Islamic funds.'
                  : 'Enable if the fund manager has already withheld zakat on your behalf.'
              }
            />
            {form.zakatDeductedAtSource && (
              <Input
                label={`Zakat deducted amount (${form.currency ?? 'SEK'})`}
                hint="Leave blank to auto-calculate as 2.5% of zakatable value"
                type="number"
                min="0"
                step="0.01"
                placeholder={estimatedZakat > 0 ? `Auto: ${estimatedZakat.toFixed(2)}` : '0.00'}
                value={form.zakatAmountDeducted ?? ''}
                onChange={(e) => set('zakatAmountDeducted', e.target.value || undefined)}
                suffix={form.currency ?? 'SEK'}
              />
            )}
          </div>

          <Input
            label="Notes (optional)"
            placeholder="e.g. ISIN, account number, ISK..."
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {existing ? 'Save Changes' : 'Add Fund'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
