import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Network,
  Zap,
  FileBarChart,
  List as ListIcon,
  Upload,
  RefreshCw,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Building2,
  DollarSign,
  Activity,
  Sparkles,
  Users,
  UserCheck,
  PieChart,
  Repeat,
  ArrowRightLeft
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { parseExcelFile } from './utils/excelDataLoader';
import { isOpenAlert } from './utils/alertUtils';
import DirectionalFlowChart from './components/charts/DirectionalFlowChart';
import CounterpartyVelocityChart from './components/charts/CounterpartyVelocityChart';
import PassThroughFunnelChart from './components/charts/PassThroughFunnelChart';

const EtransferHomeView = ({
  dataState,
  onNavigate,
  onLoadSampleData,
  onDataIngested
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const groups = dataState?.groupedEntities || [];
  const totalVolume = groups.reduce((acc, g) => acc + (g.total_amount || 0), 0);
  const totalTxns = dataState?.totalRecords || groups.reduce((acc, g) => acc + (g.transaction_count || 0), 0);

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

  // Compute unique counterparties, directional flow distribution, and alert counts
  const counterpartyMetrics = useMemo(() => {
    const senders = new Set();
    const payees = new Set();
    let openAlerts = 0;
    let incomingVol = 0;
    let incomingCount = 0;
    let outgoingVol = 0;
    let outgoingCount = 0;

    allTransactions.forEach(tx => {
      // Senders: sender_email or sender_name
      const sender = (tx.sender_email || tx.sender_name || '').trim().toLowerCase();
      if (sender && sender !== 'n/a' && sender !== 'null') {
        senders.add(sender);
      }

      // Payees: recipient_email or recipient_name
      const payee = (tx.recipient_email || tx.recipient_name || '').trim().toLowerCase();
      if (payee && payee !== 'n/a' && payee !== 'null') {
        payees.add(payee);
      }

      if (isOpenAlert(tx)) {
        openAlerts += 1;
      }

      const amt = Number(tx.amount) || 0;
      if (tx.transaction_direction === 'Incoming') {
        incomingVol += amt;
        incomingCount += 1;
      } else if (tx.transaction_direction === 'Outgoing') {
        outgoingVol += amt;
        outgoingCount += 1;
      }
    });

    const totalFlowVol = incomingVol + outgoingVol;
    const totalFlowCount = incomingCount + outgoingCount;

    return {
      uniqueSendersCount: senders.size,
      uniquePayeesCount: payees.size,
      openAlertsCount: openAlerts,
      incomingVolume: incomingVol,
      incomingCount,
      outgoingVolume: outgoingVol,
      outgoingCount,
      incomingVolPct: totalFlowVol > 0 ? Math.round((incomingVol / totalFlowVol) * 100) : 0,
      outgoingVolPct: totalFlowVol > 0 ? Math.round((outgoingVol / totalFlowVol) * 100) : 0,
      incomingCountPct: totalFlowCount > 0 ? Math.round((incomingCount / totalFlowCount) * 100) : 0,
      outgoingCountPct: totalFlowCount > 0 ? Math.round((outgoingCount / totalFlowCount) * 100) : 0
    };
  }, [allTransactions]);

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



  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full font-sans transition-colors duration-200">

      {/* ========================================================================= */}
      {/* 1. DASHBOARD HEADER                                                       */}
      {/* ========================================================================= */}
      <div className="pb-1">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          e-Transfer intelligence dashboard
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          LEON v2.4 &nbsp;·&nbsp; Interac e-Transfer rail
        </p>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center">
          <AlertTriangle size={16} className="mr-2 shrink-0 text-rose-500 dark:text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONSOLIDATED KPI CARDS (Volume, Network Entities, AML Risk)           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* KPI 1: Transactional Volume & Throughput */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Volume &amp; ingestion
            </span>
            <DollarSign size={15} className="text-muted-foreground" />
          </div>

          <div className="mt-4">
            <span className="text-3xl font-semibold text-foreground tracking-tight tabular-nums">
              ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="text-xs text-muted-foreground mt-1">
              Total analyzed portfolio capital
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-muted-foreground text-[11px]">Ingested records</div>
              <div className="font-medium text-foreground tabular-nums mt-0.5">
                {totalTxns.toLocaleString()} txns
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px]">Directional flow</div>
              <div className="font-medium text-primary tabular-nums mt-0.5">
                {counterpartyMetrics.incomingVolPct}% in / {counterpartyMetrics.outgoingVolPct}% out
              </div>
            </div>
          </div>
        </Card>

        {/* KPI 2: Network Entities & Counterparties */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Network &amp; counterparties
            </span>
            <Users size={15} className="text-muted-foreground" />
          </div>

          <div className="mt-4">
            <span className="text-3xl font-semibold text-foreground tracking-tight tabular-nums">
              {(counterpartyMetrics.uniqueSendersCount + counterpartyMetrics.uniquePayeesCount).toLocaleString()}
            </span>
            <div className="text-xs text-muted-foreground mt-1">
              Total unique network participants
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground text-[11px]">Senders</div>
              <div className="font-medium text-foreground tabular-nums mt-0.5">
                {counterpartyMetrics.uniqueSendersCount}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px]">Payees</div>
              <div className="font-medium text-foreground tabular-nums mt-0.5">
                {counterpartyMetrics.uniquePayeesCount}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[11px]">Clusters</div>
              <div className="font-medium text-primary tabular-nums mt-0.5">
                {groups.length}
              </div>
            </div>
          </div>
        </Card>

        {/* KPI 3: AML Risk & Triage Alerts (color used as signal only) */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Open queue
            </span>
            <ShieldAlert size={15} className="text-muted-foreground" />
          </div>

          <div className="mt-4">
            <div className="text-3xl font-semibold text-rose-600 dark:text-rose-400 tracking-tight tabular-nums">
              {counterpartyMetrics.openAlertsCount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Active open risk alerts
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
            <div>
              <div className="text-muted-foreground text-[11px]">High severity queue</div>
              <div className="font-medium text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
                {groups.filter(g => g.risk_level === 'Critical').length} critical
              </div>
            </div>
            <button
              onClick={() => onNavigate('explorer')}
              className="px-2.5 py-1 rounded-md bg-accent text-accent-foreground font-medium hover:bg-accent/70 transition-colors cursor-pointer text-xs"
            >
              Review queue &rarr;
            </button>
          </div>
        </Card>

      </div>

      {/* ========================================================================= */}
      {/* 3. FORENSIC INTELLIGENCE GRAPHICS (CHART.JS) & BEHAVIORAL ANALYTICS       */}
      {/* ========================================================================= */}
      <div className="space-y-6">

        {/* Trio of Chart.js Forensic Intelligence Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart 1: Directional Flow Distribution */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="p-5 pb-4 border-b border-border">
              <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                <PieChart size={15} className="text-muted-foreground" />
                Directional flow distribution
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Interactive distribution between incoming funds and outgoing disbursements
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <DirectionalFlowChart
                incomingVolume={counterpartyMetrics.incomingVolume}
                outgoingVolume={counterpartyMetrics.outgoingVolume}
                incomingCount={counterpartyMetrics.incomingCount}
                outgoingCount={counterpartyMetrics.outgoingCount}
                uniqueSenders={counterpartyMetrics.uniqueSendersCount}
                uniquePayees={counterpartyMetrics.uniquePayeesCount}
              />
            </CardContent>
          </Card>

          {/* Chart 2: First-Time vs Repeat Counterparties */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="p-5 pb-4 border-b border-border">
              <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                <Repeat size={15} className="text-muted-foreground" />
                Counterparty velocity: first-time vs repeat
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Single-interaction counterparties (1x) vs recurring regular relationships (≥2x)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <CounterpartyVelocityChart allTransactions={allTransactions} />
            </CardContent>
          </Card>

          {/* Chart 3: Pass-Through / Funnel Ratio */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="p-5 pb-4 border-b border-border">
              <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                <ArrowRightLeft size={15} className="text-muted-foreground" />
                Pass-through / funnel ratio
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Disbursement velocity & money mule transit account detection
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              <PassThroughFunnelChart
                allTransactions={allTransactions}
                incomingVolume={counterpartyMetrics.incomingVolume}
                outgoingVolume={counterpartyMetrics.outgoingVolume}
                incomingCount={counterpartyMetrics.incomingCount}
                outgoingCount={counterpartyMetrics.outgoingCount}
              />
            </CardContent>
          </Card>

        </div>

        {/* Corporation Portfolio Breakdown & Top Operators */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Corporation Portfolio Breakdown */}
          <Card className="lg:col-span-2 flex flex-col justify-between">
            <CardHeader className="p-5 pb-4 flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                  <Building2 size={15} className="text-muted-foreground" />
                  Corporation portfolio breakdown
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Aggregated volume and cluster distribution across partner corporations
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                CORPORATION_CODE
              </Badge>
            </CardHeader>

            <CardContent className="p-5 flex-1 overflow-y-auto max-h-[350px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {corpStats.map(corp => (
                  <div
                    key={corp.name}
                    className="bg-muted/50 border border-border p-3.5 rounded-lg space-y-1.5 hover:border-muted-foreground/30 transition-colors"
                  >
                    <div className="text-xs font-medium text-foreground truncate" title={corp.name}>
                      {corp.name}
                    </div>
                    <div className="text-base font-semibold text-foreground tabular-nums">
                      ${corp.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex justify-between pt-1 border-t border-border">
                      <span>{corp.entities} clusters</span>
                      <span className="tabular-nums">{corp.count} txns</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top 10 TRX_OPERATOR_CODE (Interac Customer ID) Widget */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="p-5 pb-4 border-b border-border">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
                  <Activity size={15} className="text-muted-foreground" />
                  Top Interac customer IDs
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  $100–$500 structuring
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Operators where <b className="text-foreground font-semibold">≥90% of incoming</b> falls in structuring range
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 flex-1 overflow-y-auto max-h-[300px] space-y-2">
              {topOperators.length === 0 ? (
                <div className="p-4 bg-muted/50 border border-border rounded-lg text-center text-xs text-muted-foreground">
                  No operator codes currently meet the ≥90% incoming range threshold ($100–$500).
                </div>
              ) : (
                topOperators.map((item, idx) => (
                  <div
                    key={item.opCode || idx}
                    className="bg-muted/50 border border-border p-3 rounded-lg hover:border-muted-foreground/30 transition-colors flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-medium text-foreground">{item.opCode}</span>
                        <Badge variant="compliant" className="text-[10px] px-1.5 py-0">
                          {item.pctInRange}% in range
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                        {item.clientName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-medium text-foreground tabular-nums">{item.totalIncomingCount} txns</div>
                      <div className="text-[11px] text-muted-foreground tabular-nums">
                        ${item.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PLATFORM MODULES LAUNCHPAD                                             */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h2 className="text-xs font-medium text-muted-foreground">
          Platform modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Module 1: Cluster & Entity Explorer */}
          <Card
            onClick={() => onNavigate('explorer')}
            className="p-5 transition-all group cursor-pointer flex flex-col justify-between hover:border-primary/40 hover:bg-muted/40"
          >
            <div>
              <div className="p-2.5 bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground rounded-lg w-fit mb-4 transition-colors">
                <Network size={18} />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                Cluster &amp; entity explorer
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Multi-dimensional forensic explorer. Filter by corporation, client, rule trigger, and grouping key source.
              </p>
            </div>
            <div className="mt-5 text-xs font-medium text-primary flex items-center">
              <span>Open explorer</span>
              <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Module 2: Rule Management */}
          <Card
            onClick={() => onNavigate('rules')}
            className="p-5 transition-all group cursor-pointer flex flex-col justify-between hover:border-primary/40 hover:bg-muted/40"
          >
            <div>
              <div className="p-2.5 bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground rounded-lg w-fit mb-4 transition-colors">
                <Zap size={18} />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                Rule engine &amp; automation
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Configure automated keyword triggers ("weed", "canna"), velocity thresholds, and risk scoring logic.
              </p>
            </div>
            <div className="mt-5 text-xs font-medium text-primary flex items-center">
              <span>Configure rules</span>
              <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Module 3: Reports & Analytics */}
          <Card
            onClick={() => onNavigate('reports')}
            className="p-5 transition-all group cursor-pointer flex flex-col justify-between hover:border-primary/40 hover:bg-muted/40"
          >
            <div>
              <div className="p-2.5 bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground rounded-lg w-fit mb-4 transition-colors">
                <FileBarChart size={18} />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                Reports &amp; STR hub
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Generate Suspicious Transaction Reports (STRs), regulatory audit exports, and illicit merchant logs.
              </p>
            </div>
            <div className="mt-5 text-xs font-medium text-primary flex items-center">
              <span>Generate reports</span>
              <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Module 4: Watchlists & Sanctions */}
          <Card
            onClick={() => onNavigate('watchlists')}
            className="p-5 transition-all group cursor-pointer flex flex-col justify-between hover:border-primary/40 hover:bg-muted/40"
          >
            <div>
              <div className="p-2.5 bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground rounded-lg w-fit mb-4 transition-colors">
                <ListIcon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                Watchlists &amp; blacklists
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Maintain high-risk recipient emails, blacklisted merchant domains, and flagged account identifiers.
              </p>
            </div>
            <div className="mt-5 text-xs font-medium text-primary flex items-center">
              <span>Manage registry</span>
              <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

        </div>
      </div>

    </div>
  );
};

export default EtransferHomeView;
