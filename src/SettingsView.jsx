import React, { useState, useMemo } from 'react';
import {
  Sliders,
  RotateCcw,
  Search,
  Check,
  Edit3,
  Database,
  ShieldCheck,
  Download,
  CreditCard,
  SendHorizontal,
  Layers,
  Sun,
  Moon,
  Monitor,
  Palette
} from 'lucide-react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { useTheme } from './utils/useTheme';

export const SettingsView = ({
  columnMappings,
  onUpdateColumnMappings,
  onResetColumnMappings
}) => {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRail, setSelectedRail] = useState('ETRANSFER');
  const [editingId, setEditingId] = useState(null);
  const [tempLabel, setTempLabel] = useState('');
  const [saveToast, setSaveToast] = useState(null);

  const rails = [
    { id: 'ETRANSFER', label: 'E-Transfer (Interac)', icon: SendHorizontal, countBadge: 'Active Rail' },
    { id: 'CARD', label: 'Card (Visa / Mastercard)', icon: CreditCard, countBadge: 'Extensible Rail' },
    { id: 'ALL', label: 'All Payment Rails', icon: Layers, countBadge: null }
  ];

  const themeOptions = [
    {
      id: 'light',
      label: 'Light Mode',
      desc: 'Clean porcelain backdrop, maximum daylight contrast',
      icon: Sun,
      color: 'text-amber-500',
      activeBorder: 'border-sky-500 bg-sky-500/10'
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      desc: 'Deep obsidian backdrop, reduced eye strain for night shifts',
      icon: Moon,
      color: 'text-indigo-400',
      activeBorder: 'border-sky-500 bg-sky-500/10'
    },
    {
      id: 'system',
      label: 'System Sync',
      desc: 'Automatically matches your OS theme preferences',
      icon: Monitor,
      color: 'text-slate-400',
      activeBorder: 'border-sky-500 bg-sky-500/10'
    }
  ];

  const mappingsList = useMemo(() => {
    return Object.values(columnMappings || {});
  }, [columnMappings]);

  const customizedCount = useMemo(() => {
    return mappingsList.filter(m => m.customLabel && m.customLabel !== m.defaultLabel).length;
  }, [mappingsList]);

  const filteredMappings = useMemo(() => {
    return mappingsList.filter(item => {
      const itemRail = item.rail || 'ETRANSFER';
      if (selectedRail !== 'ALL' && itemRail !== selectedRail) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mKey = (item.key || '').toLowerCase().includes(q);
        const mDef = (item.defaultLabel || '').toLowerCase().includes(q);
        const mCust = (item.customLabel || '').toLowerCase().includes(q);
        const mRail = itemRail.toLowerCase().includes(q);
        return mKey || mDef || mCust || mRail;
      }
      return true;
    });
  }, [mappingsList, selectedRail, searchQuery]);

  const handleStartEdit = (item) => {
    setEditingId(item.id || `${item.rail || 'ETRANSFER'}:${item.key}`);
    setTempLabel(item.customLabel || item.defaultLabel);
  };

  const handleSaveEdit = (item) => {
    if (!tempLabel.trim()) return;
    const mapId = item.id || `${item.rail || 'ETRANSFER'}:${item.key}`;
    const updated = {
      ...columnMappings,
      [mapId]: {
        ...item,
        id: mapId,
        customLabel: tempLabel.trim()
      }
    };
    onUpdateColumnMappings(updated);
    setEditingId(null);
    showToast(`Renamed ${item.key} (${item.rail || 'ETRANSFER'}) to "${tempLabel.trim()}"`);
  };

  const handleResetSingle = (item) => {
    const mapId = item.id || `${item.rail || 'ETRANSFER'}:${item.key}`;
    const updated = {
      ...columnMappings,
      [mapId]: {
        ...item,
        id: mapId,
        customLabel: item.defaultLabel
      }
    };
    onUpdateColumnMappings(updated);
    showToast(`Reset ${item.key} (${item.rail || 'ETRANSFER'}) to default "${item.defaultLabel}"`);
  };

  const showToast = (message) => {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleExportMappings = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(columnMappings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "leon_column_mappings.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported column mappings JSON.');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-sky-900 dark:bg-sky-950 border border-sky-400 dark:border-sky-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-in slide-in-from-bottom-4">
          <Check size={16} className="text-sky-300 dark:text-sky-400" />
          <span className="text-xs font-semibold">{saveToast}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10141E] flex flex-wrap justify-between items-center gap-4 shrink-0 shadow-sm dark:shadow-lg transition-colors duration-200">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400">
              <Sliders size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
                <span>Configuration & Preferences</span>
                <Badge variant="cyan" className="ml-3 font-mono text-[10px]">
                  System Control
                </Badge>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage appearance, display themes, and column mapping schema by payment rail across all investigation queues.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMappings}
            className="text-xs cursor-pointer"
          >
            <Download size={13} className="mr-1.5" />
            Export Schema
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (window.confirm('Reset all column mappings back to system defaults?')) {
                onResetColumnMappings();
                showToast('All column names reset to default.');
              }
            }}
            className="text-xs cursor-pointer"
          >
            <RotateCcw size={13} className="mr-1.5" />
            Reset All to Default
          </Button>
        </div>
      </header>

      {/* WORKSPACE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* APPEARANCE & DISPLAY THEME SECTION */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Workspace Theme</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred visual presentation mode for triage and forensic analysis.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isCurrent = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                    isCurrent
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-sky-500/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm ${opt.color}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{opt.label}</span>
                    </div>
                    {isCurrent && (
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* STATS METRIC ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Total Configured Fields</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{mappingsList.length}</span>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-slate-600 dark:text-slate-400">
              <Database size={20} />
            </div>
          </Card>

          <Card className="p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Custom Renamed Columns</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">{customizedCount}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">active overrides</span>
              </div>
            </div>
            <div className="p-3 bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/50 rounded-xl text-sky-600 dark:text-sky-400">
              <Edit3 size={20} />
            </div>
          </Card>

          <Card className="p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Active Payment Rail</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">ETRANSFER (Interac Online)</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={20} />
            </div>
          </Card>
        </div>

        {/* PAYMENT RAIL SELECTOR & SEARCH CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur">
          
          {/* Rail Selector Tabs */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2">Payment Rail:</span>
            {rails.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRail === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRail(r.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-sm ${
                    isSelected
                      ? 'bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 shadow-md font-bold scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon size={14} />
                  <span>{r.label}</span>
                  {r.countBadge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-sky-700 dark:bg-slate-900/40 text-white dark:text-slate-950' : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400'}`}>
                      {r.countBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search SQL column or display label..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-800 focus:outline-none focus:border-sky-500 font-sans shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* FIELD MAPPINGS TABLE */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
          <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950/95 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 w-36">Payment Rail</th>
                <th className="p-4">Technical SQL Column Name</th>
                <th className="p-4">Default System Label</th>
                <th className="p-4 w-96">Active Custom Display Name</th>
                <th className="p-4 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
              {filteredMappings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-500 italic">
                    No column mapping records found matching "{searchQuery}" for rail "{selectedRail}".
                  </td>
                </tr>
              ) : (
                filteredMappings.map((item) => {
                  const mapId = item.id || `${item.rail || 'ETRANSFER'}:${item.key}`;
                  const isCustom = item.customLabel && item.customLabel !== item.defaultLabel;
                  const isEditing = editingId === mapId;
                  const railName = item.rail || 'ETRANSFER';

                  return (
                    <tr
                      key={mapId}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${isCustom ? 'bg-sky-50/50 dark:bg-sky-950/15' : ''}`}
                    >
                      {/* Rail Badge */}
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 ${
                            railName === 'ETRANSFER'
                              ? 'border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                              : 'border-purple-300 dark:border-purple-700/60 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                          }`}
                        >
                          {railName}
                        </Badge>
                      </td>

                      {/* Technical SQL Column Name */}
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="text-sky-700 dark:text-sky-400 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800">
                            {item.key}
                          </span>
                          {isCustom && (
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" title="Customized field" />
                          )}
                        </div>
                      </td>

                      {/* Default System Label */}
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                        {item.defaultLabel}
                      </td>

                      {/* Active Custom Display Name (Editable) */}
                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={tempLabel}
                              onChange={(e) => setTempLabel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(item);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                              className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold px-3 py-1.5 rounded-lg text-xs border border-sky-500 focus:outline-none w-full shadow-inner"
                              placeholder="Enter custom label..."
                            />
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSaveEdit(item)}
                              className="h-8 px-2.5 bg-sky-600 dark:bg-sky-500 text-white dark:text-slate-950 font-bold hover:bg-sky-500 dark:hover:bg-sky-400 cursor-pointer shrink-0"
                            >
                              <Check size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEdit(item)}
                            className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-sky-500/60 cursor-pointer group transition-all"
                            title="Click to rename this field"
                          >
                            <span className={`font-semibold ${isCustom ? 'text-sky-700 dark:text-sky-300 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                              {item.customLabel || item.defaultLabel}
                            </span>
                            <Edit3 size={13} className="text-slate-400 group-hover:text-sky-500 transition-colors shrink-0 ml-2" />
                          </div>
                        )}
                      </td>

                      {/* Action: Reset */}
                      <td className="p-4 text-center">
                        {isCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetSingle(item)}
                            className="text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/30 cursor-pointer h-7"
                            title="Reset to default label"
                          >
                            <RotateCcw size={12} className="mr-1" />
                            Reset
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
