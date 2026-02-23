import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import type { PakistanStock } from '../../types';
import { Input, Button, Toggle } from '../ui';
import { generateId } from '../../utils/format';

interface Props {
  existing?: PakistanStock;
  onSave: (asset: PakistanStock) => void;
  onClose: () => void;
}

export function PakistanStockForm({ existing, onSave, onClose }: Props) {
  const [form, setForm] = useState<Partial<PakistanStock>>(
    existing ?? {
      type: 'pakistan_stock',
      shares: 0,
      currentPricePerShare: 0,
      zakatDeductedAtSource: false,
    }
  );

  const set = (k: keyof PakistanStock, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const totalValuePKR = (Number(form.shares) || 0) * (Number(form.currentPricePerShare) || 0);
  const automaticZakatPKR = totalValuePKR * 0.025;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.shares || !form.currentPricePerShare) return;
    const deducted = form.zakatDeductedAtSource ?? false;
    onSave({
      id: form.id ?? generateId(),
      type: 'pakistan_stock',
      name: form.name!.trim(),
      ticker: form.ticker ?? '',
      shares: Number(form.shares),
      currentPricePerShare: Number(form.currentPricePerShare),
      zakatDeductedAtSource: deducted,
      zakatAmountDeducted: deducted
        ? (form.zakatAmountDeducted ? Number(form.zakatAmountDeducted) : automaticZakatPKR)
        : 0,
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900">
            {existing ? 'Edit' : 'Add'} Pakistan Stock (PSX)
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label="Company Name"
            placeholder="e.g. ENGRO, HBL, OGDC"
            value={form.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
            required
          />
          <Input
            label="PSX Ticker (optional)"
            placeholder="e.g. ENGRO, MCB"
            value={form.ticker ?? ''}
            onChange={(e) => set('ticker', e.target.value)}
          />
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
              label="Current Price (PKR)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.currentPricePerShare ?? ''}
              onChange={(e) => set('currentPricePerShare', e.target.value)}
              suffix="PKR"
              required
            />
          </div>

          {totalValuePKR > 0 && (
            <div className="bg-emerald-50 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-emerald-700 font-medium">Total Value</span>
              <span className="text-sm font-bold text-emerald-800">
                PKR {totalValuePKR.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
              </span>
            </div>
          )}

          {/* Zakat deducted at source (CDC) */}
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
            <Toggle
              checked={form.zakatDeductedAtSource ?? false}
              onChange={(v) => set('zakatDeductedAtSource', v)}
              label="Zakat already deducted at source (CDC)"
              description="The Central Depository Company (CDC) automatically deducts 2.5% zakat from dividends and holdings for eligible Muslim account holders."
            />

            {form.zakatDeductedAtSource && (
              <div className="pt-2 space-y-3">
                <div className="flex items-start gap-2 text-xs text-amber-700">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <span>
                    If you have the exact CDC zakat deduction amount from your statement, enter it below. 
                    Otherwise, we'll estimate 2.5% of current holdings value.
                  </span>
                </div>
                <Input
                  label="Zakat Deducted Amount (PKR)"
                  hint="Leave blank to auto-calculate as 2.5% of current value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={automaticZakatPKR > 0 ? `Auto: ${automaticZakatPKR.toFixed(0)}` : '0.00'}
                  value={form.zakatAmountDeducted ?? ''}
                  onChange={(e) => set('zakatAmountDeducted', e.target.value || undefined)}
                  suffix="PKR"
                />
              </div>
            )}
          </div>

          <Input
            label="Notes (optional)"
            placeholder="e.g. CDC account, broker name..."
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
