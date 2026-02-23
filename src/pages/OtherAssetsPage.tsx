import { useState } from 'react';
import { ShoppingBag, Plus, ArrowDownCircle } from 'lucide-react';
import { SectionHeader, Card, Button, EmptyState } from '../components/ui';
import { AssetList } from '../components/AssetList';
import { BusinessForm } from '../components/forms/BusinessForm';
import { ReceivableForm, LiabilityForm } from '../components/forms/OtherForms';
import { useApp } from '../context/AppContext';
import type { BusinessAsset, Receivable, Liability } from '../types';

export function OtherAssetsPage() {
  const { dispatch, state } = useApp();

  const [showBizForm, setShowBizForm] = useState(false);
  const [showRecvForm, setShowRecvForm] = useState(false);
  const [showLiabForm, setShowLiabForm] = useState(false);

  const [editingBiz, setEditingBiz] = useState<BusinessAsset | undefined>();
  const [editingRecv, setEditingRecv] = useState<Receivable | undefined>();
  const [editingLiab, setEditingLiab] = useState<Liability | undefined>();

  const bizCount = state.data.assets.filter((a) => a.type === 'business').length;
  const recvCount = state.data.assets.filter((a) => a.type === 'receivable').length;
  const liabCount = state.data.assets.filter((a) => a.type === 'liability').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Other Assets & Liabilities"
        subtitle="Business inventory, receivables, and debts"
        icon={<ShoppingBag size={20} />}
      />

      {/* Business Assets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800">📦 Business / Trade Assets</h3>
          <Button size="sm" variant="secondary" icon={<Plus size={13} />}
            onClick={() => { setEditingBiz(undefined); setShowBizForm(true); }}>
            Add
          </Button>
        </div>
        <Card>
          {bizCount === 0 ? (
            <EmptyState
              icon={<ShoppingBag size={22} />}
              title="No business assets"
              description="Trade inventory, merchandise, and cash in business are zakatable."
              action={
                <Button size="sm" icon={<Plus size={13} />}
                  onClick={() => { setEditingBiz(undefined); setShowBizForm(true); }}>
                  Add Business Asset
                </Button>
              }
            />
          ) : (
            <AssetList assetType="business"
              onEdit={(a) => { setEditingBiz(a as BusinessAsset); setShowBizForm(true); }} />
          )}
        </Card>
      </div>

      {/* Receivables */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800">💸 Receivables (Money Owed to You)</h3>
          <Button size="sm" variant="secondary" icon={<Plus size={13} />}
            onClick={() => { setEditingRecv(undefined); setShowRecvForm(true); }}>
            Add
          </Button>
        </div>
        <Card>
          {recvCount === 0 ? (
            <EmptyState
              icon={<ArrowDownCircle size={22} />}
              title="No receivables"
              description="Money lent to others, unpaid salary, or any amounts expected to be received."
              action={
                <Button size="sm" icon={<Plus size={13} />}
                  onClick={() => { setEditingRecv(undefined); setShowRecvForm(true); }}>
                  Add Receivable
                </Button>
              }
            />
          ) : (
            <AssetList assetType="receivable"
              onEdit={(a) => { setEditingRecv(a as Receivable); setShowRecvForm(true); }} />
          )}
        </Card>
      </div>

      {/* Liabilities */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800">📉 Liabilities & Debts</h3>
          <Button size="sm" variant="secondary" icon={<Plus size={13} />}
            onClick={() => { setEditingLiab(undefined); setShowLiabForm(true); }}>
            Add
          </Button>
        </div>
        <Card>
          {liabCount === 0 ? (
            <EmptyState
              icon={<ArrowDownCircle size={22} />}
              title="No liabilities"
              description="Debts and liabilities reduce your zakatable wealth."
              action={
                <Button size="sm" icon={<Plus size={13} />}
                  onClick={() => { setEditingLiab(undefined); setShowLiabForm(true); }}>
                  Add Liability
                </Button>
              }
            />
          ) : (
            <AssetList assetType="liability"
              onEdit={(a) => { setEditingLiab(a as Liability); setShowLiabForm(true); }} />
          )}
        </Card>
      </div>

      {showBizForm && (
        <BusinessForm existing={editingBiz}
          onSave={(asset) => {
            dispatch(editingBiz ? { type: 'UPDATE_ASSET', payload: asset } : { type: 'ADD_ASSET', payload: asset });
            setShowBizForm(false);
          }}
          onClose={() => setShowBizForm(false)} />
      )}

      {showRecvForm && (
        <ReceivableForm existing={editingRecv}
          onSave={(asset) => {
            dispatch(editingRecv ? { type: 'UPDATE_ASSET', payload: asset } : { type: 'ADD_ASSET', payload: asset });
            setShowRecvForm(false);
          }}
          onClose={() => setShowRecvForm(false)} />
      )}

      {showLiabForm && (
        <LiabilityForm existing={editingLiab}
          onSave={(asset) => {
            dispatch(editingLiab ? { type: 'UPDATE_ASSET', payload: asset } : { type: 'ADD_ASSET', payload: asset });
            setShowLiabForm(false);
          }}
          onClose={() => setShowLiabForm(false)} />
      )}
    </div>
  );
}
