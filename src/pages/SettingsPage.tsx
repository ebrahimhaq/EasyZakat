import { Settings, RefreshCw, Info, CalendarDays, RotateCcw, CheckCircle2, Clock } from 'lucide-react';
import { SectionHeader, Card, Input, Select, Button } from '../components/ui';
import { useApp } from '../context/AppContext';
import type { Currency, NisabSettings, ExchangeRates } from '../types';
import { computeHawlStatus } from '../services/calculator';

const CURRENCIES: Array<{ value: string; label: string }> = [
  { value: 'SEK', label: 'SEK – Swedish Krona' },
  { value: 'PKR', label: 'PKR – Pakistani Rupee' },
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'GBP', label: 'GBP – British Pound' },
];

export function SettingsPage() {
  const { state, dispatch } = useApp();
  const { settings } = state.data;

  const update = (patch: Partial<typeof settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: patch });
  };

  const updateNisab = (patch: Partial<NisabSettings>) => {
    update({ nisab: { ...settings.nisab, ...patch } });
  };

  const updateRates = (patch: Partial<ExchangeRates>) => {
    update({
      exchangeRates: {
        ...settings.exchangeRates,
        ...patch,
        lastUpdated: new Date().toISOString(),
      },
    });
  };

  const nisabValueSEK =
    settings.nisab.method === 'gold'
      ? 85 * settings.nisab.goldPricePerGramSEK
      : 595 * settings.nisab.silverPricePerGramSEK;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        subtitle="Configure currencies, exchange rates, and nisab threshold"
        icon={<Settings size={20} />}
      />

      {/* General */}
      <Card>
        <h3 className="text-base font-bold text-gray-800 mb-4">General</h3>
        <div className="space-y-4">
          <Select
            label="Display Currency"
            hint="All results will be shown in this currency"
            value={settings.displayCurrency}
            options={CURRENCIES}
            onChange={(e) => update({ displayCurrency: e.target.value as Currency })}
          />
          <Input
            label="Zakat Year"
            placeholder="e.g. 2025-2026"
            value={settings.zakatYear}
            onChange={(e) => update({ zakatYear: e.target.value })}
          />
        </div>
      </Card>

      {/* Hawl Tracker */}
      {(() => {
        const hawl = computeHawlStatus(state.data);
        const isComplete = hawl.state === 'complete';
        const isBroken = hawl.state === 'broken';
        const inProgress = hawl.state === 'in_progress';
        const notStarted = hawl.state === 'not_started';

        return (
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays size={16} className="text-emerald-600" />
              <h3 className="text-base font-bold text-gray-800">Hawl Tracker</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Hawl is the Hijri lunar year (354 days) your wealth must remain at or above the nisab 
              for zakat to become obligatory. If your wealth drops below nisab mid-year, the hawl resets.
            </p>

            {/* Status badge */}
            {isComplete && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-800">Hawl Complete — Zakat is Due</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    354 days have passed since {new Date(hawl.nisabMetDate).toLocaleDateString()}. 
                    Pay your zakat and reset the hawl date below.
                  </p>
                </div>
              </div>
            )}
            {inProgress && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
                <Clock size={18} className="text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-800">Hawl in Progress</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {hawl.daysRemaining} day{hawl.daysRemaining !== 1 ? 's' : ''} remaining — 
                    due {new Date(hawl.hawlDueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            {isBroken && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                <RotateCcw size={18} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Hawl Reset</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    You marked your wealth as having dropped below nisab. 
                    Set a new nisab-met date when your wealth reaches nisab again.
                  </p>
                </div>
              </div>
            )}
            {notStarted && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
                <Info size={18} className="text-gray-400 shrink-0" />
                <p className="text-sm text-gray-500">
                  Set the date your wealth first reached nisab to start the hawl countdown.
                </p>
              </div>
            )}

            {/* Progress bar (only when in progress or complete) */}
            {(inProgress || isComplete) && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{hawl.daysElapsed} days elapsed</span>
                  <span>{hawl.progressPercent}% of 354 days</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-blue-400'}`}
                    style={{ width: `${hawl.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{new Date(hawl.nisabMetDate).toLocaleDateString()}</span>
                  <span>Due: {new Date(hawl.hawlDueDate).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            {/* Date input */}
            <Input
              label="Date Nisab Was First Met"
              hint="The day your net wealth reached or exceeded the nisab threshold"
              type="date"
              value={settings.nisabMetDate}
              onChange={(e) => update({ nisabMetDate: e.target.value, hawlBroken: false })}
            />

            {/* Broken-hawl toggle */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Wealth dropped below nisab mid-year</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    If your wealth fell below the nisab at any point this year, mark this to reset the hawl. 
                    The countdown restarts when you set a new nisab-met date above.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => update({ hawlBroken: !settings.hawlBroken, nisabMetDate: settings.hawlBroken ? settings.nisabMetDate : '' })}
                  className={`shrink-0 relative w-10 h-6 rounded-full transition-colors ${settings.hawlBroken ? 'bg-amber-500' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.hawlBroken ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Reset after paying */}
            {isComplete && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<RotateCcw size={13} />}
                  onClick={() => update({ nisabMetDate: new Date().toISOString().split('T')[0], hawlBroken: false })}
                >
                  I've paid — restart hawl from today
                </Button>
              </div>
            )}
          </Card>
        );
      })()}

      {/* Nisab Settings */}
      <Card>
        <h3 className="text-base font-bold text-gray-800 mb-1">Nisab Threshold</h3>
        <p className="text-xs text-gray-400 mb-4">
          Nisab is the minimum amount of wealth required for zakat to be obligatory.
          It equals 85g of gold or 595g of silver.
        </p>

        <div className="space-y-4">
          <Select
            label="Nisab Calculation Method"
            value={settings.nisab.method}
            options={[
              { value: 'gold', label: 'Gold Nisab (85g of gold) — recommended' },
              { value: 'silver', label: 'Silver Nisab (595g of silver) — more inclusive' },
            ]}
            onChange={(e) => updateNisab({ method: e.target.value as 'gold' | 'silver' })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Gold Price per gram (SEK)"
              hint="24K gold price per gram in SEK"
              type="number"
              min="0"
              step="0.01"
              value={settings.nisab.goldPricePerGramSEK}
              onChange={(e) => updateNisab({ goldPricePerGramSEK: Number(e.target.value) })}
              suffix="SEK"
            />
            <Input
              label="Silver Price per gram (SEK)"
              hint="Fine silver per gram in SEK"
              type="number"
              min="0"
              step="0.01"
              value={settings.nisab.silverPricePerGramSEK}
              onChange={(e) => updateNisab({ silverPricePerGramSEK: Number(e.target.value) })}
              suffix="SEK"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
            <Info size={16} className="text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-sm text-emerald-800">
              <strong>Current Nisab Value:</strong>{' '}
              SEK {nisabValueSEK.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} 
              {' '}({settings.nisab.method === 'gold' ? '85g × ' + settings.nisab.goldPricePerGramSEK + '/g gold' : '595g × ' + settings.nisab.silverPricePerGramSEK + '/g silver'})
              <p className="text-xs text-emerald-600 mt-1">
                Update gold/silver prices to current market rates for accurate nisab calculation. 
                Check <strong>Guld & Silver</strong> price on e.g. Avanza or Bullion By Post.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Exchange Rates */}
      <Card>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-gray-800">Exchange Rates</h3>
          <span className="text-xs text-gray-400">
            vs SEK · Last updated: {new Date(settings.exchangeRates.lastUpdated).toLocaleDateString()}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          How many SEK per 1 unit of each currency. Update these manually from your bank or xe.com.
        </p>

        <div className="space-y-3">
          {(['PKR', 'USD', 'EUR', 'GBP'] as const).map((currency) => (
            <Input
              key={currency}
              label={`1 ${currency} = ? SEK`}
              type="number"
              min="0"
              step="0.0001"
              value={settings.exchangeRates[currency]}
              onChange={(e) => updateRates({ [currency]: Number(e.target.value) })}
              suffix="SEK"
            />
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={13} />}
            onClick={() => updateRates({ lastUpdated: new Date().toISOString() })}
          >
            Mark as Updated Now
          </Button>
        </div>
      </Card>

      <div className="text-xs text-gray-400 text-center px-4 pb-2 space-y-1">
        <p>All data is stored only on your device (localStorage). Nothing leaves your browser.</p>
        <p>EasyZakat is a calculation aid. For official religious rulings, please consult a qualified scholar.</p>
      </div>
    </div>
  );
}
