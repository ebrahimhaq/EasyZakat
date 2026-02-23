import { useState } from 'react';
import { Gem, Plus } from 'lucide-react';
import { SectionHeader, Card, Button, EmptyState } from '../components/ui';
import { AssetList } from '../components/AssetList';
import { GoldForm } from '../components/forms/GoldForm';
import { SilverForm } from '../components/forms/SilverForm';
import { useApp } from '../context/AppContext';
import type { GoldAsset, SilverAsset } from '../types';

export function PreciousMetalsPage() {
  const { dispatch, state } = useApp();
  const [showGoldForm, setShowGoldForm] = useState(false);
  const [showSilverForm, setShowSilverForm] = useState(false);
  const [editingGold, setEditingGold] = useState<GoldAsset | undefined>();
  const [editingSilver, setEditingSilver] = useState<SilverAsset | undefined>();

  const goldCount = state.data.assets.filter((a) => a.type === 'gold').length;
  const silverCount = state.data.assets.filter((a) => a.type === 'silver').length;

  const nisabMethod = state.data.settings.nisab.method;
  const goldPricePerGram = state.data.settings.nisab.goldPricePerGramSEK;
  const silverPricePerGram = state.data.settings.nisab.silverPricePerGramSEK;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gold & Silver"
        subtitle="Jewellery, coins, bars — all gold and silver holdings"
        icon={<Gem size={20} />}
      />

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-2">
        <p>
          <strong>Nisab is based on precious metals:</strong> The minimum threshold for zakat is either
          85g of gold or 595g of silver. Gold and silver themselves are fully zakatable at 2.5%.
        </p>
        <p>
          Current nisab basis: <strong>{nisabMethod === 'gold' ? '85g Gold' : '595g Silver'}</strong>.
          Update gold/silver prices in <strong>Settings</strong> for accurate nisab.
        </p>
        <div className="flex gap-4 text-xs mt-1">
          <span>Gold: SEK {goldPricePerGram}/g</span>
          <span>Silver: SEK {silverPricePerGram}/g</span>
        </div>
      </div>

      {/* Gold Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>🥇</span> Gold
          </h3>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={13} />}
            onClick={() => { setEditingGold(undefined); setShowGoldForm(true); }}
          >
            Add Gold
          </Button>
        </div>
        <Card>
          {goldCount === 0 ? (
            <EmptyState
              icon={<Gem size={24} />}
              title="No gold added"
              description="Add jewellery, coins, or gold bars. We support 24K, 22K, 21K, and 18K."
              action={
                <Button size="sm" icon={<Plus size={13} />} onClick={() => { setEditingGold(undefined); setShowGoldForm(true); }}>
                  Add Gold
                </Button>
              }
            />
          ) : (
            <AssetList
              assetType="gold"
              onEdit={(a) => { setEditingGold(a as GoldAsset); setShowGoldForm(true); }}
            />
          )}
        </Card>
      </div>

      {/* Silver Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span>🥈</span> Silver
          </h3>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={13} />}
            onClick={() => { setEditingSilver(undefined); setShowSilverForm(true); }}
          >
            Add Silver
          </Button>
        </div>
        <Card>
          {silverCount === 0 ? (
            <EmptyState
              icon={<Gem size={24} />}
              title="No silver added"
              description="Add silver jewellery, coins, or bars."
              action={
                <Button size="sm" icon={<Plus size={13} />} onClick={() => { setEditingSilver(undefined); setShowSilverForm(true); }}>
                  Add Silver
                </Button>
              }
            />
          ) : (
            <AssetList
              assetType="silver"
              onEdit={(a) => { setEditingSilver(a as SilverAsset); setShowSilverForm(true); }}
            />
          )}
        </Card>
      </div>

      {showGoldForm && (
        <GoldForm
          existing={editingGold}
          onSave={(asset) => {
            dispatch(editingGold ? { type: 'UPDATE_ASSET', payload: asset } : { type: 'ADD_ASSET', payload: asset });
            setShowGoldForm(false);
          }}
          onClose={() => setShowGoldForm(false)}
        />
      )}

      {showSilverForm && (
        <SilverForm
          existing={editingSilver}
          onSave={(asset) => {
            dispatch(editingSilver ? { type: 'UPDATE_ASSET', payload: asset } : { type: 'ADD_ASSET', payload: asset });
            setShowSilverForm(false);
          }}
          onClose={() => setShowSilverForm(false)}
        />
      )}
    </div>
  );
}
