import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Receivable, Liability, Currency } from '../../types';
import { Input, Select, Button, Toggle } from '../ui';
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

// ─── Receivable ───────────────────────────────────────────────────────────────
interface ReceivableProps {
  existing?: Receivable;
  onSave: (asset: Receivable) => void;
  onClose: () => void;
}

export function ReceivableForm({ existing, onSave, onClose }: ReceivableProps) {
  const [form, setForm] = useState<Partial<Receivable>>(
    existing ?? {
      type: 'receivable',
      currency: 'SEK',
      country: 'sweden',
      amount: 0,
      likelyToBeReceived: true,
    }
  );

  const set = (k: keyof Receivable, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.amount) return;
    onSave({
      id: form.id ?? generateId(),
      type: 'receivable',
      name: form.name!.trim(),
      amount: Number(form.amount),
      currency: (form.currency as Currency) ?? 'SEK',
      country: (form.country as Receivable['country']) ?? 'sweden',
      likelyToBeReceived: form.likelyToBeReceived ?? true,
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {existing ? 'Edit' : 'Add'} Receivable
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Description"
            placeholder="e.g. Loan given to friend, salary due"
            value={form.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount"
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
          <Toggle
            checked={form.likelyToBeReceived ?? true}
            onChange={(v) => set('likelyToBeReceived', v)}
            label="Likely to be received"
            description="If unlikely (e.g. bad debt), it won't be counted in your zakatable wealth."
          />
          <Input
            label="Notes (optional)"
            placeholder="Any notes..."
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">
              {existing ? 'Save Changes' : 'Add Receivable'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Liability ────────────────────────────────────────────────────────────────
interface LiabilityProps {
  existing?: Liability;
  onSave: (asset: Liability) => void;
  onClose: () => void;
}

export function LiabilityForm({ existing, onSave, onClose }: LiabilityProps) {
  const [form, setForm] = useState<Partial<Liability>>(
    existing ?? {
      type: 'liability',
      currency: 'SEK',
      country: 'sweden',
      amount: 0,
    }
  );

  const set = (k: keyof Liability, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.amount) return;
    onSave({
      id: form.id ?? generateId(),
      type: 'liability',
      name: form.name!.trim(),
      amount: Number(form.amount),
      currency: (form.currency as Currency) ?? 'SEK',
      country: (form.country as Liability['country']) ?? 'sweden',
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {existing ? 'Edit' : 'Add'} Liability / Debt
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Description"
            placeholder="e.g. Car loan, credit card debt, borrowed money"
            value={form.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount Owed"
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
          <div className="bg-orange-50 rounded-xl p-3 text-xs text-orange-700">
            <strong>Note:</strong> Only short-term debts (due immediately) are typically deducted from zakatable wealth.
            Long-term debts like mortgages are only partially deductible per most scholars.
          </div>
          <Input
            label="Notes (optional)"
            placeholder="e.g. Monthly instalment, due date..."
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">
              {existing ? 'Save Changes' : 'Add Liability'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
