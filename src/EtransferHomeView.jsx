import React, { useState } from 'react';
import {
  ShieldAlert,
  Network,
  Zap,
  FileBarChart,
  List as ListIcon,
  Upload,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  ArrowRight,
  Database,
  Building2,
  Lock,
  Search,
  DollarSign,
  Activity,
  Layers,
  ChevronRight,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { parseExcelFile } from './utils/excelDataLoader';

const EtransferHomeView = ({
  dataState,
  onNavigate,
  onLoadSampleData,
  onDataIngested
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const groups = dataState?.groupedEntities || [];
  const totalVolume = groups.reduce((acc, g) => acc + g.total_amount, 0);
  const totalTxns = dataState?.totalRecords || groups.reduce((acc, g) => acc + g.transaction_count, 0);
  const criticalGroups = groups.filter(g => g.risk_level === 'Critical');
  const elevatedGroups = groups.filter(g => g.risk_level === 'Elevated');

  // Breakdown by Corporation (Strictly CORPORATION_CODE)
  const corpStats = React.useMemo(() => {
    const map = new Map();
    groups.forEach(g => {
      const corp = g.corporation_code || (g.transactions && g.transactions[0]?.corporation_code) || 'Unspecified Corporation';
      if (!map.has(corp)) {
        map.set(corp, { name: corp, volume: 0, count: 0, entities: 0 });
      }
      const item = map.get(corp);
      item.volume += g.total_amount;
      item.count += g.transaction_count;
      item.entities += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.volume - a.volume);
  }, [groups]);

  // Keyword hits
  const keywordHits = React.useMemo(() => {
    let weedHits = 0;
    let cannaHits = 0;
    let cryptoHits = 0;
    groups.forEach(g => {
      g.transactions.forEach(tx => {
        const text = `${tx.memo || ''} ${tx.sec_answer || ''} ${tx.recipient_name || ''} ${tx.sender_name || ''}`.toLowerCase();
        if (text.includes('weed')) weedHits++;
        if (text.includes('canna')) cannaHits++;
        if (text.includes('crypto') || text.includes('btc')) cryptoHits++;
      });
    });
    return { weedHits, cannaHits, cryptoHits };
  }, [groups]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsProcessing(true);
    setUploadError('');

    try {
      const buffer = await file.arrayBuffer();
      const result = await parseExcelFile(buffer);
      if (onDataIngested) onDataIngested(result);
      onNavigate('explorer');
    } catch (err) {
      setUploadError(err.message || 'Error processing Excel file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex h-screen bg-[#0d0f14] text-gray-200 font-sans overflow-hidden">

      {/* ========================================================================= */}
      {/* 0. GLOBAL LEFT NAVIGATION RAIL WITH LEON BRANDING                          */}
      {/* ========================================================================= */}
      <nav className="w-20 bg-[#12141c] border-r border-gray-800/80 flex flex-col items-center py-4 shrink-0 z-30 shadow-2xl">
        
        {/* BRAND LOGO: LEON */}
        <button
          onClick={() => onNavigate('home')}
          className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-xl flex flex-col items-center justify-center text-white font-extrabold mb-8 shadow-lg shadow-indigo-900/50 hover:scale-105 transition-all cursor-pointer border border-indigo-400/30 group"
          title="LEON - Fraud Prevention & AML Home"
        >
          <span className="text-[11px] tracking-tighter leading-none text-indigo-200 font-black group-hover:text-white">LEON</span>
          <span className="text-[7px] tracking-widest text-indigo-300 uppercase font-mono mt-0.5">AML</span>
        </button>

        <div className="flex flex-col space-y-6 w-full items-center">
          
          {/* HOME (ACTIVE) */}
          <button
            onClick={() => onNavigate('home')}
            className="flex justify-center w-full group relative cursor-pointer"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r"></div>
            <div className="p-2.5 rounded-xl bg-indigo-900/40 text-indigo-400 border border-indigo-700/50">
              <Activity size={20} />
            </div>
            <span className="absolute left-16 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Executive Command Center
            </span>
          </button>

          {/* Cluster Explorer */}
          <button
            onClick={() => onNavigate('explorer')}
            className="flex justify-center w-full group relative text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <div className="p-2.5 rounded-xl hover:bg-gray-800">
              <Network size={20} />
            </div>
            <span className="absolute left-16 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
              Cluster & Entity Explorer
            </span>
          </button>

          {/* Rule Library */}
          <button
            onClick={() => onNavigate('rules')}
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
            onClick={() => onNavigate('reports')}
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
            onClick={() => onNavigate('watchlists')}
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
          <div className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-xs font-bold text-indigo-300 shadow">
            LM
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0d0f14]">

        {/* TOP HEADER */}
        <header className="bg-[#14171e] border-b border-gray-800 p-5 flex justify-between items-center shrink-0 z-20">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-3 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck size={26} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white tracking-tight">LEON</h1>
                <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded text-[10px] font-bold uppercase tracking-widest">
                  Fraud Prevention & AML
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Executive Command Center • Focused ETRANSFER Risk & Cluster Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('explorer')}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Network size={15} />
              <span>Launch Cluster Explorer</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </header>

        {/* BODY CONTENT */}
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">

          {/* 1. EXECUTIVE KPI SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Analyzed ETRANSFER Volume */}
            <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-gray-700 transition-all shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Analyzed Volume</span>
                  <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-emerald-950/60 border border-emerald-900/60 rounded-xl text-emerald-400">
                  <DollarSign size={22} />
                </div>
              </div>
              <div className="mt-4 text-[11px] text-gray-400 flex items-center space-x-2">
                <span className="text-emerald-400 font-bold flex items-center"><TrendingUp size={12} className="mr-1" /> Active Dataset</span>
                <span>•</span>
                <span>Worksheet: <b className="text-gray-200">Full_Analysis</b></span>
              </div>
            </div>

            {/* KPI 2: Total Records Ingested */}
            <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-gray-700 transition-all shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Ingested Transactions</span>
                  <span className="text-3xl font-black text-indigo-300 font-mono tracking-tight">
                    {totalTxns.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-indigo-950/60 border border-indigo-900/60 rounded-xl text-indigo-400">
                  <FileSpreadsheet size={22} />
                </div>
              </div>
              <div className="mt-4 text-[11px] text-gray-400 flex items-center justify-between">
                <span>Normalized & Deduplicated</span>
                <span className="text-indigo-400 font-mono font-bold">100k Capacity</span>
              </div>
            </div>

            {/* KPI 3: Customer Entities Grouped */}
            <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-gray-700 transition-all shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Customer Entity Clusters</span>
                  <span className="text-3xl font-black text-white font-mono tracking-tight">
                    {groups.length}
                  </span>
                </div>
                <div className="p-3 bg-purple-950/60 border border-purple-900/60 rounded-xl text-purple-400">
                  <Network size={22} />
                </div>
              </div>
              <div className="mt-4 text-[11px] text-gray-400 flex items-center space-x-2">
                <span className="text-purple-400 font-bold">{corpStats.length} Corporations</span>
                <span>•</span>
                <span>Aggregated Keys</span>
              </div>
            </div>

            {/* KPI 4: Critical Risk Clusters */}
            <div className="bg-[#12141c] border border-gray-800/80 p-5 rounded-2xl relative overflow-hidden group hover:border-gray-700 transition-all shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Critical Risk Entities</span>
                  <span className="text-3xl font-black text-red-400 font-mono tracking-tight flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                    {criticalGroups.length}
                  </span>
                </div>
                <div className="p-3 bg-red-950/60 border border-red-900/60 rounded-xl text-red-400">
                  <ShieldAlert size={22} />
                </div>
              </div>
              <div className="mt-4 text-[11px] text-gray-400 flex items-center justify-between">
                <span>Elevated: <b className="text-amber-400">{elevatedGroups.length}</b></span>
                <button
                  onClick={() => onNavigate('explorer')}
                  className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                >
                  Review Critical &rarr;
                </button>
              </div>
            </div>

          </div>

          {/* 2. FILE INGESTION DROPZONE & DATASET STATUS BAR */}
          <div className="bg-[#12141c] border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              
              {/* Left: Ingestion Status */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Live ETRANSFER Analysis File Ingestion</h2>
                </div>
                <p className="text-xs text-gray-400 max-w-2xl">
                  LEON processes large Excel spreadsheets (up to 100,000 rows) reading directly from the <b className="text-emerald-400 font-mono">Full_Analysis</b> worksheet. All 30 SQL technical fields are parsed, normalized, and mapped to customer entity clusters in real-time.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="px-3 py-1 bg-[#181b24] border border-gray-700/80 rounded-lg text-xs text-gray-300 font-mono">
                    📄 Active File: <b className="text-indigo-400">etransfer_analysis_2026.xlsx</b>
                  </span>
                  <span className="px-3 py-1 bg-[#181b24] border border-gray-700/80 rounded-lg text-xs text-gray-300 font-mono">
                    📊 Sheet: <b className="text-emerald-400">Full_Analysis</b>
                  </span>
                  <span className="px-3 py-1 bg-[#181b24] border border-gray-700/80 rounded-lg text-xs text-gray-300 font-mono">
                    🛡️ Entity Levels: <b className="text-purple-400">Client & Customer</b>
                  </span>
                </div>
              </div>

              {/* Right: Upload Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                
                {/* Drag & Drop File Input */}
                <label className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
                  <Upload size={16} />
                  <span>Ingest New Excel File</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  />
                </label>

                {/* Reload Demo Data */}
                <button
                  onClick={onLoadSampleData}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-3 bg-[#181b24] hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-bold rounded-xl border border-gray-700 transition-all cursor-pointer"
                >
                  <RefreshCw size={15} className="text-emerald-400" />
                  <span>Load Demo File</span>
                </button>

              </div>
            </div>

            {uploadError && (
              <div className="mt-4 p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs flex items-center">
                <AlertTriangle size={16} className="mr-2 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* 3. CORPORATION BREAKDOWN & KEYWORD RISKS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Corporation Portfolio Breakdown */}
            <div className="lg:col-span-2 bg-[#12141c] border border-gray-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center">
                  <Building2 size={16} className="mr-2 text-indigo-400" />
                  Corporation Portfolio Breakdown
                </h3>
                <span className="text-xs text-gray-500">Decoded from CORPORATION_CODE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {corpStats.map(corp => (
                  <div key={corp.name} className="bg-[#181b24] border border-gray-800 p-4 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-indigo-300 font-mono truncate">{corp.name}</div>
                    <div className="text-xl font-black text-white font-mono">
                      ${corp.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[11px] text-gray-400 flex justify-between">
                      <span>{corp.entities} Entity Groups</span>
                      <span className="font-mono">{corp.count} txns</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword Risk Counters */}
            <div className="bg-[#12141c] border border-gray-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center">
                <AlertTriangle size={16} className="mr-2 text-red-400" />
                High Risk Keyword Triggers
              </h3>

              <div className="space-y-3">
                <div className="bg-[#181b24] border border-red-950 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div>
                      <div className="text-xs font-bold text-white">"weed" Keyword Hits</div>
                      <div className="text-[10px] text-gray-500">Memos & Sec. Answers</div>
                    </div>
                  </div>
                  <span className="text-base font-bold font-mono text-red-400">{keywordHits.weedHits}</span>
                </div>

                <div className="bg-[#181b24] border border-amber-950 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <div>
                      <div className="text-xs font-bold text-white">"canna" Keyword Hits</div>
                      <div className="text-[10px] text-gray-500">Cannabis dispensaries</div>
                    </div>
                  </div>
                  <span className="text-base font-bold font-mono text-amber-400">{keywordHits.cannaHits}</span>
                </div>

                <div className="bg-[#181b24] border border-purple-950 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                    <div>
                      <div className="text-xs font-bold text-white">"crypto / btc" Keywords</div>
                      <div className="text-[10px] text-gray-500">Virtual asset exchanges</div>
                    </div>
                  </div>
                  <span className="text-base font-bold font-mono text-purple-400">{keywordHits.cryptoHits}</span>
                </div>
              </div>
            </div>

          </div>

          {/* 4. QUICK ACTION LAUNCHPAD */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              LEON Platform Core Modules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Module 1: Cluster & Entity Explorer */}
              <button
                onClick={() => onNavigate('explorer')}
                className="bg-[#12141c] hover:bg-[#181b24] border border-gray-800 hover:border-indigo-500/50 p-5 rounded-2xl text-left transition-all group cursor-pointer shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Network size={22} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Cluster & Entity Explorer
                  </h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Filter entity clusters by client, rule name, direction, and grouping key source. Multi-dimensional risk analysis.
                  </p>
                </div>
                <div className="mt-5 text-xs font-bold text-indigo-400 flex items-center">
                  <span>Open Explorer</span>
                  <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Module 2: Rule Management */}
              <button
                onClick={() => onNavigate('rules')}
                className="bg-[#12141c] hover:bg-[#181b24] border border-gray-800 hover:border-indigo-500/50 p-5 rounded-2xl text-left transition-all group cursor-pointer shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-amber-950/80 text-amber-400 border border-amber-800/60 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Zap size={22} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    Rule Management Library
                  </h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Configure ETRANSFER automated detection rules, velocity thresholds, keyword dictionaries, and alert scoring logic.
                  </p>
                </div>
                <div className="mt-5 text-xs font-bold text-amber-400 flex items-center">
                  <span>Manage Rules</span>
                  <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Module 3: Reports & Analytics */}
              <button
                onClick={() => onNavigate('reports')}
                className="bg-[#12141c] hover:bg-[#181b24] border border-gray-800 hover:border-indigo-500/50 p-5 rounded-2xl text-left transition-all group cursor-pointer shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <FileBarChart size={22} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Reports & STR Analytics
                  </h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Generate regulatory compliance summaries, track filed STR reports, and export executive audit packages.
                  </p>
                </div>
                <div className="mt-5 text-xs font-bold text-emerald-400 flex items-center">
                  <span>View Reports</span>
                  <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Module 4: Watchlists & Sanctions */}
              <button
                onClick={() => onNavigate('watchlists')}
                className="bg-[#12141c] hover:bg-[#181b24] border border-gray-800 hover:border-indigo-500/50 p-5 rounded-2xl text-left transition-all group cursor-pointer shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-purple-950/80 text-purple-400 border border-purple-800/60 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <ListIcon size={22} />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    Watchlists & Blacklists
                  </h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                    Maintain high-risk recipient emails, blacklisted merchant domains, and flagged account identifiers.
                  </p>
                </div>
                <div className="mt-5 text-xs font-bold text-purple-400 flex items-center">
                  <span>Manage Watchlists</span>
                  <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EtransferHomeView;
