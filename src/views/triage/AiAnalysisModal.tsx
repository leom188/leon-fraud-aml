import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog';
import { Sparkles, Brain, ShieldAlert, Copy, Check, FileText } from 'lucide-react';
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

  if (!entity) return null;

  const isCritical = entity.risk_level === 'Critical';
  const typology = isCritical
    ? 'Illicit Merchant / Unlicensed Retail'
    : 'High Velocity Interac Dispersal';

  const analysisNarrative = `
INVESTIGATION DOSSIER — LEON AML REASONING ENGINE
--------------------------------------------------
Entity Cluster: ${entity.grouping_key} (${entity.transaction_direction})
Client Entity:  ${entity.client_name} (Corp ID: ${entity.client_id})
Risk Score:     ${entity.risk_score} / 100 (${entity.risk_level})
Total Volume:   $${entity.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} CAD across ${entity.transaction_count} transactions.

TYPOLOGY CLASSIFICATION:
${typology}

FORENSIC INDICATORS & BEHAVIORAL TRIGGERS:
1. Counterparty Dispersion: Entity interacts with ${entity.distinct_emails_count} distinct counterparties with a fan-out ratio of ${entity.fan_out_ratio}.
2. Keyword Detection: ${entity.contains_keyword ? 'Detected illicit substance keywords (weed/canna/vape/dispensary) embedded in counterparty names or memo parameters.' : 'No overt drug keywords detected in memo parameters.'}
3. Velocity Surge: Clustering indicates a ${entity.volume_spike_pct}% volume surge relative to baseline.
4. Interbank Dispersal: ${entity.interbank_pct}% of transactions are routed across external banking operators.

RECOMMENDED REGULATORY ACTION:
Submit Suspicious Transaction Report (STR / SAR) to FINTRAC under Schedule 1 typology rules. Request full account opening documentation from ${entity.client_name}.
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white dark:bg-[#10141E] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400">
            <Brain size={20} />
            <DialogTitle className="text-base font-bold">
              AI Typology Dossier: {entity.grouping_key}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Automated AML behavioral analysis and regulatory narrative generator.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Typology Badge */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
              Classified Typology
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldAlert size={16} className={isCritical ? 'text-rose-500' : 'text-amber-500'} />
              <span>{typology}</span>
            </div>
          </div>

          {/* Dossier Terminal Box */}
          <div className="relative">
            <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed overflow-auto max-h-72 border border-slate-800">
              {analysisNarrative}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 cursor-pointer shadow-sm"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Dossier'}</span>
            </button>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Analyst Session: Ready for export
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AiAnalysisModal;
