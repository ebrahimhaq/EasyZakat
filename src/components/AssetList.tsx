import { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Asset, AssetCalculation } from '../types';
import { Badge, ConfirmDialog } from './ui';
import { formatCurrency } from '../utils/format';
import { useApp } from '../context/AppContext';

interface AssetRowProps {
  calc: AssetCalculation;
  onEdit: () => void;
  onDelete: () => void;
}

function AssetRow({ calc, onEdit, onDelete }: AssetRowProps) {
  const { asset, zakatableValueSEK, zakatDueSEK, zakatAlreadyPaidSEK, isExcluded, exclusionReason } = calc;
  const { state } = useApp();
  const { displayCurrency, exchangeRates } = state.data.settings;

  const [showDelete, setShowDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const netZakat = Math.max(0, zakatDueSEK - zakatAlreadyPaidSEK);
  const sekRate = exchangeRates[displayCurrency];

  const displayValue = zakatableValueSEK / (sekRate || 1);
  const displayZakat = netZakat / (sekRate || 1);

  const getSubtitle = () => {
    switch (asset.type) {
      case 'cash':
        return `${asset.currency} · ${asset.country}`;
      case 'sweden_stock':
        return `${asset.shares.toLocaleString()} shares · ${asset.broker} · SEK ${asset.currentPricePerShare.toFixed(2)}/share`;
      case 'pakistan_stock': {
        const tag = asset.zakatDeductedAtSource ? '✓ CDC Zakat deducted' : 'Zakat not deducted at source';
        return `${asset.shares.toLocaleString()} shares · PKR ${asset.currentPricePerShare.toFixed(2)}/share · ${tag}`;
      }
      case 'gold':
        return `${asset.weightGrams}g · ${asset.purity} · ${asset.currency}`;
      case 'silver':
        return `${asset.weightGrams}g · ${asset.currency}`;
      case 'business':
        return `${asset.currency} · ${asset.country}`;
      case 'receivable':
        return asset.likelyToBeReceived ? 'Will be received' : 'Unlikely to receive';
      case 'liability':
        return `${asset.currency} · ${asset.country}`;
      case 'fund': {
        const methodLabel = asset.zakatMethod === 'equity_ratio'
          ? `Zakatable ${asset.zakatablePercent ?? 100}%`
          : 'Full NAV';
        const paidLabel = asset.zakatDeductedAtSource ? ' · ✓ Zakat deducted' : '';
        return `${asset.units.toLocaleString()} units · ${asset.currency} ${asset.navPerUnit.toFixed(2)}/unit · ${methodLabel}${paidLabel}`;
      }
    }
  };

  return (
    <>
      <div
        className={`border rounded-xl overflow-hidden transition-all ${
          isExcluded ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-800 truncate">{asset.name}</span>
              {isExcluded && <Badge color="gray">Excluded</Badge>}
              {asset.type === 'pakistan_stock' && asset.zakatDeductedAtSource && (
                <Badge color="green">Zakat Paid</Badge>
              )}
              {asset.type === 'fund' && asset.zakatDeductedAtSource && (
                <Badge color="green">Zakat Paid</Badge>
              )}
              {asset.type === 'liability' && <Badge color="red">Liability</Badge>}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{getSubtitle()}</p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(displayValue, displayCurrency)}
            </p>
            {!isExcluded && asset.type !== 'liability' && (
              <p className="text-xs text-emerald-600 font-medium">
                Zakat: {formatCurrency(displayZakat, displayCurrency)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              title="Details"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="px-4 pb-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 pt-2 space-y-1">
            {!isExcluded && (
              <>
                <div className="flex justify-between">
                  <span>Zakatable value ({displayCurrency})</span>
                  <span className="font-medium">{formatCurrency(displayValue, displayCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Zakat due (2.5%)</span>
                  <span className="font-medium">{formatCurrency(zakatDueSEK / (sekRate || 1), displayCurrency)}</span>
                </div>
                {zakatAlreadyPaidSEK > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Already paid / deducted</span>
                    <span className="font-medium">- {formatCurrency(zakatAlreadyPaidSEK / (sekRate || 1), displayCurrency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-emerald-700 pt-1 border-t border-gray-200">
                  <span>Net zakat owed</span>
                  <span>{formatCurrency(displayZakat, displayCurrency)}</span>
                </div>
              </>
            )}
            {isExcluded && exclusionReason && (
              <p className="italic">{exclusionReason}</p>
            )}
            {asset.notes && <p className="italic">Note: {asset.notes}</p>}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Asset"
        message={`Are you sure you want to delete "${asset.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          onDelete();
          setShowDelete(false);
        }}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}

interface AssetListProps {
  assetType: Asset['type'];
  onEdit: (asset: Asset) => void;
  /** Optional filter applied on top of assetType — useful for splitting one category into sub-groups */
  filterFn?: (asset: Asset) => boolean;
}

export function AssetList({ assetType, onEdit, filterFn }: AssetListProps) {
  const { state, dispatch } = useApp();
  let items = state.result?.categories.find((c) => c.category === assetType)?.items ?? [];

  if (filterFn) {
    items = items.filter((calc) => filterFn(calc.asset));
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((calc) => (
        <AssetRow
          key={calc.asset.id}
          calc={calc}
          onEdit={() => onEdit(calc.asset)}
          onDelete={() =>
            dispatch({ type: 'DELETE_ASSET', payload: calc.asset.id })
          }
        />
      ))}
    </div>
  );
}
