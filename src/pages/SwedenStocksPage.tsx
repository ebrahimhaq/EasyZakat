import { useState } from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import { SectionHeader, Card, Button, EmptyState } from '../components/ui';
import { AssetList } from '../components/AssetList';
import { SwedenStockForm } from '../components/forms/SwedenStockForm';
import { useApp } from '../context/AppContext';
import type { SwedenStock } from '../types';

export function SwedenStocksPage() {
  const { dispatch, state } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SwedenStock | undefined>();

  const count = state.data.assets.filter((a) => a.type === 'sweden_stock').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Sweden Stocks"
        subtitle="Avanza, Nordnet, ISK, KF or any Swedish brokerage account"
        icon={<TrendingUp size={20} />}
        action={
          <Button icon={<Plus size={15} />} onClick={() => { setEditing(undefined); setShowForm(true); }}>
            Add Stock
          </Button>
        }
      />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Zakat on Stocks:</strong> Scholars generally agree that for actively traded stocks, 
        the full market value is zakatable. For long-term investment stocks, some scholars only apply 
        zakat to the company's zakatable assets (cash + inventory / shares). The full market value 
        method is used here for simplicity and ease.
      </div>

      <Card>
        {count === 0 ? (
          <EmptyState
            icon={<TrendingUp size={24} />}
            title="No Swedish stocks added"
            description="Add your Swedish stock holdings from Avanza, Nordnet, or any other broker. Use the current market price."
            action={
              <Button icon={<Plus size={15} />} onClick={() => { setEditing(undefined); setShowForm(true); }}>
                Add First Stock
              </Button>
            }
          />
        ) : (
          <AssetList
            assetType="sweden_stock"
            onEdit={(a) => { setEditing(a as SwedenStock); setShowForm(true); }}
          />
        )}
      </Card>

      {showForm && (
        <SwedenStockForm
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
