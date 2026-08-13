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
  Activity
} from 'lucide-react';
import { REQUIRED_COLUMNS } from './utils/etransferProcessor';

const ClusterExplorerView = ({
  dataState,
  onNavigate,
  onSelectEntityGroup,
  onOpenUploadModal
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState('ALL');
  const [selectedRule, setSelectedRule] = useState('ALL');
  const [selectedDirection, setSelectedDirection] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');

  // Sorting & Pagination States (Default: Risk Level & Rules highest to lowest)
  const [sortField, setSortField] = useState('risk_score'); 
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const groups = dataState?.groupedEntities || [];

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

  // Extract unique rule names for filter dropdown (Name ONLY, excluding numeric codes)
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
      g.transactions.forEach(tx => {
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

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      // Client filter
      if (selectedClient !== 'ALL') {
        if (g.client_name !== selectedClient && g.client_id !== selectedClient) return false;
      }
      // Rule filter (Name ONLY)
      if (selectedRule !== 'ALL') {
        const hasRuleInGroup = (g.rule_names || []).some(r => String(r).includes(selectedRule));
        const hasRuleInTx = g.transactions.some(tx => (tx.rule_names || []).some(r => String(r).includes(selectedRule)));
        if (!hasRuleInGroup && !hasRuleInTx) return false;
      }
      // Direction filter
      if (selectedDirection !== 'ALL') {
        if (g.transaction_direction !== selectedDirection) return false;
      }
      // Grouping source filter
      if (selectedSource !== 'ALL') {
        if (g.grouping_key_source !== selectedSource) return false;
      }
      // Risk level filter
      if (selectedRisk !== 'ALL') {
        if (g.risk_level !== selectedRisk) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mKey = (g.grouping_key || '').toLowerCase().includes(q);
        const mClient = (g.client_name || '').toLowerCase().includes(q);
        const mCust = (g.customer_id || '').toLowerCase().includes(q);
        const mAcct = (g.customer_account || '').toLowerCase().includes(q);
        const mRules = (g.rule_names || []).some(r => String(r).toLowerCase().includes(q));
        if (!mKey && !mClient && !mCust && !mAcct && !mRules) return false;
      }
      return true;
    });
  }, [groups, selectedClient, selectedRule, selectedDirection, selectedSource, selectedRisk, searchQuery]);

  // Sorted Groups
  const sortedGroups = useMemo(() => {
    return [...filteredGroups].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'risk_score' || sortField === 'total_amount' || sortField === 'transaction_count') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
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
    setSearchQuery('');
    setSelectedClient('ALL');
    setSelectedRule('ALL');
    setSelectedDirection('ALL');
    setSelectedSource('ALL');
    setSelectedRisk('ALL');
    setCurrentPage(1);
  };

  // Summary Metrics
  const filteredVolume = filteredGroups.reduce((acc, g) => acc + g.total_amount, 0);
  const filteredTxCount = filteredGroups.reduce((acc, g) => acc + g.transaction_count, 0);
  const criticalCount = filteredGroups.filter(g => g.risk_level === 'Critical').length;

  return (
    <div className="flex h-screen bg-[#121212] text-gray-300 font-sans overflow-hidden">

      {/* ========================================================================= */}
      {/* 0. GLOBAL LEFT NAVIGATION RAIL WITH LEON BRANDING                          */}
      {/* ========================================================================= */}
      <nav className="w-20 bg-[#12141c] border-r border-gray-800/80 flex flex-col items-center py-4 shrink-0 z-30 shadow-2xl">
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-xl flex flex-col items-center justify-center text-white font-extrabold mb-8 shadow-lg shadow-indigo-900/50 hover:scale-105 transition-all cursor-pointer border border-indigo-400/30 group"
          title="LEON - Fraud Prevention & AML Home"
        >
          <span className="text-[11px] tracking-tighter leading-none text-indigo-200 font-black group-hover:text-white">LEON</span>
          <span className="text-[7px] tracking-widest text-indigo-300 uppercase font-mono mt-0.5">AML</span>
        </button>

        <div className="flex flex-col space-y-6 w-full items-center">
          
          {/* HOME */}
          <button
            onClick={() => onNavigate && onNavigate('home')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <div className="p-2.5 rounded-xl hover:bg-gray-800">
              <Activity size={20} />
            </div>
            <span className="absolute left-16 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Executive Command Center
            </span>
          </button>

          {/* Cluster Explorer (ACTIVE) */}
          <button
            onClick={() => onNavigate && onNavigate('explorer')}
            className="flex justify-center w-full group relative cursor-pointer"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r"></div>
            <div className="p-2.5 rounded-xl bg-indigo-900/40 text-indigo-400 border border-indigo-700/50">
              <Network size={20} />
            </div>
            <span className="absolute left-16 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Cluster & Entity Explorer
            </span>
          </button>

          {/* Rule Library */}
          <button
            onClick={() => onNavigate && onNavigate('rules')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <div className="p-2.5 rounded-xl hover:bg-gray-800">
              <Zap size={20} />
            </div>
            <span className="absolute left-16 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Rule Management
            </span>
          </button>

          {/* Reports & Analytics */}
          <button
            onClick={() => onNavigate && onNavigate('reports')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <div className="p-2.5 rounded-xl hover:bg-gray-800">
              <FileBarChart size={20} />
            </div>
            <span className="absolute left-16 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Reports & Analytics
            </span>
          </button>

          {/* Watchlists */}
          <button
            onClick={() => onNavigate && onNavigate('watchlists')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <div className="p-2.5 rounded-xl hover:bg-gray-800">
              <ListIcon size={20} />
            </div>
            <span className="absolute left-16 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Watchlists & Sanctions
            </span>
          </button>
        </div>

        <div className="mt-auto mb-4">
          <button
            onClick={() => alert('System Settings')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            <Settings size={20} />
          </button>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
          LM
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0d0f14]">

        {/* 1. TOP HEADER */}
        <header className="bg-[#14171e] border-b border-gray-800 p-4 flex justify-between items-center shrink-0 z-20">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600/20 border border-indigo-500/40 p-2.5 rounded-xl text-indigo-400">
              <Network size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Cluster & Entity Explorer</h1>
              <div className="text-xs text-gray-400 flex items-center space-x-2">
                <span>Multi-dimensional aggregation view for <b className="text-indigo-400">ETRANSFER</b> analysis</span>
                <span>•</span>
                <span>Worksheet: <b className="text-emerald-400 font-mono">Full_Analysis</b></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenUploadModal}
              className="flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <Upload size={14} />
              <span>Ingest New Excel File</span>
            </button>
          </div>
        </header>

        {/* 2. FILTER & METRICS BAR */}
        <div className="p-4 bg-[#12141c] border-b border-gray-800/80 shrink-0 space-y-3">
          
          {/* Top Row KPI Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#181b24] border border-gray-800 p-3 rounded-xl">
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Filtered Entities</span>
              <span className="text-white font-mono font-bold text-base">{filteredGroups.length} <span className="text-xs font-normal text-gray-500">/ {groups.length}</span></span>
            </div>
            <div className="bg-[#181b24] border border-gray-800 p-3 rounded-xl">
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Filtered Volume</span>
              <span className="text-emerald-400 font-mono font-bold text-base">${filteredVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-[#181b24] border border-gray-800 p-3 rounded-xl">
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Total Transactions</span>
              <span className="text-indigo-300 font-mono font-bold text-base">{filteredTxCount.toLocaleString()} txns</span>
            </div>
            <div className="bg-[#181b24] border border-gray-800 p-3 rounded-xl">
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Critical Risk Groups</span>
              <span className="text-red-400 font-mono font-bold text-base flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span> {criticalCount} Entities
              </span>
            </div>
          </div>

          {/* Filter Toolbar Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search size={14} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search by entity key, client, customer ID, account, rule..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-[#181b24] border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Client Filter Dropdown */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1">Client / Corp</label>
              <select
                value={selectedClient}
                onChange={(e) => { setSelectedClient(e.target.value); setCurrentPage(1); }}
                className="bg-[#181b24] text-gray-200 border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-indigo-500 max-w-[170px] truncate"
              >
                <option value="ALL" className="bg-[#181b24] text-gray-200 py-1">All Clients ({uniqueClients.length})</option>
                {uniqueClients.map(c => (
                  <option key={c.name} value={c.name} className="bg-[#181b24] text-gray-200 py-1">{c.name}</option>
                ))}
              </select>
            </div>

            {/* Rule ID Filter Dropdown */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1">Rule Trigger</label>
              <select
                value={selectedRule}
                onChange={(e) => { setSelectedRule(e.target.value); setCurrentPage(1); }}
                className="bg-[#181b24] text-gray-200 border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-indigo-500 max-w-[180px] truncate"
              >
                <option value="ALL" className="bg-[#181b24] text-gray-200 py-1">All Rules ({uniqueRules.length})</option>
                {uniqueRules.map(r => (
                  <option key={r} value={r} className="bg-[#181b24] text-gray-200 py-1">{r}</option>
                ))}
              </select>
            </div>

            {/* Direction Filter Dropdown */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1">Direction</label>
              <select
                value={selectedDirection}
                onChange={(e) => { setSelectedDirection(e.target.value); setCurrentPage(1); }}
                className="bg-[#181b24] text-gray-200 border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL" className="bg-[#181b24] text-gray-200 py-1">All Directions</option>
                <option value="Incoming" className="bg-[#181b24] text-emerald-400 py-1">Incoming (D)</option>
                <option value="Outgoing" className="bg-[#181b24] text-blue-400 py-1">Outgoing (C)</option>
                <option value="Unknown" className="bg-[#181b24] text-purple-400 py-1">Unknown</option>
              </select>
            </div>

            {/* Grouping Source Filter Dropdown */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1">Grouping Field</label>
              <select
                value={selectedSource}
                onChange={(e) => { setSelectedSource(e.target.value); setCurrentPage(1); }}
                className="bg-[#181b24] text-gray-200 border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL" className="bg-[#181b24] text-gray-200 py-1">All Sources</option>
                <option value="RECIPIENT_EMAIL" className="bg-[#181b24] text-gray-200 py-1">RECIPIENT_EMAIL</option>
                <option value="RECIPIENT_NAME" className="bg-[#181b24] text-gray-200 py-1">RECIPIENT_NAME</option>
                <option value="SENDER_EMAIL" className="bg-[#181b24] text-gray-200 py-1">SENDER_EMAIL</option>
                <option value="TRX_OPERATOR_CODE" className="bg-[#181b24] text-gray-200 py-1">TRX_OPERATOR_CODE</option>
              </select>
            </div>

            {/* Risk Level Filter Dropdown */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1">Risk Level</label>
              <select
                value={selectedRisk}
                onChange={(e) => { setSelectedRisk(e.target.value); setCurrentPage(1); }}
                className="bg-[#181b24] text-gray-200 border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL" className="bg-[#181b24] text-gray-200 py-1">All Risk Levels</option>
                <option value="Critical" className="bg-[#181b24] text-red-400 py-1">Critical</option>
                <option value="Elevated" className="bg-[#181b24] text-amber-400 py-1">Elevated</option>
                <option value="Review Required" className="bg-[#181b24] text-purple-400 py-1">Review Required</option>
                <option value="Normal" className="bg-[#181b24] text-gray-300 py-1">Normal</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {(selectedClient !== 'ALL' || selectedRule !== 'ALL' || selectedDirection !== 'ALL' || selectedSource !== 'ALL' || selectedRisk !== 'ALL' || searchQuery) && (
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg transition-colors flex items-center cursor-pointer h-[34px] mt-auto"
                >
                  <X size={13} className="mr-1" /> Clear Filters
                </button>
              </div>
            )}

          </div>
        </div>

        {/* 3. MASTER ENTITY CLUSTERS DATA TABLE */}
        <div className="flex-1 p-5 flex flex-col overflow-hidden">
          <div className="bg-[#12141c] border border-gray-800 rounded-xl flex-1 overflow-auto shadow-2xl">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#181b24] text-[10px] uppercase text-gray-400 sticky top-0 border-b border-gray-800 tracking-wider font-bold z-10">
                <tr>
                  <th className="p-3.5 cursor-pointer hover:text-white" onClick={() => handleSort('grouping_key')}>
                    Entity Grouping Key & Source <ArrowUpDown size={10} className="inline ml-1" />
                  </th>
                  <th className="p-3.5 cursor-pointer hover:text-white" onClick={() => handleSort('client_name')}>
                    Client Name & ID <ArrowUpDown size={10} className="inline ml-1" />
                  </th>
                  <th className="p-3.5 cursor-pointer hover:text-white" onClick={() => handleSort('corporation_code')}>
                    Corporation <ArrowUpDown size={10} className="inline ml-1" />
                  </th>
                  <th className="p-3.5">Direction</th>
                  <th className="p-3.5 text-right cursor-pointer hover:text-white" onClick={() => handleSort('transaction_count')}>
                    Txns <ArrowUpDown size={10} className="inline ml-1" />
                  </th>
                  <th className="p-3.5 text-right cursor-pointer hover:text-white" onClick={() => handleSort('total_amount')}>
                    Total Amount <ArrowUpDown size={10} className="inline ml-1" />
                  </th>
                  <th className="p-3.5 cursor-pointer hover:text-white" onClick={() => handleSort('risk_score')}>
                    Risk Level & Rules <ArrowUpDown size={10} className="inline ml-1" />
                  </th>
                  <th className="p-3.5 text-center">Triage Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {paginatedGroups.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-500 italic">
                      No entity clusters match the applied filters.
                    </td>
                  </tr>
                ) : (
                  paginatedGroups.map((group, idx) => {
                    let riskBadgeStyle = 'bg-gray-800 text-gray-300 border-gray-700';
                    if (group.risk_level === 'Critical') riskBadgeStyle = 'bg-red-950/80 text-red-300 border-red-800';
                    else if (group.risk_level === 'Elevated') riskBadgeStyle = 'bg-amber-950/80 text-amber-300 border-amber-800';
                    else if (group.risk_level === 'Review Required') riskBadgeStyle = 'bg-purple-950/80 text-purple-300 border-purple-800';

                    const corpDisplay = group.corporation_code || (group.transactions && group.transactions[0]?.corporation_code) || 'Unspecified Corporation';

                    return (
                      <tr key={group.id || idx} className="hover:bg-indigo-950/20 transition-colors group">
                        
                        {/* Grouping Key */}
                        <td className="p-3.5 font-medium text-white">
                          <div className="font-bold text-gray-100 flex items-center">
                            <span className="truncate max-w-[220px]">{group.grouping_key}</span>
                          </div>
                          <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                            via {group.grouping_key_source}
                          </div>
                        </td>

                        {/* Client */}
                        <td className="p-3.5 text-gray-300">
                          <div className="font-semibold text-gray-200">{group.client_name}</div>
                          <div className="text-[10px] text-gray-500 font-mono">ID: {group.client_id}</div>
                        </td>

                        {/* Corporation */}
                        <td className="p-3.5 text-gray-300 font-mono text-[11px]">
                          <div className="font-semibold text-indigo-300">{corpDisplay}</div>
                        </td>

                        {/* Direction */}
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${group.transaction_direction === 'Incoming' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-blue-950 text-blue-400 border border-blue-900'}`}>
                            {group.transaction_direction}
                          </span>
                        </td>

                        {/* Tx Count */}
                        <td className="p-3.5 text-right font-mono font-bold text-gray-200">
                          {group.transaction_count} txns
                        </td>

                        {/* Total Amount */}
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-400 text-sm">
                          ${group.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Risk Level & Rules */}
                        <td className="p-3.5">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[9px] px-2 py-0.5 rounded border font-semibold ${riskBadgeStyle}`}>
                              {group.risk_level}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              (Score: {group.risk_score})
                            </span>
                          </div>
                          {group.rule_names && group.rule_names.length > 0 && (
                            <div className="text-[10px] text-red-400 font-medium truncate max-w-[180px] mt-0.5">
                              ⚠️ {group.rule_names.join(', ')}
                            </div>
                          )}
                        </td>

                        {/* Action: Investigate Entity */}
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              if (onSelectEntityGroup) onSelectEntityGroup(group.id);
                              if (onNavigate) onNavigate('dashboard');
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center mx-auto cursor-pointer"
                          >
                            <span>Investigate Entity</span>
                            <ChevronRight size={14} className="ml-1" />
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 4. PAGINATION FOOTER */}
          <div className="mt-3 bg-[#12141c] border border-gray-800 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-2 shrink-0">
            <div>
              Showing <b className="text-white">{sortedGroups.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</b> to <b className="text-white">{Math.min(currentPage * pageSize, sortedGroups.length)}</b> of <b className="text-white">{sortedGroups.length}</b> customer entities
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span>Per Page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="bg-[#181b24] text-white border border-gray-700 rounded px-2 py-1 text-xs cursor-pointer focus:outline-none"
                >
                  <option value={15} className="bg-[#181b24] text-white">15</option>
                  <option value={25} className="bg-[#181b24] text-white">25</option>
                  <option value={50} className="bg-[#181b24] text-white">50</option>
                  <option value={100} className="bg-[#181b24] text-white">100</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded bg-[#181b24] border border-gray-700 disabled:opacity-40 hover:text-white cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-mono">Page <b className="text-white">{currentPage}</b> of <b className="text-white">{totalPages}</b></span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded bg-[#181b24] border border-gray-700 disabled:opacity-40 hover:text-white cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClusterExplorerView;
