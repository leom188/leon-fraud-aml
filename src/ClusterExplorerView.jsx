import React, { useState, useMemo } from 'react';
import {
  Network,
  Search,
  Filter,
  Layers,
  FileSpreadsheet,
  Upload,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Inbox,
  Briefcase,
  List as ListIcon,
  Zap,
  FileBarChart,
  Settings,
  RefreshCw,
  Download,
  X,
  Eye,
  Database,
  Users,
  ShieldAlert,
  Clock,
  Activity,
  ArrowUpRight,
  CheckSquare,
  Square,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  Tag
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from './components/ui/table';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';

const TACTICAL_PRESETS = [
  { id: 'ALL', label: 'All Clusters', icon: Layers },
  { id: 'CRITICAL', label: '🔴 Critical Illicit', icon: ShieldAlert, badge: 'Critical' },
  { id: 'STRUCTURING', label: '⚡ $100–$500 Structuring', icon: Zap },
  { id: 'KEYWORD', label: '⚠️ Keyword Breaches', icon: AlertTriangle },
  { id: 'HIGH_VOL', label: '💰 High Volume (> $10k)', icon: DollarSign }
];

const ClusterExplorerView = ({
  dataState,
  onNavigate,
  onSelectEntityGroup,
  onOpenUploadModal,
  columnMappings = {}
}) => {
  const getColLabel = (key, fallback) => {
    const railKey = `ETRANSFER:${key}`;
    return columnMappings?.[railKey]?.customLabel || 
           columnMappings?.[railKey]?.defaultLabel || 
           columnMappings?.[key]?.customLabel || 
           columnMappings?.[key]?.defaultLabel || 
           fallback;
  };

  const getGroupingKeySourceLabel = (source) => {
    if (!source) return getColLabel('TRX_BEN_ACCT_NUM', 'Recipient Email');
    const s = String(source).toUpperCase().replace(/\s+/g, '_');
    if (s.includes('RECIPIENT_EMAIL') || s.includes('BEN_ACCT_NUM') || s === 'RECIPIENT EMAIL') {
      return getColLabel('TRX_BEN_ACCT_NUM', 'Recipient Email');
    }
    if (s.includes('RECIPIENT_NAME') || s.includes('ACCT_BEN_NAME') || s === 'RECIPIENT NAME') {
      return getColLabel('TRX_ACCT_BEN_NAME', 'Beneficiary Name');
    }
    if (s.includes('SENDER_EMAIL') || s.includes('FREE_TEXT_3') || s === 'SENDER EMAIL') {
      return getColLabel('TRX_FREE_TEXT_3', 'Sender Email');
    }
    if (s.includes('SENDER_NAME') || s.includes('FREE_TEXT_8') || s === 'SENDER NAME') {
      return getColLabel('TRX_FREE_TEXT_8', 'Sender Name');
    }
    if (s.includes('OPERATOR')) {
      return getColLabel('TRX_OPERATOR_CODE', 'Operator Code');
    }
    return source;
  };

  // View Mode & Quick Peek Drawer State
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [quickPeekCluster, setQuickPeekCluster] = useState(null);
  const [activePreset, setActivePreset] = useState('ALL');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('ALL');
  const [selectedCorporation, setSelectedCorporation] = useState('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState('ALL');
  const [selectedRule, setSelectedRule] = useState('ALL');
  const [selectedDirection, setSelectedDirection] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');

  // Multi-select & Batch Actions State
  const [selectedClusterIds, setSelectedClusterIds] = useState(new Set());
  const [batchToast, setBatchToast] = useState('');

  // Sorting & Pagination States (Default: Risk Level & Rules highest to lowest)
  const [sortField, setSortField] = useState('risk_score'); 
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const groups = dataState?.groupedEntities || [];

  // Max group amount for visual intensity bar calculation
  const maxGroupAmount = useMemo(() => {
    return Math.max(...groups.map(g => g.total_amount || 0), 1);
  }, [groups]);

  // Extract unique clients for filter dropdown
  const uniqueClients = useMemo(() => {
    const clientsMap = new Map();
    groups.forEach(g => {
      if (g.client_name && !clientsMap.has(g.client_name)) {
        clientsMap.set(g.client_name, g.client_id);
      }
    });
    return Array.from(clientsMap.entries()).map(([name, id]) => ({ name, id }));
  }, [groups]);

  // Extract unique corporations for filter dropdown
  const uniqueCorporations = useMemo(() => {
    const corpsSet = new Set();
    groups.forEach(g => {
      const corp = g.corporation_code || (g.transactions && g.transactions[0]?.corporation_code);
      if (corp && corp !== 'N/A' && corp !== 'NULL' && corp !== 'Unspecified Corporation') {
        corpsSet.add(corp);
      }
    });
    return Array.from(corpsSet).sort();
  }, [groups]);

  // Compute latest transaction date across dataset as anchor for relative time ranges
  const datasetLatestDate = useMemo(() => {
    let latest = null;
    groups.forEach(g => {
      if (g.last_transaction_date && g.last_transaction_date !== 'N/A') {
        const d = new Date(g.last_transaction_date);
        if (!isNaN(d.getTime())) {
          if (!latest || d > latest) latest = d;
        }
      }
    });
    return latest;
  }, [groups]);

  // Extract unique rule names for filter dropdown
  const uniqueRules = useMemo(() => {
    const rulesSet = new Set();
    groups.forEach(g => {
      (g.rule_names || []).forEach(r => {
        if (r && typeof r === 'string') {
          const cleaned = r.trim().replace(/^['"]|['"]$/g, '');
          if (cleaned && !/^\d+$/.test(cleaned)) {
            rulesSet.add(cleaned);
          }
        }
      });
      (g.transactions || []).forEach(tx => {
        (tx.rule_names || []).forEach(r => {
          if (r && typeof r === 'string') {
            const cleaned = r.trim().replace(/^['"]|['"]$/g, '');
            if (cleaned && !/^\d+$/.test(cleaned)) {
              rulesSet.add(cleaned);
            }
          }
        });
      });
    });
    return Array.from(rulesSet).sort();
  }, [groups]);

  // Handle Preset Switching
  const handleSelectPreset = (presetId) => {
    setActivePreset(presetId);
    setCurrentPage(1);

    if (presetId === 'ALL') {
      setSelectedRisk('ALL');
      setSelectedDirection('ALL');
    } else if (presetId === 'CRITICAL') {
      setSelectedRisk('Critical');
    } else if (presetId === 'STRUCTURING') {
      setSelectedDirection('Incoming');
    }
  };

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      // Tactical Preset Conditions
      if (activePreset === 'CRITICAL' && g.risk_level !== 'Critical') return false;
      if (activePreset === 'HIGH_VOL' && (g.total_amount || 0) < 10000) return false;
      if (activePreset === 'KEYWORD') {
        const hasKw = (g.transactions || []).some(tx => 
          /weed|canna|dispensary|crypto|edibles/i.test(tx.memo || '') ||
          /weed|canna|dispensary|crypto/i.test(tx.recipient_name || '')
        );
        if (!hasKw && !(g.rule_names || []).some(r => /keyword|green/i.test(r))) return false;
      }
      if (activePreset === 'STRUCTURING') {
        const inRangeCount = (g.transactions || []).filter(tx => tx.amount >= 100 && tx.amount <= 500).length;
        const ratio = g.transaction_count > 0 ? inRangeCount / g.transaction_count : 0;
        if (ratio < 0.5) return false;
      }

      // Standard Filters
      if (selectedClient !== 'ALL') {
        if (g.client_name !== selectedClient && g.client_id !== selectedClient) return false;
      }
      if (selectedCorporation !== 'ALL') {
        const corp = g.corporation_code || (g.transactions && g.transactions[0]?.corporation_code);
        if (corp !== selectedCorporation) return false;
      }
      if (selectedTimeRange !== 'ALL' && datasetLatestDate) {
        let days = 30;
        if (selectedTimeRange === '7D') days = 7;
        else if (selectedTimeRange === '15D') days = 15;
        else if (selectedTimeRange === '30D') days = 30;
        else if (selectedTimeRange === '90D') days = 90;

        const cutoffDate = new Date(datasetLatestDate.getTime() - days * 24 * 60 * 60 * 1000);
        const lastDate = g.last_transaction_date && g.last_transaction_date !== 'N/A' ? new Date(g.last_transaction_date) : null;
        if (lastDate && !isNaN(lastDate.getTime()) && lastDate < cutoffDate) {
          return false;
        }
      }
      if (selectedRule !== 'ALL') {
        const hasRuleInGroup = (g.rule_names || []).some(r => String(r).includes(selectedRule));
        const hasRuleInTx = (g.transactions || []).some(tx => (tx.rule_names || []).some(r => String(r).includes(selectedRule)));
        if (!hasRuleInGroup && !hasRuleInTx) return false;
      }
      if (selectedDirection !== 'ALL') {
        if (g.transaction_direction !== selectedDirection) return false;
      }
      if (selectedSource !== 'ALL') {
        if (g.grouping_key_source !== selectedSource) return false;
      }
      if (selectedRisk !== 'ALL') {
        if (g.risk_level !== selectedRisk) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mKey = (g.grouping_key || '').toLowerCase().includes(q);
        const mClient = (g.client_name || '').toLowerCase().includes(q);
        const mCust = (g.customer_id || '').toLowerCase().includes(q);
        const mAcct = (g.customer_account || '').toLowerCase().includes(q);
        const mCorp = (g.corporation_code || '').toLowerCase().includes(q);
        const mRules = (g.rule_names || []).some(r => String(r).toLowerCase().includes(q));
        if (!mKey && !mClient && !mCust && !mAcct && !mCorp && !mRules) return false;
      }
      return true;
    });
  }, [groups, activePreset, selectedClient, selectedCorporation, selectedTimeRange, datasetLatestDate, selectedRule, selectedDirection, selectedSource, selectedRisk, searchQuery]);

  // Sorted Groups
  const sortedGroups = useMemo(() => {
    return [...filteredGroups].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'risk_score' || sortField === 'total_amount' || sortField === 'transaction_count') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (sortField === 'avg_amount') {
        valA = a.transaction_count > 0 ? (a.total_amount / a.transaction_count) : 0;
        valB = b.transaction_count > 0 ? (b.total_amount / b.transaction_count) : 0;
      } else {
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredGroups, sortField, sortOrder]);

  // Paginated Groups
  const totalPages = Math.ceil(sortedGroups.length / pageSize) || 1;
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedGroups.slice(start, start + pageSize);
  }, [sortedGroups, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setActivePreset('ALL');
    setSearchQuery('');
    setSelectedClient('ALL');
    setSelectedCorporation('ALL');
    setSelectedTimeRange('ALL');
    setSelectedRule('ALL');
    setSelectedDirection('ALL');
    setSelectedSource('ALL');
    setSelectedRisk('ALL');
    setCurrentPage(1);
  };

  const toggleSelectCluster = (id) => {
    setSelectedClusterIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedClusterIds.size === paginatedGroups.length && paginatedGroups.length > 0) {
      setSelectedClusterIds(new Set());
    } else {
      setSelectedClusterIds(new Set(paginatedGroups.map(g => g.id)));
    }
  };

  const handleBulkExport = () => {
    const targets = groups.filter(g => selectedClusterIds.has(g.id));
    if (targets.length === 0) return;

    const exportRows = targets.map(g => ({
      'Entity Key': g.grouping_key,
      'Field': g.grouping_key_source,
      'Client Name': g.client_name,
      'Client ID': g.client_id,
      'Corporation': g.corporation_code || 'N/A',
      'Tx Count': g.transaction_count,
      'Total Amount': g.total_amount,
      'Risk Score': g.risk_score,
      'Risk Level': g.risk_level,
      'Triggered Rules': (g.rule_names || []).join(', ')
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Selected_Clusters');
    XLSX.writeFile(wb, `LEON_Selected_Clusters_${new Date().toISOString().slice(0, 10)}.xlsx`);

    setBatchToast(`Exported ${targets.length} selected clusters to Excel`);
    setTimeout(() => setBatchToast(''), 3500);
  };

  // Summary Metrics
  const filteredVolume = filteredGroups.reduce((acc, g) => acc + (g.total_amount || 0), 0);
  const filteredTxCount = filteredGroups.reduce((acc, g) => acc + (g.transaction_count || 0), 0);
  const criticalCount = filteredGroups.filter(g => g.risk_level === 'Critical').length;

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 dark:bg-[#0B0E14] relative transition-colors duration-200">
      
      {/* MAIN EXPLORER COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* 1. TACTICAL PRESETS & FILTER BAR */}
        <div className="p-5 bg-white dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 shrink-0 space-y-3.5 transition-colors duration-200">
          
          {/* Top Row: Presets Pills & View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Tactical Presets Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500 mr-1.5 hidden sm:inline">
                Tactical Lenses:
              </span>
              {TACTICAL_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 shadow-xs dark:shadow-sky-500/10'
                        : 'bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-850'
                    }`}
                  >
                    <Icon size={13} className="mr-1.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Forensic Data Grid"
              >
                <List size={13} className="mr-1" /> Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Entity Network Cards"
              >
                <LayoutGrid size={13} className="mr-1" /> Cards
              </button>
            </div>
          </div>

          {/* KPI Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Filtered Entities</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold text-base">
                {filteredGroups.length} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/ {groups.length}</span>
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Filtered Volume</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-base">
                ${filteredVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Transactions</span>
              <span className="text-sky-600 dark:text-sky-300 font-mono font-bold text-base">{filteredTxCount.toLocaleString()} txns</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Critical Risk Groups</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono font-bold text-base flex items-center">
                <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse" /> {criticalCount} Entities
              </span>
            </div>
          </div>

          {/* Filter Matrix Toolbar Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Search entity key, client, customer ID, account, rule..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-8 h-9 text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Client Filter */}
            <select
              value={selectedClient}
              onChange={(e) => { setSelectedClient(e.target.value); setCurrentPage(1); }}
              className="bg-white dark:bg-slate-950/80 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-sky-500 max-w-[170px] truncate h-9"
            >
              <option value="ALL">All Clients ({uniqueClients.length})</option>
              {uniqueClients.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Corporation Filter */}
            <select
              value={selectedCorporation}
              onChange={(e) => { setSelectedCorporation(e.target.value); setCurrentPage(1); }}
              className="bg-white dark:bg-slate-950/80 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-sky-500 max-w-[160px] truncate h-9"
            >
              <option value="ALL">All Corps ({uniqueCorporations.length})</option>
              {uniqueCorporations.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Time Window */}
            <select
              value={selectedTimeRange}
              onChange={(e) => { setSelectedTimeRange(e.target.value); setCurrentPage(1); }}
              className="bg-white dark:bg-slate-950/80 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-sky-500 h-9"
            >
              <option value="ALL">All Time</option>
              <option value="7D">Last 7 Days</option>
              <option value="15D">Last 15 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
            </select>

            {/* Rule Trigger */}
            <select
              value={selectedRule}
              onChange={(e) => { setSelectedRule(e.target.value); setCurrentPage(1); }}
              className="bg-white dark:bg-slate-950/80 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-sky-500 max-w-[180px] truncate h-9"
            >
              <option value="ALL">All Rules ({uniqueRules.length})</option>
              {uniqueRules.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Direction */}
            <select
              value={selectedDirection}
              onChange={(e) => { setSelectedDirection(e.target.value); setCurrentPage(1); }}
              className="bg-white dark:bg-slate-950/80 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-sky-500 h-9"
            >
              <option value="ALL">All Directions</option>
              <option value="Incoming">Incoming (D)</option>
              <option value="Outgoing">Outgoing (C)</option>
            </select>

            {/* Risk Level */}
            <select
              value={selectedRisk}
              onChange={(e) => { setSelectedRisk(e.target.value); setCurrentPage(1); }}
              className="bg-white dark:bg-slate-950/80 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-sky-500 h-9"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="Elevated">Elevated</option>
              <option value="Review Required">Review Required</option>
              <option value="Normal">Normal</option>
            </select>

            {/* Reset */}
            {(activePreset !== 'ALL' || selectedClient !== 'ALL' || selectedCorporation !== 'ALL' || selectedTimeRange !== 'ALL' || selectedRule !== 'ALL' || selectedDirection !== 'ALL' || selectedSource !== 'ALL' || selectedRisk !== 'ALL' || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 px-3 text-xs"
              >
                <X size={12} className="mr-1" /> Reset
              </Button>
            )}

          </div>
        </div>

        {/* BATCH ACTION BAR (WHEN SELECTED) */}
        {selectedClusterIds.size > 0 && (
          <div className="bg-sky-950/80 border-b border-sky-800/80 px-6 py-2.5 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-3 text-xs">
              <Badge variant="cyan" className="font-mono">
                {selectedClusterIds.size} Selected
              </Badge>
              <span className="text-slate-300">
                Bulk operations across highlighted clusters:
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBulkExport}
                className="h-7 text-xs font-semibold text-white bg-sky-900/60 hover:bg-sky-800"
              >
                <Download size={13} className="mr-1 text-sky-400" /> Export Selected (.xlsx)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedClusterIds(new Set())}
                className="h-7 text-xs text-slate-400 hover:text-white"
              >
                Deselect All
              </Button>
            </div>
          </div>
        )}

        {batchToast && (
          <div className="absolute top-20 right-8 z-50 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs px-4 py-2 rounded-xl flex items-center shadow-2xl animate-in fade-in">
            <CheckCircle size={15} className="mr-2 text-emerald-400" />
            {batchToast}
          </div>
        )}

        {/* 2. BODY CONTENT (TABLE OR CARDS) */}
        <div className="flex-1 p-5 flex flex-col overflow-hidden">
          
          {viewMode === 'table' ? (
            /* FORENSIC TABLE VIEW */
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex-1 min-h-0 overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-sm flex flex-col">
              <Table containerClassName="h-full overflow-y-auto">
                <TableHeader className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur shadow-[0_1px_0_rgba(51,65,85,0.8)]">
                  <TableRow className="border-slate-800/80">
                    <TableHead className="w-10 text-center">
                      <button
                        onClick={toggleSelectAll}
                        className="cursor-pointer text-slate-400 hover:text-white"
                        title="Select all visible clusters"
                      >
                        {selectedClusterIds.size === paginatedGroups.length && paginatedGroups.length > 0 ? (
                          <CheckSquare size={16} className="text-sky-400" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-white" onClick={() => handleSort('grouping_key')}>
                      ENTITY <ArrowUpDown size={10} className="inline ml-1 text-slate-500" />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-white" onClick={() => handleSort('client_name')}>
                      {getColLabel('TRX_TRAN_NUM_BY_TERM_OWN', 'Client Name, ID & Corp')} <ArrowUpDown size={10} className="inline ml-1 text-slate-500" />
                    </TableHead>
                    <TableHead>{getColLabel('TRX_DEB_CRE_IND', 'Direction')}</TableHead>
                    <TableHead className="text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('transaction_count')}>
                      Txns <ArrowUpDown size={10} className="inline ml-1 text-slate-400 dark:text-slate-500" />
                    </TableHead>
                    <TableHead className="text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('avg_amount')}>
                      Avg / Txn <ArrowUpDown size={10} className="inline ml-1 text-slate-400 dark:text-slate-500" />
                    </TableHead>
                    <TableHead className="text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('total_amount')}>
                      {getColLabel('TRX_AMT1', 'Total Amount')} <ArrowUpDown size={10} className="inline ml-1 text-slate-400 dark:text-slate-500" />
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('risk_score')}>
                      {getColLabel('RULE_NAMES', 'Risk Level & Rules')} <ArrowUpDown size={10} className="inline ml-1 text-slate-400 dark:text-slate-500" />
                    </TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="p-12 text-center text-slate-500 italic">
                        No entity clusters match the applied filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedGroups.map((group, idx) => {
                      const isSelected = selectedClusterIds.has(group.id);
                      const isQuickPeekActive = quickPeekCluster?.id === group.id;
                      let riskVariant = 'secondary';
                      if (group.risk_level === 'Critical') riskVariant = 'critical';
                      else if (group.risk_level === 'Elevated') riskVariant = 'elevated';
                      else if (group.risk_level === 'Review Required') riskVariant = 'purple';
                      else if (group.risk_level === 'Normal') riskVariant = 'compliant';

                      const corpDisplay = group.corporation_code || (group.transactions && group.transactions[0]?.corporation_code) || 'Unspecified Corporation';
                      const avgAmount = group.transaction_count > 0 ? group.total_amount / group.transaction_count : 0;

                      // Extract specific matched keywords
                      const matchedKeywords = Array.from(new Set(
                        (group.transactions || []).flatMap(tx => {
                          const m = (tx.memo || '') + ' ' + (tx.recipient_name || '') + ' ' + (tx.recipient_email || '');
                          const matches = m.match(/\b(weed|canna|dispensary|crypto|vape|cbd)\b/gi) || [];
                          return matches.map(k => k.toLowerCase());
                        })
                      ));

                      return (
                        <TableRow
                          key={group.id || idx}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-200 dark:border-slate-800/60 group ${
                            isQuickPeekActive ? 'bg-sky-50 dark:bg-sky-950/30 border-l-2 border-l-sky-500' : isSelected ? 'bg-sky-50/60 dark:bg-sky-950/20' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <TableCell className="text-center py-3">
                            <button
                              type="button"
                              onClick={() => toggleSelectCluster(group.id)}
                              className="cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                              {isSelected ? (
                                <CheckSquare size={16} className="text-sky-600 dark:text-sky-400" />
                              ) : (
                                <Square size={16} className="text-slate-400 dark:text-slate-600" />
                              )}
                            </button>
                          </TableCell>

                          {/* Grouping Key (Clickable directly to Full Triage Deck) */}
                          <TableCell className="font-medium py-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onSelectEntityGroup) onSelectEntityGroup(group.id);
                                if (onNavigate) onNavigate('dashboard');
                              }}
                              className="text-left group/btn cursor-pointer block focus:outline-none"
                              title="Click to open Full Triage Deck"
                            >
                              <div className="font-bold text-sky-700 dark:text-sky-400 group-hover/btn:text-sky-900 dark:group-hover/btn:text-white transition-colors flex items-center space-x-1.5">
                                <span className="truncate max-w-[220px] font-mono text-xs underline decoration-sky-500/30 group-hover/btn:decoration-sky-500 underline-offset-2">
                                  {group.grouping_key}
                                </span>
                                <ArrowUpRight size={13} className="text-sky-600 dark:text-sky-400 opacity-80 group-hover/btn:opacity-100 transition-all shrink-0" />
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-sky-400/80 group-hover/btn:text-sky-700 dark:group-hover/btn:text-sky-300 font-mono mt-0.5">
                                via {getGroupingKeySourceLabel(group.grouping_key_source)}
                              </div>
                            </button>
                          </TableCell>

                          {/* Client Name, ID & Corporation */}
                          <TableCell className="py-3">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[180px]">{group.client_name}</div>
                            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-0.5 flex items-center space-x-1.5">
                              <span>ID: <b className="text-slate-800 dark:text-slate-300">{group.client_id}</b></span>
                              <span>•</span>
                              <span className="text-sky-700 dark:text-sky-300">Corp: <b>{corpDisplay}</b></span>
                            </div>
                          </TableCell>

                          {/* Direction */}
                          <TableCell className="py-3">
                            <Badge
                              variant={group.transaction_direction === 'Incoming' ? 'compliant' : 'cyan'}
                              className="text-[9px] px-2 py-0.5 font-mono"
                            >
                              {group.transaction_direction}
                            </Badge>
                          </TableCell>

                          {/* Tx Count */}
                          <TableCell className="text-right font-mono font-bold text-slate-800 dark:text-slate-200 py-3 text-xs">
                            {group.transaction_count} txns
                          </TableCell>

                          {/* Avg Amount / Txn */}
                          <TableCell className="text-right font-mono text-slate-700 dark:text-slate-300 text-xs py-3">
                            ${avgAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>

                          {/* Total Amount */}
                          <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs py-3">
                            ${group.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>

                          {/* Risk Level & Keyword Badges */}
                          <TableCell className="py-3">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant={riskVariant} className="text-[9px] px-2 py-0.5">
                                  {group.risk_level}
                                </Badge>
                                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
                                  {group.risk_score}
                                </span>
                              </div>

                              {/* Keyword Pills Preview */}
                              {matchedKeywords.length > 0 ? (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {matchedKeywords.map(kw => (
                                    <span
                                      key={kw}
                                      className="px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 rounded text-[9px] font-mono font-bold shadow-xs"
                                    >
                                      "{kw}"
                                    </span>
                                  ))}
                                </div>
                              ) : Array.isArray(group.rule_names) && group.rule_names.length > 0 ? (
                                <div className="text-[10px] text-rose-700 dark:text-rose-400 font-medium truncate max-w-[180px] font-mono">
                                  ⚠️ {group.rule_names.join(', ')}
                                </div>
                              ) : null}
                            </div>
                          </TableCell>

                          {/* Actions: Quick View (Eye) + Full Triage Deck (ChevronRight) */}
                          <TableCell className="text-center py-3">
                            <div className="flex items-center justify-center space-x-1.5">
                              {/* Quick View Button */}
                              <Button
                                type="button"
                                variant={isQuickPeekActive ? 'default' : 'secondary'}
                                size="icon-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setQuickPeekCluster(group);
                                }}
                                className="h-7 w-7 text-sky-600 dark:text-sky-400 hover:text-white cursor-pointer shadow-xs"
                                title="Open Quick View Drawer"
                              >
                                <Eye size={13} />
                              </Button>

                              {/* Full Triage Deck Button */}
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (onSelectEntityGroup) onSelectEntityGroup(group.id);
                                  if (onNavigate) onNavigate('dashboard');
                                }}
                                className="h-7 w-7 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer shadow-xs"
                                title="Launch Full Triage Deck"
                              >
                                <ChevronRight size={14} />
                              </Button>
                            </div>
                          </TableCell>

                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* ENTITY NETWORK CARDS GRID VIEW */
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedGroups.map((group) => {
                  let riskVariant = 'secondary';
                  if (group.risk_level === 'Critical') riskVariant = 'critical';
                  else if (group.risk_level === 'Elevated') riskVariant = 'elevated';
                  else if (group.risk_level === 'Review Required') riskVariant = 'purple';
                  else if (group.risk_level === 'Normal') riskVariant = 'compliant';

                  return (
                    <Card
                      key={group.id}
                      className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-sky-500/50 transition-all p-5 flex flex-col justify-between shadow-sm dark:shadow-xl cursor-pointer"
                      onClick={() => {
                        if (onSelectEntityGroup) onSelectEntityGroup(group.id);
                        if (onNavigate) onNavigate('dashboard');
                      }}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <Badge variant={riskVariant} className="text-[10px]">
                            {group.risk_level} (Score: {group.risk_score})
                          </Badge>
                          <Badge variant="outline" className="font-mono text-[9px]">
                            {group.transaction_direction}
                          </Badge>
                        </div>

                        <div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-sm truncate flex items-center justify-between" title={group.grouping_key}>
                            <span>{group.grouping_key}</span>
                            <ArrowUpRight size={13} className="text-sky-600 dark:text-sky-400" />
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            Key: {getGroupingKeySourceLabel(group.grouping_key_source)}
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 flex justify-between text-xs font-mono">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Total Volume</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              ${group.total_amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Transactions</span>
                            <span className="text-slate-900 dark:text-white font-bold">{group.transaction_count} txns</span>
                          </div>
                        </div>

                        {group.rule_names && group.rule_names.length > 0 && (
                          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-mono line-clamp-1">
                            ⚠️ {group.rule_names.join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex justify-between items-center text-xs">
                        <span className="text-slate-500 dark:text-slate-400 truncate max-w-[140px] text-[11px]">
                          {group.client_name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectEntityGroup) onSelectEntityGroup(group.id);
                            if (onNavigate) onNavigate('dashboard');
                          }}
                          className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-white h-7 px-2"
                        >
                          Triage <ChevronRight size={12} className="ml-1" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. PAGINATION FOOTER */}
          <div className="mt-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-400 gap-2 shrink-0">
            <div>
              Showing <b className="text-slate-900 dark:text-white">{sortedGroups.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</b> to <b className="text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, sortedGroups.length)}</b> of <b className="text-slate-900 dark:text-white">{sortedGroups.length}</b> customer entities
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span>Per Page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-xs cursor-pointer focus:outline-none"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-7 w-7 border-slate-300 dark:border-slate-800"
                >
                  <ChevronLeft size={14} />
                </Button>
                <span className="font-mono text-xs">
                  Page <b className="text-slate-900 dark:text-white">{currentPage}</b> of <b className="text-slate-900 dark:text-white">{totalPages}</b>
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7 border-slate-300 dark:border-slate-800"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. SIGNATURE QUICK-PEEK FORENSIC DRAWER                                   */}
      {/* ========================================================================= */}
      {quickPeekCluster && (
        <div className="w-96 md:w-[460px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-40 animate-in slide-in-from-right-4 shrink-0">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-900/60">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge
                  variant={quickPeekCluster.risk_level === 'Critical' ? 'critical' : 'elevated'}
                  className="text-[10px]"
                >
                  {quickPeekCluster.risk_level} • Score {quickPeekCluster.risk_score}
                </Badge>
                <Badge variant="cyan" className="font-mono text-[9px]">
                  {quickPeekCluster.transaction_direction}
                </Badge>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-mono truncate max-w-[340px]" title={quickPeekCluster.grouping_key}>
                {quickPeekCluster.grouping_key}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Key Source: <b className="text-sky-600 dark:text-sky-400 font-mono">{getGroupingKeySourceLabel(quickPeekCluster.grouping_key_source)}</b>
              </p>
            </div>

            <button
              onClick={() => setQuickPeekCluster(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Aggregated Volume</span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ${quickPeekCluster.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Transaction Count</span>
                <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {quickPeekCluster.transaction_count} txns
                </span>
              </div>
            </div>

            {/* Corporate Profile Card */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center">
                <Building2 size={14} className="mr-1.5 text-sky-600 dark:text-sky-400" />
                Corporate & Client Linkage
              </div>
              <div className="text-slate-700 dark:text-slate-300">{quickPeekCluster.client_name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Client ID: <b className="text-slate-900 dark:text-white">{quickPeekCluster.client_id}</b> • Corp: <b className="text-sky-700 dark:text-sky-300">{quickPeekCluster.corporation_code || 'N/A'}</b>
              </div>
            </div>

            {/* Triggered Rule Breaches */}
            {quickPeekCluster.rule_names && quickPeekCluster.rule_names.length > 0 && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-2">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block flex items-center">
                  <ShieldAlert size={14} className="mr-1.5 text-rose-600 dark:text-rose-400" />
                  Active Rule Triggers ({quickPeekCluster.rule_names.length})
                </span>
                <div className="space-y-1">
                  {quickPeekCluster.rule_names.map((rule, idx) => (
                    <div key={idx} className="text-xs text-rose-800 dark:text-rose-200 font-mono flex items-center space-x-1.5">
                      <span className="text-rose-500 dark:text-rose-400">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Transactions Ledger Sample */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Top Transactions ({quickPeekCluster.transactions?.length || 0})
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Forensic Preview</span>
              </div>

              <div className="space-y-2">
                {(quickPeekCluster.transactions || []).slice(0, 4).map((tx, idx) => {
                  const hasKeyword = /weed|canna|dispensary|crypto/i.test(tx.memo || '') || /weed|canna/i.test(tx.recipient_name || '');
                  return (
                    <div
                      key={tx.id || idx}
                      className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-900 dark:text-white font-semibold">{tx.ref || tx.reference_number}</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${tx.amount.toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {tx.sender || tx.sender_name} &rarr; {tx.recipientName || tx.recipient_name}
                      </div>
                      {tx.memo && (
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-1 pt-0.5">
                          <span>Memo:</span>
                          <span className={hasKeyword ? 'text-rose-700 dark:text-rose-400 font-bold bg-rose-100 dark:bg-rose-950/60 px-1 rounded' : 'text-slate-700 dark:text-slate-300'}>
                            {tx.memo}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickPeekCluster(null)}
              className="flex-1 text-xs"
            >
              Dismiss
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (onSelectEntityGroup) onSelectEntityGroup(quickPeekCluster.id);
                if (onNavigate) onNavigate('dashboard');
              }}
              className="flex-1 text-xs font-bold"
            >
              <ExternalLink size={13} className="mr-1.5" />
              Full Triage Deck
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClusterExplorerView;
