import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CashAccount, Currency } from '../../types';
import { Input, Select, Button } from '../ui';
import { generateId } from '../../utils/format';

const CURRENCIES: Array<{ value: string; label: string }> = [
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
  existing?: CashAccount;
  onSave: (asset: CashAccount) => void;
  onClose: () => void;
}

export function CashAccountForm({ existing, onSave, onClose }: Props) {
  const [form, setForm] = useState<Partial<CashAccount>>(
    existing ?? { type: 'cash', currency: 'SEK', country: 'sweden', amount: 0 }
  );

  const set = (k: keyof CashAccount, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.amount) return;
    onSave({
      id: form.id ?? generateId(),
      type: 'cash',
      name: form.name!.trim(),
      amount: Number(form.amount),
      currency: (form.currency as Currency) ?? 'SEK',
      country: (form.country as CashAccount['country']) ?? 'sweden',
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {existing ? 'Edit' : 'Add'} Cash / Bank Account
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Account / Description"
            placeholder="e.g. Swedbank Savings, MCB Account"
            value={form.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Balance"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.amount ?? ''}
              onChange={(e) => set('amount', e.target.value)}
              required
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
              {existing ? 'Save Changes' : 'Add Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
