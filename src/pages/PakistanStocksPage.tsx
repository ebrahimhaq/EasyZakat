import { useState } from 'react';
import { BarChart2, Plus } from 'lucide-react';
import { SectionHeader, Card, Button, EmptyState } from '../components/ui';
import { AssetList } from '../components/AssetList';
import { PakistanStockForm } from '../components/forms/PakistanStockForm';
import { useApp } from '../context/AppContext';
import type { PakistanStock } from '../types';

export function PakistanStocksPage() {
  const { dispatch, state } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PakistanStock | undefined>();

  const count = state.data.assets.filter((a) => a.type === 'pakistan_stock').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pakistan Stocks (PSX)"
        subtitle="Pakistan Stock Exchange holdings via CDC account"
        icon={<BarChart2 size={20} />}
        action={
          <Button icon={<Plus size={15} />} onClick={() => { setEditing(undefined); setShowForm(true); }}>
            Add Stock
          </Button>
        }
      />

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 space-y-2">
        <p>
          <strong>CDC Zakat Deduction:</strong> In Pakistan, Zakat is automatically deducted at 2.5% 
          from your CDC (Central Depository Company) holdings on the first day of Ramadan for eligible 
          Muslim account holders (unless you have submitted a CZ-50 exemption form).
        </p>
        <p>
          Enable the "Zakat deducted at source" toggle for stocks where CDC has already deducted zakat, 
          so it is counted as paid and not charged again.
        </p>
      </div>

      <Card>
        {count === 0 ? (
          <EmptyState
            icon={<BarChart2 size={24} />}
            title="No PSX stocks added"
            description="Add your Pakistan Stock Exchange holdings. You can mark whether CDC has already deducted zakat."
            action={
              <Button icon={<Plus size={15} />} onClick={() => { setEditing(undefined); setShowForm(true); }}>
                Add First PSX Stock
              </Button>
            }
          />
        ) : (
          <AssetList
            assetType="pakistan_stock"
            onEdit={(a) => { setEditing(a as PakistanStock); setShowForm(true); }}
          />
        )}
      </Card>

      {showForm && (
        <PakistanStockForm
          existing={editing}
          onSave={(asset) => {
            dispatch(editing ? { type: 'UPDATE_ASSET', payload: asset } : { type: 'ADD_ASSET', payload: asset });
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
