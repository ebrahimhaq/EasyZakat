import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { GoldAsset, GoldPurity, Currency } from '../../types';
import { Input, Select, Button } from '../ui';
import { generateId } from '../../utils/format';
import { GOLD_PURITY } from '../../services/calculator';

const CURRENCIES = [
  { value: 'SEK', label: 'SEK – Swedish Krona' },
  { value: 'PKR', label: 'PKR – Pakistani Rupee' },
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'GBP', label: 'GBP – British Pound' },
];

const PURITIES: Array<{ value: GoldPurity; label: string }> = [
  { value: '24k', label: '24K – Pure Gold (99.9%)' },
  { value: '22k', label: '22K (91.7%)' },
  { value: '21k', label: '21K (87.5%)' },
  { value: '18k', label: '18K (75%)' },
];

const COUNTRIES = [
  { value: 'sweden', label: 'Sweden' },
  { value: 'pakistan', label: 'Pakistan' },
  { value: 'other', label: 'Other' },
];

interface Props {
  existing?: GoldAsset;
  onSave: (asset: GoldAsset) => void;
  onClose: () => void;
}

export function GoldForm({ existing, onSave, onClose }: Props) {
  const [form, setForm] = useState<Partial<GoldAsset>>(
    existing ?? {
      type: 'gold',
      purity: '22k',
      currency: 'SEK',
      country: 'sweden',
      weightGrams: 0,
      pricePerGram: 0,
    }
  );

  const set = (k: keyof GoldAsset, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const purityMultiplier = GOLD_PURITY[form.purity ?? '22k'] ?? 1;
  const pure24kGrams = (Number(form.weightGrams) || 0) * purityMultiplier;
  const totalValue = pure24kGrams * (Number(form.pricePerGram) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.weightGrams || !form.pricePerGram) return;
    onSave({
      id: form.id ?? generateId(),
      type: 'gold',
      name: form.name!.trim(),
      weightGrams: Number(form.weightGrams),
      purity: (form.purity as GoldPurity) ?? '22k',
      currency: (form.currency as Currency) ?? 'SEK',
      country: (form.country as GoldAsset['country']) ?? 'sweden',
      pricePerGram: Number(form.pricePerGram),
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {existing ? 'Edit' : 'Add'} Gold
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Description"
            placeholder="e.g. Gold jewellery, Gold coins, Gold bars"
            value={form.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Weight (grams)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.weightGrams ?? ''}
              onChange={(e) => set('weightGrams', e.target.value)}
              suffix="g"
              required
            />
            <Select
              label="Purity"
              value={form.purity ?? '22k'}
              options={PURITIES}
              onChange={(e) => set('purity', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price per gram (24K)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.pricePerGram ?? ''}
              onChange={(e) => set('pricePerGram', e.target.value)}
              required
              hint="Use 24K price; we calculate purity automatically"
            />
            <Select
              label="Currency"
              value={form.currency ?? 'SEK'}
              options={CURRENCIES}
              onChange={(e) => set('currency', e.target.value)}
            />
          </div>
          <Select
            label="Country"
            value={form.country ?? 'sweden'}
            options={COUNTRIES}
            onChange={(e) => set('country', e.target.value)}
          />

          {totalValue > 0 && (
            <div className="bg-amber-50 rounded-xl px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-xs text-amber-700">
                <span>Pure 24K equivalent</span>
                <span>{pure24kGrams.toFixed(2)}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-amber-700 font-medium">Total Value</span>
                <span className="text-sm font-bold text-amber-800">
                  {form.currency} {totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          )}

          <Input
            label="Notes (optional)"
            placeholder="Any notes..."
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {existing ? 'Save Changes' : 'Add Gold'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
