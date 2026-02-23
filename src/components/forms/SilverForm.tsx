import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { SilverAsset, Currency } from '../../types';
import { Input, Select, Button } from '../ui';
import { generateId } from '../../utils/format';

const CURRENCIES = [
  { value: 'SEK', label: 'SEK – Swedish Krona' },
  { value: 'PKR', label: 'PKR – Pakistani Rupee' },
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'GBP', label: 'GBP – British Pound' },
];

const COUNTRIES = [
  { value: 'sweden', label: 'Sweden' },
  { value: 'pakistan', label: 'Pakistan' },
  { value: 'other', label: 'Other' },
];

interface Props {
  existing?: SilverAsset;
  onSave: (asset: SilverAsset) => void;
  onClose: () => void;
}

export function SilverForm({ existing, onSave, onClose }: Props) {
  const [form, setForm] = useState<Partial<SilverAsset>>(
    existing ?? {
      type: 'silver',
      currency: 'SEK',
      country: 'sweden',
      weightGrams: 0,
      pricePerGram: 0,
    }
  );

  const set = (k: keyof SilverAsset, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const totalValue = (Number(form.weightGrams) || 0) * (Number(form.pricePerGram) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.weightGrams || !form.pricePerGram) return;
    onSave({
      id: form.id ?? generateId(),
      type: 'silver',
      name: form.name!.trim(),
      weightGrams: Number(form.weightGrams),
      currency: (form.currency as Currency) ?? 'SEK',
      country: (form.country as SilverAsset['country']) ?? 'sweden',
      pricePerGram: Number(form.pricePerGram),
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {existing ? 'Edit' : 'Add'} Silver
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Description"
            placeholder="e.g. Silver coins, Silver jewellery"
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
            <Input
              label="Price per gram"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.pricePerGram ?? ''}
              onChange={(e) => set('pricePerGram', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Currency"
              value={form.currency ?? 'SEK'}
              options={CURRENCIES}
              onChange={(e) => set('currency', e.target.value)}
            />
            <Select
              label="Country"
              value={form.country ?? 'sweden'}
              options={COUNTRIES}
              onChange={(e) => set('country', e.target.value)}
            />
          </div>

          {totalValue > 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Total Value</span>
              <span className="text-sm font-bold text-gray-800">
                {form.currency} {totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
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
              {existing ? 'Save Changes' : 'Add Silver'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
