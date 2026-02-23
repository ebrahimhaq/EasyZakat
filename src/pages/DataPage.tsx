import { useRef, useState } from 'react';
import { Download, Upload, Trash2, Shield, HardDrive, FileSpreadsheet } from 'lucide-react';
import { SectionHeader, Card, Button, ConfirmDialog } from '../components/ui';
import { useApp } from '../context/AppContext';
import { exportData, exportCSV, importData, clearData, defaultZakatData } from '../services/storage';

export function DataPage() {
  const { state, dispatch } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [showClear, setShowClear] = useState(false);

  const assetCount = state.data.assets.length;
  const lastModified = new Date(state.data.lastModified).toLocaleString();

  const handleExport = () => {
    exportData(state.data);
  };

  const handleExportCSV = () => {
    exportCSV(state.data);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImportSuccess(false);
    try {
      const imported = await importData(file);
      dispatch({ type: 'LOAD_DATA', payload: imported });
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClear = () => {
    clearData();
    dispatch({ type: 'LOAD_DATA', payload: { ...defaultZakatData } });
    setShowClear(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Your Data"
        subtitle="Export, import, or clear your zakat data"
        icon={<HardDrive size={20} />}
      />

      {/* Privacy notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
        <Shield size={20} className="text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-sm text-emerald-800">
          <strong>100% Private — Your data never leaves this device.</strong>
          <p className="mt-1 text-emerald-700">
            EasyZakat stores all your data in your browser's local storage. No servers, no accounts, 
            no cloud sync. Download a backup file to keep your data safe across devices.
          </p>
        </div>
      </div>

      {/* Status */}
      <Card>
        <h3 className="text-base font-bold text-gray-800 mb-3">Current Data</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Zakat Year</span>
            <span className="font-medium text-gray-800">{state.data.settings.zakatYear}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Total Assets</span>
            <span className="font-medium text-gray-800">{assetCount} item{assetCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-gray-500">Display Currency</span>
            <span className="font-medium text-gray-800">{state.data.settings.displayCurrency}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-gray-500">Last Modified</span>
            <span className="font-medium text-gray-800">{lastModified}</span>
          </div>
        </div>
      </Card>

      {/* Export */}
      <Card>
        <h3 className="text-base font-bold text-gray-800 mb-1">Download Backup</h3>
        <p className="text-sm text-gray-500 mb-4">
          Save all your zakat data as a JSON file. Keep it safe — you can reload it any time, 
          or open it on another device.
        </p>
        <Button
          icon={<Download size={16} />}
          onClick={handleExport}
          disabled={assetCount === 0}
        >
          Download easyzakat-{state.data.settings.zakatYear}.json
        </Button>
        {assetCount === 0 && (
          <p className="text-xs text-gray-400 mt-2">Add some assets first to enable export.</p>
        )}
      </Card>

      {/* Export CSV */}
      <Card>
        <h3 className="text-base font-bold text-gray-800 mb-1">Download as CSV</h3>
        <p className="text-sm text-gray-500 mb-4">
          Export your assets as a spreadsheet — open in Excel, Google Sheets, or Numbers for 
          further analysis or record-keeping.
        </p>
        <Button
          variant="secondary"
          icon={<FileSpreadsheet size={16} />}
          onClick={handleExportCSV}
          disabled={assetCount === 0}
        >
          Download easyzakat-{state.data.settings.zakatYear}.csv
        </Button>
        {assetCount === 0 && (
          <p className="text-xs text-gray-400 mt-2">Add some assets first to enable export.</p>
        )}
      </Card>

      {/* Import */}
      <Card>
        <h3 className="text-base font-bold text-gray-800 mb-1">Restore from File</h3>
        <p className="text-sm text-gray-500 mb-4">
          Load a previously exported EasyZakat JSON file. <strong>This will replace all current data.</strong>
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImport}
        />
        <Button
          variant="secondary"
          icon={<Upload size={16} />}
          onClick={() => fileRef.current?.click()}
        >
          Choose File to Import
        </Button>
        {importError && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {importError}
          </div>
        )}
        {importSuccess && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700">
            ✓ Data imported successfully!
          </div>
        )}
      </Card>

      {/* Clear */}
      <Card>
        <h3 className="text-base font-bold text-gray-800 mb-1">Clear All Data</h3>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete all your zakat data from this device. This cannot be undone. 
          Download a backup first if you want to keep your data.
        </p>
        <Button
          variant="danger"
          icon={<Trash2 size={16} />}
          onClick={() => setShowClear(true)}
        >
          Clear All Data
        </Button>
      </Card>

      <ConfirmDialog
        isOpen={showClear}
        title="Clear All Data"
        message="This will permanently delete all your assets and settings from this device. Download a backup first if you want to keep your data. This cannot be undone."
        confirmLabel="Yes, Delete Everything"
        onConfirm={handleClear}
        onCancel={() => setShowClear(false)}
      />
    </div>
  );
}
