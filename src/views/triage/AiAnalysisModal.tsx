import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  Brain,
  ShieldAlert,
  Copy,
  Check,
  Users,
  TrendingUp,
  Building2,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { GroupedEntity } from '../../types/rails';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: GroupedEntity | null;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  entity
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawNarrative, setShowRawNarrative] = useState(false);

  if (!entity) return null;

  const isCritical = entity.risk_level === 'Critical';
  const isHigh = entity.risk_level === 'High';
  const typology = isCritical
    ? 'Illicit Merchant / Unlicensed Retail'
    : isHigh
    ? 'High Velocity Interac Dispersal'
    : 'Elevated Transaction Velocity';

  const riskScore = entity.risk_score;
  const riskPct = Math.min((riskScore / 100) * 100, 100);
  const riskColor = isCritical
    ? 'bg-rose-500'
    : isHigh
    ? 'bg-amber-500'
    : 'bg-yellow-400';
  const riskTextColor = isCritical
    ? 'text-rose-600 dark:text-rose-400'
    : isHigh
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-yellow-600 dark:text-yellow-400';
  const riskBgColor = isCritical
    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60'
    : isHigh
    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60'
    : 'bg-yellow-50 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-800/60';

  // Build forensic findings list
  const findings = [
    {
      icon: Users,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      label: 'Counterparty Dispersion',
      value: `${entity.distinct_emails_count} distinct counterparties (fan-out: ${entity.fan_out_ratio})`,
      severity: entity.distinct_emails_count > 20 ? 'high' : 'medium',
    },
    {
      icon: AlertTriangle,
      color: entity.contains_keyword ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400',
      bg: entity.contains_keyword ? 'bg-rose-50 dark:bg-rose-950/60' : 'bg-slate-50 dark:bg-slate-900/60',
      label: 'Keyword Detection',
      value: entity.contains_keyword
        ? 'Illicit substance keywords detected (weed / canna / vape / dispensary)'
        : 'No overt drug keywords detected in memo parameters',
      severity: entity.contains_keyword ? 'critical' : 'clear',
    },
    {
      icon: TrendingUp,
      color: entity.volume_spike_pct > 25 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
      bg: entity.volume_spike_pct > 25 ? 'bg-amber-50 dark:bg-amber-950/60' : 'bg-emerald-50 dark:bg-emerald-950/60',
      label: 'Velocity Surge',
      value: `${entity.volume_spike_pct}% volume increase relative to baseline`,
      severity: entity.volume_spike_pct > 25 ? 'high' : 'medium',
    },
    {
      icon: Building2,
      color: entity.interbank_pct > 70 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400',
      bg: entity.interbank_pct > 70 ? 'bg-purple-50 dark:bg-purple-950/60' : 'bg-slate-50 dark:bg-slate-900/60',
      label: 'Interbank Dispersal',
      value: `${entity.interbank_pct}% of transactions routed across external banking operators`,
      severity: entity.interbank_pct > 70 ? 'high' : 'medium',
    },
  ];

  const severityBadge = (s: string) => {
    const map: Record<string, string> = {
      critical: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300',
      high: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
      medium: 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300',
      clear: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
    };
    return map[s] || map.medium;
  };

  const rawNarrative = `INVESTIGATION DOSSIER — LEON AML REASONING ENGINE
--------------------------------------------------
Entity Cluster: ${entity.grouping_key} (${entity.transaction_direction})
Client Entity:  ${entity.client_name} (Corp ID: ${entity.client_id})
Risk Score:     ${entity.risk_score} / 100 (${entity.risk_level})
Total Volume:   $${entity.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} CAD across ${entity.transaction_count} transactions.
Period:         ${entity.first_transaction_date} → ${entity.last_transaction_date}

TYPOLOGY CLASSIFICATION:
${typology}

FORENSIC INDICATORS & BEHAVIORAL TRIGGERS:
1. Counterparty Dispersion: Entity interacts with ${entity.distinct_emails_count} distinct counterparties with a fan-out ratio of ${entity.fan_out_ratio}.
2. Keyword Detection: ${entity.contains_keyword ? 'Detected illicit substance keywords (weed/canna/vape/dispensary) embedded in counterparty names or memo parameters.' : 'No overt drug keywords detected in memo parameters.'}
3. Velocity Surge: Clustering indicates a ${entity.volume_spike_pct}% volume surge relative to baseline.
4. Interbank Dispersal: ${entity.interbank_pct}% of transactions are routed across external banking operators.

RECOMMENDED REGULATORY ACTION:
Submit Suspicious Transaction Report (STR / SAR) to FINTRAC under Schedule 1 typology rules. Request full account opening documentation from ${entity.client_name}.`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(rawNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-popover border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-0 gap-0">

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-200 dark:border-slate-800 pr-12">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 rounded-xl text-sky-600 dark:text-sky-400 shrink-0">
              <Brain size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                AI Typology Dossier
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono truncate max-w-xs">
                {entity.grouping_key}
              </p>
            </div>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Risk Gauge + Entity Summary ── */}
          <div className={`p-4 rounded-xl border ${riskBgColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Risk Assessment
                </div>
                <div className={`text-xl font-extrabold font-mono ${riskTextColor}`}>
                  {riskScore} <span className="text-sm font-medium text-slate-500">/&nbsp;100</span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 ${riskBgColor} border`}>
                <ShieldAlert size={14} className={riskTextColor} />
                <span className={riskTextColor}>{entity.risk_level}</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${riskColor}`}
                style={{ width: `${riskPct}%` }}
              />
            </div>
            {/* Entity meta */}
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
              <div><span className="text-slate-400">Client:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{entity.client_name}</span></div>
              <div><span className="text-slate-400">Corp ID:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{entity.client_id}</span></div>
              <div><span className="text-slate-400">Volume:</span> <span className="text-emerald-600 dark:text-emerald-400 font-bold">${entity.total_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
              <div><span className="text-slate-400">Txns:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{entity.transaction_count}</span></div>
              <div className="col-span-2"><span className="text-slate-400">Period:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{entity.first_transaction_date} → {entity.last_transaction_date}</span></div>
            </div>
          </div>

          {/* ── Classified Typology ── */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
              Classified Typology
            </div>
            <div className="flex items-center space-x-2">
              <ShieldAlert size={15} className={riskTextColor} />
              <span className="text-sm font-bold text-slate-900 dark:text-white">{typology}</span>
            </div>
          </div>

          {/* ── Forensic Indicators ── */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
              Forensic Indicators &amp; Behavioral Triggers
            </div>
            <div className="space-y-2">
              {findings.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl"
                >
                  <div className={`p-1.5 rounded-lg ${f.bg} shrink-0 mt-0.5`}>
                    <f.icon size={13} className={f.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{f.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${severityBadge(f.severity)}`}>
                        {f.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Recommended Action ── */}
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-mono mb-1.5 flex items-center space-x-1.5">
              <Zap size={10} />
              <span>Recommended Regulatory Action</span>
            </div>
            <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
              Submit a <span className="font-bold">Suspicious Transaction Report (STR / SAR)</span> to FINTRAC under Schedule 1 typology rules.
              Request full account opening documentation from <span className="font-bold">{entity.client_name}</span>.
            </p>
          </div>

          {/* ── Raw Narrative (collapsible) ── */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowRawNarrative(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <span className="flex items-center space-x-2">
                <FileText size={13} />
                <span>Raw Dossier Narrative (for export)</span>
              </span>
              {showRawNarrative ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showRawNarrative && (
              <div className="relative">
                <pre className="p-4 bg-slate-950 text-slate-300 font-mono text-[10.5px] leading-relaxed overflow-x-auto whitespace-pre-wrap border-t border-slate-800">
                  {rawNarrative}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 border border-slate-700 cursor-pointer shadow-sm transition-colors"
                >
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
            <Activity size={11} />
            <span>LEON AML Engine · Ready for export</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs font-semibold"
            >
              {copied ? <Check size={12} className="mr-1.5 text-emerald-500" /> : <Copy size={12} className="mr-1.5" />}
              {copied ? 'Copied!' : 'Copy Dossier'}
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="text-xs font-bold"
            >
              Close
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default AiAnalysisModal;
