import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Brain,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { GroupedEntity } from '../../types/rails';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatDisplayDate } from '../../utils/dateUtils';

interface EntityHeaderProps {
  entity: GroupedEntity;
  onOpenAiModal: () => void;
  onOpenRawModal: () => void;
  viewMode: 'grouped' | 'flat';
  onToggleViewMode: (mode: 'grouped' | 'flat') => void;
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({
  entity,
  onOpenAiModal,
  onOpenRawModal,
  viewMode,
  onToggleViewMode
}) => {
  const isCritical = entity.risk_level === 'Critical';
  const isElevated = entity.risk_level === 'Elevated';

  return (
    <div className="bg-white dark:bg-[#10141E] border-b border-slate-200 dark:border-slate-800 p-5 space-y-4 shrink-0 transition-colors duration-200">
      {/* Top Bar: Cluster Identity & Fast Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider border flex items-center space-x-1.5 ${
                isCritical
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : isElevated
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isCritical ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
              <span>{entity.risk_level} Risk Cluster</span>
            </span>

            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ID: {entity.id}
            </span>

            <span className="text-xs text-slate-400 dark:text-slate-600">•</span>

            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {entity.corporation_code}
            </span>
          </div>

          <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>{entity.grouping_key}</span>
            <span className="text-xs font-normal text-slate-500">
              ({entity.transaction_direction} • {entity.grouping_key_source})
            </span>
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Client: <span className="font-semibold text-slate-700 dark:text-slate-200">{entity.client_name}</span> (ID: {entity.client_id}) • Account: <span className="font-mono">{entity.customer_account}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          {/* View Mode Toggle: Counterparty Dispersion vs Flat Ledger */}
          <div className="bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 flex text-xs">
            <button
              onClick={() => onToggleViewMode('grouped')}
              className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                viewMode === 'grouped'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Counterparties ({entity.distinct_emails_count ?? entity.top_recipient_emails?.length ?? 0})
            </button>
            <button
              onClick={() => onToggleViewMode('flat')}
              className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                viewMode === 'flat'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Flat Transactions ({entity.transaction_count})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRawModal}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Raw Ingestion Data
          </Button>

          <Button
            size="sm"
            onClick={onOpenAiModal}
            className="text-xs font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sm"
          >
            <Sparkles size={13} className="mr-1.5" />
            AI Typology Dossier
          </Button>
        </div>
      </div>

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Volume */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Cluster Volume
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
            ${entity.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Transaction Count */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Transaction Count
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
            {entity.transaction_count.toLocaleString()}
          </span>
        </div>

        {/* Average Ticket */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Average Amount
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
            ${(entity.total_amount / Math.max(1, entity.transaction_count)).toFixed(2)}
          </span>
        </div>

        {/* Counterparty Count */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Distinct Counterparties
          </span>
          <span className="text-base font-extrabold text-sky-600 dark:text-sky-400 font-mono">
            {entity.distinct_emails_count}
          </span>
        </div>

        {/* Date Window */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Timeline Span
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono block truncate" title={`${entity.first_transaction_date} to ${entity.last_transaction_date}`}>
            {formatDisplayDate(entity.first_transaction_date).slice(0, 10)} → {formatDisplayDate(entity.last_transaction_date).slice(0, 10)}
          </span>
        </div>

        {/* Triggered Rules */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Automated Rules
          </span>
          <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {entity.distinct_rule_count} triggered
          </span>
        </div>
      </div>
    </div>
  );
};

export default EntityHeader;
