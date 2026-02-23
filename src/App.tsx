import { useState } from 'react';
import {
  LayoutDashboard, Landmark, TrendingUp, BarChart2,
  Gem, ShoppingBag, Settings, HardDrive, Menu, X,
  Moon, PieChart
} from 'lucide-react';
import { useApp } from './context/AppContext';
import { DashboardPage } from './pages/DashboardPage';
import { CashPage } from './pages/CashPage';
import { SwedenStocksPage } from './pages/SwedenStocksPage';
import { PakistanStocksPage } from './pages/PakistanStocksPage';
import { PreciousMetalsPage } from './pages/PreciousMetalsPage';
import { OtherAssetsPage } from './pages/OtherAssetsPage';
import { FundsPage } from './pages/FundsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DataPage } from './pages/DataPage';
import { formatCurrency } from './utils/format';

// ─── Nav items ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'cash', label: 'Cash & Banks', icon: Landmark, group: 'assets' },
  { id: 'sweden_stocks', label: 'Sweden Stocks', icon: TrendingUp, group: 'assets' },
  { id: 'pakistan_stocks', label: 'Pakistan Stocks', icon: BarChart2, group: 'assets' },
  { id: 'funds', label: 'Funds', icon: PieChart, group: 'assets' },
  { id: 'metals', label: 'Gold & Silver', icon: Gem, group: 'assets' },
  { id: 'other', label: 'Other Assets', icon: ShoppingBag, group: 'assets' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'manage' },
  { id: 'data', label: 'Your Data', icon: HardDrive, group: 'manage' },
];

function NavItem({
  item,
  active,
  onClick,
}: {
  item: typeof NAV_ITEMS[0];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
        ${active
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
        }`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

function Sidebar({ onNav, onClose }: { onNav: (id: string) => void; onClose?: () => void }) {
  const { state } = useApp();
  const { activeSection } = state;
  const result = state.result;
  const { displayCurrency } = state.data.settings;

  const groups = [
    { id: 'main', label: null },
    { id: 'assets', label: 'Assets' },
    { id: 'manage', label: 'Manage' },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Moon size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">EasyZakat</h1>
            <p className="text-xs text-gray-400">{state.data.settings.zakatYear}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Zakat due pill */}
      {result && (
        <div className={`mx-4 mt-4 rounded-xl p-3 text-center ${
          result.meetsNisab ? 'bg-emerald-50' : 'bg-gray-50'
        }`}>
          <p className="text-xs text-gray-500 mb-0.5">Zakat Due</p>
          <p className={`text-lg font-bold ${result.meetsNisab ? 'text-emerald-700' : 'text-gray-600'}`}>
            {formatCurrency(result.netZakatOwedDisplay, displayCurrency)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {result.meetsNisab ? '✓ Obligatory' : '— Below nisab'}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map(({ id: groupId, label }) => {
          const items = NAV_ITEMS.filter((n) => n.group === groupId);
          return (
            <div key={groupId}>
              {label && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  {label}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    active={activeSection === item.id}
                    onClick={() => {
                      onNav(item.id);
                      onClose?.();
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          🔒 Data stored only on your device
        </p>
      </div>
    </div>
  );
}

function renderPage(section: string) {
  switch (section) {
    case 'dashboard': return <DashboardPage />;
    case 'cash': return <CashPage />;
    case 'sweden_stocks': return <SwedenStocksPage />;
    case 'pakistan_stocks': return <PakistanStocksPage />;
    case 'funds': return <FundsPage />;
    case 'metals': return <PreciousMetalsPage />;
    case 'other': return <OtherAssetsPage />;
    case 'settings': return <SettingsPage />;
    case 'data': return <DataPage />;
    default: return <DashboardPage />;
  }
}

export function App() {
  const { state, dispatch } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: id });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-gray-200 shrink-0 sticky top-0 h-screen">
        <Sidebar onNav={navigate} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 h-full shadow-xl">
            <Sidebar onNav={navigate} onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Moon size={18} className="text-emerald-600" />
            <span className="font-bold text-gray-900">EasyZakat</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 pb-20">
          {renderPage(state.activeSection)}
        </main>
      </div>
    </div>
  );
}
