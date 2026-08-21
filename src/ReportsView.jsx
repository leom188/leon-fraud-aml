import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  FileSpreadsheet,
  Activity,
  ChevronRight,
  Network,
  Zap,
  List as ListIcon,
  ShieldCheck,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';

const ReportsView = ({ onNavigate, dataState }) => {
  const [exportingType, setExportingType] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  const groups = dataState?.groupedEntities || [];
  const totalTxns = dataState?.totalRecords || groups.reduce((acc, g) => acc + (g.transaction_count || 0), 0);
  const criticalGroups = groups.filter(g => g.risk_level === 'Critical');
  const elevatedGroups = groups.filter(g => g.risk_level === 'Elevated');

  // Trigger real XLSX export based on actual ingested/sample data
  const handleExportReport = (reportType) => {
    setExportingType(reportType);

    try {
      const wb = XLSX.utils.book_new();

      if (reportType === 'high_risk_cluster') {
        const clusterData = (criticalGroups.length > 0 ? criticalGroups : groups).map(g => ({
          'Entity Grouping Key': g.grouping_key,
          'Grouping Field': g.grouping_key_source,
          'Client Name': g.client_name,
          'Client ID': g.client_id,
          'Corporation': g.corporation_code || 'N/A',
          'Transaction Count': g.transaction_count,
          'Total Volume (CAD)': g.total_amount,
          'Risk Level': g.risk_level,
          'Risk Score': g.risk_score,
          'Triggered Rules': (g.rule_names || []).join(', ')
        }));

        const ws = XLSX.utils.json_to_sheet(clusterData);
        XLSX.utils.book_append_sheet(wb, ws, 'High_Risk_Clusters');
        XLSX.writeFile(wb, `LEON_High_Risk_Clusters_${new Date().toISOString().slice(0, 10)}.xlsx`);
      } else if (reportType === 'keyword_breach') {
        const keywordTxns = [];
        groups.forEach(g => {
          (g.transactions || []).forEach(tx => {
            if (tx.is_keyword_breach || (tx.rule_names && tx.rule_names.some(r => /canna|weed|drug|green/i.test(r)))) {
              keywordTxns.push({
                'Reference ID': tx.reference_number || tx.ref,
                'Sender Name': tx.sender_name || tx.sender,
                'Sender Email': tx.sender_email || tx.senderEmail,
                'Recipient Name': tx.recipient_name || tx.recipientName,
                'Recipient Email': tx.recipient_email || tx.recipientEmail,
                'Amount (CAD)': tx.amount,
                'Memo / Notes': tx.memo || '',
                'Triggered Rule': (tx.rule_names || []).join(', ')
              });
            }
          });
        });

        const ws = XLSX.utils.json_to_sheet(keywordTxns.length > 0 ? keywordTxns : [{ Message: 'No keyword breaches in active batch' }]);
        XLSX.utils.book_append_sheet(wb, ws, 'Keyword_Audit_Log');
        XLSX.writeFile(wb, `LEON_Keyword_Breach_Audit_${new Date().toISOString().slice(0, 10)}.xlsx`);
      } else {
        const allTxns = (dataState?.normalizedRecords || groups.flatMap(g => g.transactions || [])).map(tx => ({
          'Ref Number': tx.reference_number || tx.ref,
          'Interac Ref': tx.interac_ref_1 || tx.interacRef1 || '',
          'Client Name': tx.client_name || '',
          'Corporation': tx.corporation_code || '',
          'Direction': tx.transaction_direction || '',
          'Amount': tx.amount,
          'Status': tx.status || 'Active'
        }));

        const ws = XLSX.utils.json_to_sheet(allTxns);
        XLSX.utils.book_append_sheet(wb, ws, 'Full_Audit_Export');
        XLSX.writeFile(wb, `LEON_Full_Audit_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
      }

      setSuccessToast(`Report package downloaded successfully.`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full font-sans transition-colors duration-200">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Compliance & Audit Hub</h1>
            <Badge variant="cyan" className="font-mono text-xs uppercase">FINTRAC STR</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Suspicious Transaction Reports (STR), executive audit logs, and illicit merchant forensic exports.
          </p>
        </div>

        {successToast && (
          <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs px-4 py-2 rounded-xl flex items-center shadow-lg animate-in fade-in">
            <CheckCircle size={15} className="mr-2 text-emerald-600 dark:text-emerald-400" />
            {successToast}
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-5 pb-2">
            <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Batch Entity Clusters
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{groups.length} Entities</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">{totalTxns.toLocaleString()} Transactions Ingested</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5 pb-2">
            <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              High Risk / Critical Filings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{criticalGroups.length} Critical Clusters</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">Ready for Suspicious Transaction Report Export</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5 pb-2">
            <CardDescription className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              Elevated / Watchlist Alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">{elevatedGroups.length} Elevated</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">Under Enhanced Due Diligence (EDD)</div>
          </CardContent>
        </Card>
      </div>

      {/* AVAILABLE EXPORT PACKAGES */}
      <Card className="shadow-sm dark:shadow-xl">
        <CardHeader className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center">
            <FileSpreadsheet size={18} className="mr-2 text-sky-600 dark:text-sky-400" />
            Automated Audit & Compliance Export Packages
          </CardTitle>
          <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
            Generates standardized forensic spreadsheets populated directly from your active session data.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          
          {/* Package 1 */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Monthly ETRANSFER High-Risk Cluster Summary</span>
                <Badge variant="critical" className="text-[9px]">Critical Severity</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Aggregated customer entities with Critical risk scores across partner corporations (DCBank, Pateno, DCPayments). Includes rule triggers and total velocity.
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              disabled={exportingType === 'high_risk_cluster'}
              onClick={() => handleExportReport('high_risk_cluster')}
              className="text-xs font-bold shrink-0 shadow-xs"
            >
              <Download size={14} className="mr-1.5" />
              {exportingType === 'high_risk_cluster' ? 'Generating...' : 'Export Excel (.xlsx)'}
            </Button>
          </div>

          {/* Package 2 */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Illicit Merchant Keyword Breaches ("weed", "canna", "crypto")</span>
                <Badge variant="elevated" className="text-[9px]">Forensic Keyword Log</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Detailed transaction audit log matching illicit dispensary, unlicensed substance & cryptocurrency wash keywords from security answers and memos.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={exportingType === 'keyword_breach'}
              onClick={() => handleExportReport('keyword_breach')}
              className="text-xs font-bold shrink-0 shadow-xs"
            >
              <Download size={14} className="mr-1.5 text-sky-600 dark:text-sky-400" />
              {exportingType === 'keyword_breach' ? 'Generating...' : 'Export Keyword Audit'}
            </Button>
          </div>

          {/* Package 3 */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Full Batch Forensic Transaction Ledger</span>
                <Badge variant="secondary" className="text-[9px]">Complete Ledger</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                All parsed records with complete normalization, interac reference IDs, client codes, and directional flow attributes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={exportingType === 'full'}
              onClick={() => handleExportReport('full')}
              className="text-xs font-bold shrink-0 shadow-xs"
            >
              <Download size={14} className="mr-1.5 text-sky-600 dark:text-sky-400" />
              {exportingType === 'full' ? 'Generating...' : 'Export Full Dataset'}
            </Button>
          </div>

        </CardContent>
      </Card>

    </div>
  );
};

export default ReportsView;
