import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { SwedenStock } from '../../types';
import { Input, Select, Button } from '../ui';
import { generateId } from '../../utils/format';

const BROKERS = [
  { value: 'Avanza', label: 'Avanza' },
  { value: 'Nordnet', label: 'Nordnet' },
  { value: 'Swedbank', label: 'Swedbank' },
  { value: 'SEB', label: 'SEB' },
  { value: 'Handelsbanken', label: 'Handelsbanken' },
  { value: 'Other', label: 'Other' },
];

interface Props {
  existing?: SwedenStock;
  onSave: (asset: SwedenStock) => void;
  onClose: () => void;
}

export function SwedenStockForm({ existing, onSave, onClose }: Props) {
  const [form, setForm] = useState<Partial<SwedenStock>>(
    existing ?? { type: 'sweden_stock', broker: 'Avanza', shares: 0, currentPricePerShare: 0 }
  );

  const set = (k: keyof SwedenStock, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const totalValue = (Number(form.shares) || 0) * (Number(form.currentPricePerShare) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.shares || !form.currentPricePerShare) return;
    onSave({
      id: form.id ?? generateId(),
      type: 'sweden_stock',
      name: form.name!.trim(),
      ticker: form.ticker ?? '',
      shares: Number(form.shares),
      currentPricePerShare: Number(form.currentPricePerShare),
      broker: form.broker ?? 'Avanza',
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {existing ? 'Edit' : 'Add'} Sweden Stock
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Company Name"
            placeholder="e.g. Ericsson, Volvo, H&M"
            value={form.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ticker (optional)"
              placeholder="e.g. ERIC B"
              value={form.ticker ?? ''}
              onChange={(e) => set('ticker', e.target.value)}
            />
            <Select
              label="Broker"
              value={form.broker ?? 'Avanza'}
              options={BROKERS}
              onChange={(e) => set('broker', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Number of Shares"
              type="number"
              min="0"
              step="0.001"
              placeholder="0"
              value={form.shares ?? ''}
              onChange={(e) => set('shares', e.target.value)}
              required
            />
            <Input
              label="Current Price (SEK)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.currentPricePerShare ?? ''}
              onChange={(e) => set('currentPricePerShare', e.target.value)}
              suffix="SEK"
              required
            />
          </div>
          {totalValue > 0 && (
            <div className="bg-emerald-50 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-emerald-700 font-medium">Total Value</span>
              <span className="text-sm font-bold text-emerald-800">
                {totalValue.toLocaleString('sv-SE', { minimumFractionDigits: 0 })} SEK
              </span>
            </div>
          )}
          <Input
            label="Notes (optional)"
            placeholder="e.g. ISK account, KF..."
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {existing ? 'Save Changes' : 'Add Stock'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
