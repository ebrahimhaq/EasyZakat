import { CheckCircle2, AlertCircle, TrendingDown, TrendingUp, Coins, Clock, RotateCcw, CalendarDays } from 'lucide-react';
import { Card } from '../components/ui';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import type { CategorySummary, HawlStatus } from '../types';

const CATEGORY_ICONS: Record<string, string> = {
  cash: '🏦',
  sweden_stock: '🇸🇪',
  pakistan_stock: '🇵🇰',
  fund: '📊',
  gold: '🥇',
  silver: '🥈',
  business: '📦',
  receivable: '💸',
  liability: '📉',
};

function HawlBanner({ hawl, meetsNisab }: { hawl: HawlStatus; meetsNisab: boolean }) {
  if (hawl.state === 'not_started') {
    return (
      <Card className="!p-4 border-dashed">
        <div className="flex items-start gap-3">
          <CalendarDays size={18} className="text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-700">Hawl not started</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Set the date your wealth first reached nisab in <strong>Settings → Hawl Tracker</strong> to 
              begin the 354-day countdown.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (hawl.state === 'broken') {
    return (
      <Card className="!p-4 border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <RotateCcw size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Hawl Reset — Wealth Dropped Below Nisab</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Your wealth fell below the nisab threshold during the year. No zakat is due for this period. 
              Update the nisab-met date in <strong>Settings</strong> when your wealth reaches nisab again.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (hawl.state === 'complete') {
    return (
      <Card className="!p-4 border-emerald-300 bg-emerald-50">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800">✓ Hawl Complete — Zakat is Obligatory</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              354 days have passed since {new Date(hawl.nisabMetDate).toLocaleDateString()}. 
              Pay your zakat and reset the hawl in Settings.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // in_progress
  if (!meetsNisab) {
    return (
      <Card className="!p-4 border-red-200 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Wealth Below Nisab — Hawl May Be Broken</p>
            <p className="text-xs text-red-600 mt-0.5">
              Your current net wealth is below the nisab. If this persists, the hawl resets and no zakat 
              is due. Mark it in <strong>Settings → Hawl Tracker</strong> if this is the case.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="!p-4">
      <div className="flex items-start gap-3">
        <Clock size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-800">Hawl in Progress</p>
            <span className="text-xs font-bold text-blue-600">{hawl.daysRemaining}d left</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-1.5">
            <div
              className="h-full bg-blue-400 rounded-full transition-all"
              style={{ width: `${hawl.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Started {new Date(hawl.nisabMetDate).toLocaleDateString()}</span>
            <span>Due {new Date(hawl.hawlDueDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CategoryRow({ cat }: { cat: CategorySummary }) {
  const { state } = useApp();
  const { displayCurrency, exchangeRates } = state.data.settings;
  const rate = exchangeRates[displayCurrency];

  const value = cat.totalValueSEK / (rate || 1);
  const zakat = cat.netZakatDueSEK / (rate || 1);
  const isLiability = cat.category === 'liability';

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-2xl w-8 text-center shrink-0">{CATEGORY_ICONS[cat.category] ?? '💰'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{cat.label}</p>
        <p className="text-xs text-gray-400">{cat.items.length} item{cat.items.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${isLiability ? 'text-red-600' : 'text-gray-900'}`}>
          {isLiability ? '−' : ''}{formatCurrency(value, displayCurrency)}
        </p>
        {!isLiability && zakat > 0 && (
          <p className="text-xs text-emerald-600 font-medium">
            Zakat: {formatCurrency(zakat, displayCurrency)}
          </p>
        )}
        {!isLiability && zakat === 0 && cat.zakatAlreadyPaidSEK > 0 && (
          <p className="text-xs text-gray-400">✓ Zakat paid</p>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { state } = useApp();
  const result = state.result;
  const { displayCurrency, exchangeRates } = state.data.settings;
  const rate = exchangeRates[displayCurrency];

  if (!result) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>No data yet. Add your assets to get started.</p>
      </div>
    );
  }

  const totalWealthDisplay = result.totalWealthSEK / (rate || 1);
  const totalLiabilitiesDisplay = result.totalLiabilitiesSEK / (rate || 1);
  const netWealthDisplay = result.netZakatableWealthSEK / (rate || 1);
  const totalAssets = state.data.assets.length;

  const nisabPercent = result.nisabValueSEK > 0
    ? Math.min(100, (result.netZakatableWealthSEK / result.nisabValueSEK) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Hero result card */}
      <div
        className={`rounded-2xl p-6 text-white ${
          result.meetsNisab
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-800'
            : 'bg-gradient-to-br from-gray-500 to-gray-700'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-white/70 font-medium uppercase tracking-wider">Zakat Due</p>
            <p className="text-4xl font-bold mt-1">
              {formatCurrency(result.netZakatOwedDisplay, displayCurrency)}
            </p>
            {result.totalZakatAlreadyPaidSEK > 0 && (
              <p className="text-sm text-white/70 mt-1">
                ({formatCurrency(result.totalZakatDueDisplay, displayCurrency)} total − deductions)
              </p>
            )}
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            result.meetsNisab ? 'bg-white/20' : 'bg-white/10'
          }`}>
            {result.meetsNisab
              ? <CheckCircle2 size={28} className="text-white" />
              : <AlertCircle size={28} className="text-white" />
            }
          </div>
        </div>

        <div className={`text-sm rounded-xl px-3 py-2 ${
          result.meetsNisab ? 'bg-white/15' : 'bg-white/10'
        }`}>
          {result.meetsNisab
            ? `✓ Your wealth (${formatCurrency(netWealthDisplay, displayCurrency)}) exceeds the nisab threshold of ${formatCurrency(result.nisabValueDisplay, displayCurrency)}. Zakat is obligatory.`
            : `⚠ Your net wealth (${formatCurrency(netWealthDisplay, displayCurrency)}) is below the nisab of ${formatCurrency(result.nisabValueDisplay, displayCurrency)}. Zakat is not yet obligatory.`
          }
        </div>
      </div>

      {/* Hawl tracker banner */}
      <HawlBanner hawl={result.hawlStatus} meetsNisab={result.meetsNisab} />

      {/* Nisab progress bar */}
      {!result.meetsNisab && result.nisabValueSEK > 0 && (
        <Card>
          <p className="text-sm font-semibold text-gray-700 mb-2">Progress to Nisab</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${nisabPercent}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-600 shrink-0">
              {nisabPercent.toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {formatCurrency(netWealthDisplay, displayCurrency)} of {formatCurrency(result.nisabValueDisplay, displayCurrency)} nisab
          </p>
        </Card>
      )}

      {/* Wealth summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center !p-4">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(totalWealthDisplay, displayCurrency, true)}
          </p>
          <p className="text-xs text-gray-400">Total Assets</p>
        </Card>
        <Card className="text-center !p-4">
          <div className="flex items-center justify-center mb-1">
            <TrendingDown size={16} className="text-red-400" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(totalLiabilitiesDisplay, displayCurrency, true)}
          </p>
          <p className="text-xs text-gray-400">Liabilities</p>
        </Card>
        <Card className="text-center !p-4">
          <div className="flex items-center justify-center mb-1">
            <Coins size={16} className="text-amber-500" />
          </div>
          <p className="text-lg font-bold text-gray-900">{totalAssets}</p>
          <p className="text-xs text-gray-400">Assets Added</p>
        </Card>
      </div>

      {/* Category breakdown */}
      {result.categories.length > 0 && (
        <Card>
          <h3 className="text-base font-bold text-gray-800 mb-2">Breakdown by Category</h3>
          {result.categories.map((cat) => (
            <CategoryRow key={cat.category} cat={cat} />
          ))}
        </Card>
      )}

      {totalAssets === 0 && (
        <Card className="text-center py-10">
          <p className="text-4xl mb-3">🌙</p>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Welcome to EasyZakat</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Start adding your assets using the menu on the left. Your data stays private and is stored only on your device.
          </p>
        </Card>
      )}
    </div>
  );
}
