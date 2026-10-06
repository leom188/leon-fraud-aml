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
import { StatTile } from '../../components/ui/stat-tile';
import { formatDisplayDate } from '../../utils/dateUtils';
import { isOpenAlert } from '../../utils/alertUtils';

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
  // Count counterparties with open alerts
  const openCounterpartiesCount = React.useMemo(() => {
    const isOut = entity.transaction_direction === 'Outgoing';
    const openSet = new Set<string>();
    entity.transactions.forEach(tx => {
      if (isOpenAlert(tx)) {
        const cp = isOut
          ? (tx.recipient_email || tx.recipient_name)
          : (tx.sender_email || tx.sender_name);
        if (cp) openSet.add(cp.toLowerCase().trim());
      }
    });
    return openSet.size;
  }, [entity]);

  return (
    <div className="bg-card border-b border-slate-200 dark:border-slate-800 p-5 space-y-4 shrink-0 transition-colors duration-200">
      {/* Top Bar: Cluster Identity & Fast Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
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
              Counterparties ({openCounterpartiesCount})
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
            className="text-xs font-semibold"
          >
            <Sparkles size={13} className="mr-1.5" />
            AI Typology Dossier
          </Button>
        </div>
      </div>

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Volume */}
        <StatTile
          label="Total cluster volume"
          value={`$${entity.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />

        {/* Transaction Count */}
        <StatTile
          label="Transaction count"
          value={entity.transaction_count.toLocaleString()}
        />

        {/* Average Ticket */}
        <StatTile
          label="Average amount"
          value={`$${(entity.total_amount / Math.max(1, entity.transaction_count)).toFixed(2)}`}
        />

        {/* Counterparty Count */}
        <StatTile
          label="Distinct counterparties"
          value={entity.distinct_emails_count}
        />

        {/* Date Window */}
        <StatTile
          label="Timeline span"
          value={
            <span
              className="truncate block"
              title={`${entity.first_transaction_date} to ${entity.last_transaction_date}`}
            >
              {formatDisplayDate(entity.first_transaction_date).slice(0, 10)} → {formatDisplayDate(entity.last_transaction_date).slice(0, 10)}
            </span>
          }
          valueClassName="text-xs font-medium"
        />

        {/* Triggered Rules */}
        <StatTile
          label="Automated rules"
          tone="risk"
          value={`${entity.distinct_rule_count} triggered`}
        />
      </div>
    </div>
  );
};

export default EntityHeader;
