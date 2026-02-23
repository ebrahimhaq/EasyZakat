import { useState } from 'react';
import { PieChart, Plus } from 'lucide-react';
import { SectionHeader, Card, Button, EmptyState } from '../components/ui';
import { AssetList } from '../components/AssetList';
import { FundForm } from '../components/forms/FundForm';
import { useApp } from '../context/AppContext';
import type { FundAsset } from '../types';

export function FundsPage() {
  const { dispatch, state } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FundAsset | undefined>();

  const swedenFunds = state.data.assets.filter(
    (a) => a.type === 'fund' && (a as FundAsset).country === 'sweden'
  );
  const pakistanFunds = state.data.assets.filter(
    (a) => a.type === 'fund' && (a as FundAsset).country === 'pakistan'
  );
  const otherFunds = state.data.assets.filter(
    (a) => a.type === 'fund' && (a as FundAsset).country === 'other'
  );
  const totalFunds = state.data.assets.filter((a) => a.type === 'fund').length;

  const openAdd = () => { setEditing(undefined); setShowForm(true); };
  const openEdit = (a: FundAsset) => { setEditing(a); setShowForm(true); };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Funds"
        subtitle="Mutual funds, index funds, Islamic funds — Sweden & Pakistan"
        icon={<PieChart size={20} />}
        action={
          <Button icon={<Plus size={15} />} onClick={openAdd}>
            Add Fund
          </Button>
        }
      />

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 space-y-2">
        <p>
          <strong>Zakat on funds — two approaches:</strong>
        </p>
        <ol className="list-decimal pl-4 space-y-1 text-blue-700">
          <li>
            <strong>Full NAV (recommended for simplicity):</strong> The full current market value 
            of your units (units × NAV) is zakatable at 2.5%. Use this if you don't know the 
            fund's internal asset breakdown.
          </li>
          <li>
            <strong>Zakatable % method:</strong> Only the zakatable portion of the fund's assets 
            (cash, trade receivables, inventory) is considered. Use the fund's factsheet or 
            annual report to find this ratio. Preferred by some scholars for passive investors.
          </li>
        </ol>
        <p className="text-xs text-blue-600 mt-1">
          Islamic / Shariah-compliant funds (e.g. Meezan, NBP Islamic, Länsförsäkringar Global 
          Hållbar) may already publish their zakat ratio or deduct zakat automatically.
        </p>
      </div>

      {totalFunds === 0 ? (
        <Card>
          <EmptyState
            icon={<PieChart size={24} />}
            title="No funds added yet"
            description="Add mutual funds, index funds, or Islamic funds from Sweden or Pakistan. Each fund supports its own zakat calculation method."
            action={
              <Button icon={<Plus size={15} />} onClick={openAdd}>
                Add First Fund
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Sweden funds */}
          {swedenFunds.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  🇸🇪 Sweden Funds
                </h3>
                <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={openAdd}>
                  Add
                </Button>
              </div>
              <Card>
                <AssetList
                  assetType="fund"
                  filterFn={(a) => (a as FundAsset).country === 'sweden'}
                  onEdit={(a) => openEdit(a as FundAsset)}
                />
              </Card>
            </div>
          )}

          {/* Pakistan funds */}
          {pakistanFunds.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  🇵🇰 Pakistan Funds
                </h3>
                <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={openAdd}>
                  Add
                </Button>
              </div>
              <Card>
                <AssetList
                  assetType="fund"
                  filterFn={(a) => (a as FundAsset).country === 'pakistan'}
                  onEdit={(a) => openEdit(a as FundAsset)}
                />
              </Card>
            </div>
          )}

          {/* Other funds */}
          {otherFunds.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-800">🌐 Other Funds</h3>
                <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={openAdd}>
                  Add
                </Button>
              </div>
              <Card>
                <AssetList
                  assetType="fund"
                  filterFn={(a) => (a as FundAsset).country === 'other'}
                  onEdit={(a) => openEdit(a as FundAsset)}
                />
              </Card>
            </div>
          )}
        </>
      )}

      {showForm && (
        <FundForm
          existing={editing}
          onSave={(asset) => {
            dispatch(
              editing
                ? { type: 'UPDATE_ASSET', payload: asset }
                : { type: 'ADD_ASSET', payload: asset }
            );
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
