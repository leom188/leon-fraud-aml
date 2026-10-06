import React, { useState, useMemo } from 'react';
import { Mail, ArrowUpDown, User, ChevronRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { CounterpartyStat, TransactionRecord } from '../../types/rails';
import { formatDisplayDate } from '../../utils/dateUtils';
import { hasAlert, isOpenAlert } from '../../utils/alertUtils';

interface SenderDrilldownViewProps {
  counterparties: CounterpartyStat[];
  transactions: TransactionRecord[];
  totalClusterVolume: number;
  totalClusterTxns?: number;
  selectedSenderEmail: string | null;
  onSelectSender: (email: string | null) => void;
  direction?: string;
}

type SortField = 'email' | 'volume' | 'txns' | 'avg' | 'first_seen' | 'status';

/** Derive per-counterparty alert status from the live transaction list */
function cpAlertStatus(email: string, transactions: TransactionRecord[]): 'open' | 'resolved' | 'no_alert' {
  const lc = email.toLowerCase().trim();
  const related = transactions.filter(
    tx =>
      tx.sender_email?.toLowerCase().trim() === lc ||
      tx.sender_name?.toLowerCase().trim() === lc ||
      tx.recipient_email?.toLowerCase().trim() === lc ||
      tx.recipient_name?.toLowerCase().trim() === lc
  );
  if (related.length === 0) return 'no_alert';

  // Only transactions that triggered alerts define open/resolved status
  const alerted = related.filter(hasAlert);
  if (alerted.length === 0) return 'no_alert';

  const hasOpen = alerted.some(isOpenAlert);
  return hasOpen ? 'open' : 'resolved';
}

export const SenderDrilldownView: React.FC<SenderDrilldownViewProps> = ({
  counterparties,
  transactions = [],
  totalClusterVolume,
  selectedSenderEmail,
  onSelectSender,
  direction = 'Incoming'
}) => {
  const [sortField, setSortField] = useState<SortField>('volume');
  const [sortAsc, setSortAsc] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const isOutgoing = direction === 'Outgoing';

  // Enrich each counterparty with its live alert status
  const enriched = useMemo(() =>
    counterparties.map(cp => ({
      ...cp,
      alertStatus: cpAlertStatus(cp.email, transactions)
    })),
    [counterparties, transactions]
  );

  // Exclude counterparties that have NO alerts at all — this drilldown is strictly for alert triage
  const withAlerts = useMemo(() =>
    enriched.filter(cp => cp.alertStatus !== 'no_alert'),
    [enriched]
  );

  const resolvedCount = withAlerts.filter(cp => cp.alertStatus === 'resolved').length;
  const openCount = withAlerts.filter(cp => cp.alertStatus === 'open').length;

  // By default, ONLY show senders/payees with open alerts
  const filtered = useMemo(() =>
    showResolved ? withAlerts : withAlerts.filter(cp => cp.alertStatus === 'open'),
    [withAlerts, showResolved]
  );

  const sortedList = useMemo(() => [...filtered].sort((a, b) => {
    let diff: number;
    if (sortField === 'email') {
      diff = a.email.localeCompare(b.email);
    } else if (sortField === 'volume') {
      diff = a.volume - b.volume;
    } else if (sortField === 'txns') {
      diff = a.txns - b.txns;
    } else if (sortField === 'avg') {
      const avgA = a.txns > 0 ? a.volume / a.txns : 0;
      const avgB = b.txns > 0 ? b.volume / b.txns : 0;
      diff = avgA - avgB;
    } else if (sortField === 'status') {
      // open first
      const order = { open: 0, no_alert: 1, resolved: 2 };
      diff = order[a.alertStatus] - order[b.alertStatus];
    } else {
      diff = String(a.first_seen).localeCompare(String(b.first_seen));
    }
    return sortAsc ? diff : -diff;
  }), [filtered, sortField, sortAsc]);

  const handleHeaderClick = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="p-3 cursor-pointer hover:text-sky-500 transition-colors"
      onClick={() => handleHeaderClick(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown size={12} />
      </div>
    </th>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background transition-colors duration-200">
      {/* Header Banner */}
      <div className="p-4 bg-card border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Mail size={16} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Counterparty Dispersion Drilldown</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {openCount} with open alerts{resolvedCount > 0 ? ` · ${resolvedCount} resolved` : ''}.
            Click any row to view its transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Show Resolved Toggle — only present when resolved counterparties exist */}
          {resolvedCount > 0 && (
            <button
              onClick={() => setShowResolved(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                showResolved
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              title={showResolved ? 'Hide resolved counterparties' : `Show ${resolvedCount} resolved counterpart${resolvedCount !== 1 ? 'ies' : 'y'}`}
            >
              {showResolved ? <Eye size={12} /> : <EyeOff size={12} />}
              <span>
                {showResolved ? 'Hide Resolved' : `Show Resolved (${resolvedCount})`}
              </span>
            </button>
          )}

          {selectedSenderEmail && (
            <button
              onClick={() => onSelectSender(null)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100 dark:bg-slate-900 text-[11px] uppercase tracking-wider text-slate-500 font-mono sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <SortableHeader field="email" label={isOutgoing ? "Payee Email / ID" : "Sender Email / ID"} />
              <SortableHeader field="status" label="Status" />
              <SortableHeader field="volume" label="Aggregated Volume" />
              <th className="p-3">% of Cluster Vol</th>
              <SortableHeader field="txns" label="Tx Count" />
              <SortableHeader field="avg" label="Avg / Tx" />
              <SortableHeader field="first_seen" label="First Observed" />
              <th className="w-8 p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-card">
            {sortedList.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-slate-400 text-xs">
                  {resolvedCount > 0 && !showResolved
                    ? `All ${resolvedCount} counterpart${resolvedCount !== 1 ? 'ies' : 'y'} with alerts have been resolved — toggle "Show Resolved" to review them.`
                    : 'No counterparties with open alerts found.'}
                </td>
              </tr>
            ) : (
              sortedList.map((cp) => {
                const isSelected = selectedSenderEmail === cp.email;
                const isResolved = cp.alertStatus === 'resolved';
                const pctOfVol = totalClusterVolume > 0
                  ? ((cp.volume / totalClusterVolume) * 100).toFixed(1)
                  : '0.0';
                const avgTx = cp.txns > 0 ? cp.volume / cp.txns : 0;

                return (
                  <tr
                    key={cp.email}
                    onClick={() => onSelectSender(cp.email)}
                    title={isResolved ? `All alerts resolved for ${cp.email}` : `Click to view transaction details for ${cp.email}`}
                    className={`group cursor-pointer transition-colors ${
                      isResolved
                        ? 'opacity-50 hover:opacity-80'
                        : 'hover:bg-sky-50/80 dark:hover:bg-sky-950/30'
                    } ${isSelected ? 'bg-sky-50 dark:bg-sky-950/40 font-semibold' : ''}`}
                  >
                    {/* Email */}
                    <td className="p-3 font-mono text-slate-900 dark:text-slate-100">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                          isResolved
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500'
                            : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/50 text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400'
                        }`}>
                          {isResolved ? <CheckCircle2 size={12} /> : <User size={12} />}
                        </div>
                        <span
                          className={`truncate max-w-[260px] transition-colors ${
                            isResolved
                              ? 'text-slate-500 dark:text-slate-500 line-through decoration-slate-400'
                              : 'group-hover:text-sky-600 dark:group-hover:text-sky-400'
                          }`}
                          title={cp.email}
                        >
                          {cp.email}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3">
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 size={9} />
                          Resolved
                        </span>
                      ) : cp.alertStatus === 'open' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Open Alerts
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                          No Alert
                        </span>
                      )}
                    </td>

                    {/* Volume */}
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      ${cp.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* % of cluster volume */}
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isResolved ? 'bg-emerald-400' : 'bg-sky-500'}`}
                            style={{ width: `${Math.min(100, Number(pctOfVol))}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono">{pctOfVol}%</span>
                      </div>
                    </td>

                    {/* Tx Count */}
                    <td className="p-3 font-mono">
                      {cp.txns}
                    </td>

                    {/* Avg / Tx */}
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-200">
                      ${avgTx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* First Seen */}
                    <td className="p-3 text-slate-500 font-mono">
                      {formatDisplayDate(cp.first_seen).slice(0, 10)}
                    </td>

                    {/* Chevron */}
                    <td className="p-3 text-right text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SenderDrilldownView;
