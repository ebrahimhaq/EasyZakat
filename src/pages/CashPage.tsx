import { useState } from 'react';
import { Landmark, Plus } from 'lucide-react';
import { SectionHeader, Card, Button, EmptyState } from '../components/ui';
import { AssetList } from '../components/AssetList';
import { CashAccountForm } from '../components/forms/CashAccountForm';
import { useApp } from '../context/AppContext';
import type { CashAccount } from '../types';

export function CashPage() {
  const { dispatch, state } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CashAccount | undefined>();

  const count = state.data.assets.filter((a) => a.type === 'cash').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Cash & Bank Accounts"
        subtitle="Include all savings, current, and foreign currency accounts"
        icon={<Landmark size={20} />}
        action={
          <Button
            icon={<Plus size={15} />}
            onClick={() => { setEditing(undefined); setShowForm(true); }}
          >
            Add Account
          </Button>
        }
      />

      <Card>
        {count === 0 ? (
          <EmptyState
            icon={<Landmark size={24} />}
            title="No accounts added yet"
            description="Add all your bank accounts, savings accounts, and cash on hand in any currency."
            action={
              <Button icon={<Plus size={15} />} onClick={() => { setEditing(undefined); setShowForm(true); }}>
                Add First Account
              </Button>
            }
          />
        ) : (
          <AssetList
            assetType="cash"
            onEdit={(a) => { setEditing(a as CashAccount); setShowForm(true); }}
          />
        )}
      </Card>

      {showForm && (
        <CashAccountForm
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
