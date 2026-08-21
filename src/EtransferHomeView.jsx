import React, { useState, useMemo } from 'react';
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
  BarChart3,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
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
  const totalVolume = groups.reduce((acc, g) => acc + (g.total_amount || 0), 0);
  const totalTxns = dataState?.totalRecords || groups.reduce((acc, g) => acc + (g.transaction_count || 0), 0);
  const criticalGroups = groups.filter(g => g.risk_level === 'Critical');
  const elevatedGroups = groups.filter(g => g.risk_level === 'Elevated');

  // Breakdown by Corporation (Strictly CORPORATION_CODE)
  const corpStats = useMemo(() => {
    const map = new Map();
    groups.forEach(g => {
      const corp = g.corporation_code || (g.transactions && g.transactions[0]?.corporation_code) || 'Unspecified Corporation';
      if (!map.has(corp)) {
        map.set(corp, { name: corp, volume: 0, count: 0, entities: 0 });
      }
      const item = map.get(corp);
      item.volume += g.total_amount || 0;
      item.count += g.transaction_count || 0;
      item.entities += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.volume - a.volume);
  }, [groups]);

  // Flatten all transactions for analytical calculations
  const allTransactions = useMemo(() => {
    if (dataState?.normalizedRecords) return dataState.normalizedRecords;
    if (dataState?.groupedEntities) {
      return dataState.groupedEntities.flatMap(g => g.transactions || []);
    }
    return [];
  }, [dataState]);

  // Top 10 TRX_OPERATOR_CODE (Interac Customer ID) - Incoming Only, >= 90% between $100 and $500
  const topOperators = useMemo(() => {
    const map = new Map();

    allTransactions.forEach(tx => {
      if (tx.transaction_direction !== 'Incoming') return;

      const opCode = tx.operator_code || (tx.raw_record ? tx.raw_record.TRX_OPERATOR_CODE : null);
      if (!opCode || opCode === 'N/A' || opCode === 'NULL') return;

      if (!map.has(opCode)) {
        map.set(opCode, {
          opCode,
          totalIncomingCount: 0,
          inRangeCount: 0,
          totalVolume: 0,
          clientName: tx.client_name || 'N/A'
        });
      }

      const item = map.get(opCode);
      item.totalIncomingCount += 1;
      item.totalVolume += tx.amount || 0;
      if (tx.amount >= 100 && tx.amount <= 500) {
        item.inRangeCount += 1;
      }
    });

    return Array.from(map.values())
      .map(item => {
        const pctInRange = item.totalIncomingCount > 0
          ? (item.inRangeCount / item.totalIncomingCount) * 100
          : 0;
        return {
          ...item,
          pctInRange: Math.round(pctInRange * 10) / 10
        };
      })
      .filter(item => item.pctInRange >= 90 && item.totalIncomingCount >= 1)
      .sort((a, b) => b.totalIncomingCount - a.totalIncomingCount)
      .slice(0, 10);
  }, [allTransactions]);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full font-sans transition-colors duration-200">

      {/* ========================================================================= */}
      {/* 1. HERO BANNER & INTAKE TERMINAL                                          */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-sky-50/40 to-slate-100 dark:from-[#121826] dark:via-[#10141E] dark:to-[#0D1017] p-6 md:p-8 shadow-sm dark:shadow-2xl overflow-hidden transition-colors duration-200">
        {/* Background ambient glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2.5">
              <Badge variant="cyan" className="px-2.5 py-1 text-xs uppercase font-bold tracking-wider">
                Tactical Triage Deck
              </Badge>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">FINTRAC AML / CTF Standard</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              Interac e-Transfer Intelligence & Risk Clustering
            </h1>

            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Ingest forensic transaction sheets, detect high-velocity structuring patterns, and isolate illicit merchant clusters with AI-assisted behavioral link analysis.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono shadow-xs">
                📄 Sheet: <b className="text-sky-600 dark:text-sky-400 ml-1">Full_Analysis</b>
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono shadow-xs">
                ⚡ Rail: <b className="text-emerald-600 dark:text-emerald-400 ml-1">Interac e-Transfer</b>
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-mono shadow-xs">
                🛡️ Defense Engine: <b className="text-purple-600 dark:text-purple-400 ml-1">LEON v2.4</b>
              </span>
            </div>
          </div>

          {/* INTAKE DROPZONE & ACTIONS */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                dragActive
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10'
                  : 'border-slate-300 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="file"
                id="excel-file-input"
                accept=".xlsx,.xls"
                className="hidden"
                disabled={isProcessing}
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              />
              <label
                htmlFor="excel-file-input"
                className="flex flex-col items-center justify-center cursor-pointer p-2"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-2">
                  {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <Upload size={20} />}
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isProcessing ? 'Processing Workbook...' : 'Ingest Excel Analysis (.xlsx)'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Drag & drop or browse from local disk
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadSampleData}
                className="flex-1 text-xs font-semibold"
              >
                <Sparkles size={13} className="mr-1.5 text-sky-600 dark:text-sky-400" />
                Load Demo Batch
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onNavigate('explorer')}
                className="flex-1 text-xs font-bold"
              >
                <span>Explore Clusters</span>
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </div>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center">
            <AlertTriangle size={16} className="mr-2 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE KPI SUMMARY CARDS                                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Analyzed ETRANSFER Volume */}
        <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Analyzed Volume
            </CardDescription>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-600 dark:text-emerald-400">
              <DollarSign size={18} />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between font-medium">
              <Badge variant="compliant" className="text-[10px] px-1.5 py-0">
                Active Batch
              </Badge>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">Full_Analysis</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Total Records Ingested */}
        <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Ingested Records
            </CardDescription>
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900/60 rounded-xl text-sky-600 dark:text-sky-400">
              <FileSpreadsheet size={18} />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl md:text-3xl font-extrabold text-sky-600 dark:text-sky-300 font-mono tracking-tight">
              {totalTxns.toLocaleString()}
            </div>
            <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between font-medium">
              <span>Deduplicated</span>
              <span className="text-sky-700 dark:text-sky-400 font-mono font-bold">100k Cap</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Customer Entities Grouped */}
        <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Entity Clusters
            </CardDescription>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/60 rounded-xl text-purple-600 dark:text-purple-400">
              <Network size={18} />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {groups.length}
            </div>
            <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between font-medium">
              <span className="text-purple-700 dark:text-purple-400 font-bold">{corpStats.length} Corporations</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Grouped Keys</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Critical Risk Clusters */}
        <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Critical Risk Entities
            </CardDescription>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400">
              <ShieldAlert size={18} />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl md:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono tracking-tight flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2 animate-pulse" />
              {criticalGroups.length}
            </div>
            <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between font-medium">
              <span>Elevated: <b className="text-amber-700 dark:text-amber-400 font-mono font-bold">{elevatedGroups.length}</b></span>
              <button
                onClick={() => onNavigate('explorer')}
                className="text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer"
              >
                Review &rarr;
              </button>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ========================================================================= */}
      {/* 3. CORPORATION BREAKDOWN & TOP INTERAC OPERATORS                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Corporation Portfolio Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-5 pb-4 flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center">
                <Building2 size={16} className="mr-2 text-sky-600 dark:text-sky-400" />
                Corporation Portfolio Breakdown
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Aggregated volumes across ingested partner corporations (DCBank, Pateno, DCPayments, Apaylo)
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              CORPORATION_CODE
            </Badge>
          </CardHeader>

          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {corpStats.map(corp => (
                <div
                  key={corp.name}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
                >
                  <div className="text-xs font-bold text-sky-700 dark:text-sky-300 font-mono truncate" title={corp.name}>
                    {corp.name}
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                    ${corp.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800/60 font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{corp.entities} Clusters</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{corp.count} txns</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 10 TRX_OPERATOR_CODE (Interac Customer ID) Widget */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="p-5 pb-4 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center">
                <Activity size={16} className="mr-2 text-sky-600 dark:text-sky-400" />
                Top Interac Customer IDs
              </CardTitle>
              <Badge variant="cyan" className="text-[9px] font-mono">
                $100 - $500 Structuring
              </Badge>
            </div>
            <CardDescription className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Operators where <b className="text-emerald-700 dark:text-emerald-400">≥90% of incoming</b> falls in structuring range
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 flex-1 overflow-y-auto max-h-[300px] space-y-2.5">
            {topOperators.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-500 italic">
                No operator codes currently meet the ≥90% incoming range threshold ($100 - $500).
              </div>
            ) : (
              topOperators.map((item, idx) => (
                <div
                  key={item.opCode || idx}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{item.opCode}</span>
                      <Badge variant="compliant" className="text-[9px] px-1.5 py-0 font-mono">
                        {item.pctInRange}% in range
                      </Badge>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {item.clientName}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.totalIncomingCount} txns</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ${item.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>

      {/* ========================================================================= */}
      {/* 4. PLATFORM CORE MODULES LAUNCHPAD                                        */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          LEON Tactical Command Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Module 1: Cluster & Entity Explorer */}
          <Card
            onClick={() => onNavigate('explorer')}
            className="hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 p-5 rounded-2xl transition-all group cursor-pointer shadow-sm dark:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                <Network size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                Cluster & Entity Explorer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Multi-dimensional forensic explorer. Filter by corporation, client, rule trigger, and grouping key source.
              </p>
            </div>
            <div className="mt-5 text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center">
              <span>Open Explorer</span>
              <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Module 2: Rule Management */}
          <Card
            onClick={() => onNavigate('rules')}
            className="hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 p-5 rounded-2xl transition-all group cursor-pointer shadow-sm dark:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                <Zap size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                Rule Engine & Automation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Configure automated keyword triggers ("weed", "canna"), velocity thresholds, and risk scoring logic.
              </p>
            </div>
            <div className="mt-5 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center">
              <span>Configure Rules</span>
              <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Module 3: Reports & Analytics */}
          <Card
            onClick={() => onNavigate('reports')}
            className="hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 p-5 rounded-2xl transition-all group cursor-pointer shadow-sm dark:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                <FileBarChart size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                Reports & STR Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Generate Suspicious Transaction Reports (STRs), regulatory audit exports, and illicit merchant logs.
              </p>
            </div>
            <div className="mt-5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <span>Generate Reports</span>
              <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Module 4: Watchlists & Sanctions */}
          <Card
            onClick={() => onNavigate('watchlists')}
            className="hover:border-purple-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 p-5 rounded-2xl transition-all group cursor-pointer shadow-sm dark:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                <ListIcon size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                Watchlists & Blacklists
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Maintain high-risk recipient emails, blacklisted merchant domains, and flagged account identifiers.
              </p>
            </div>
            <div className="mt-5 text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center">
              <span>Manage Registry</span>
              <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

        </div>
      </div>

    </div>
  );
};

export default EtransferHomeView;
