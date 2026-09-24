import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  CheckSquare,
  Square,
  MinusSquare,
  Search,
  ChevronRight,
  X,
  ShieldOff
} from 'lucide-react';
import { TransactionRecord } from '../../types/rails';
import { KeywordHighlighter } from './KeywordHighlighter';
import { formatDisplayDate } from '../../utils/dateUtils';
import { Button } from '../../components/ui/button';

// ── Alert Status Pills ─────────────────────────────────────────────────────────
type CloseStatus = 'open' | 'closed_fp' | 'closed_utr' | 'closed_rfi' | 'closed_other';

function deriveCloseStatus(alert_close_type: string): CloseStatus {
  const s = (alert_close_type || '').trim();
  if (!s || s === 'Open Alert' || s === '0') return 'open';
  if (s.startsWith('109')) return 'closed_fp';
  if (s.startsWith('110')) return 'closed_utr';
  if (s.startsWith('111')) return 'closed_rfi';
  return 'closed_other';
}

const STATUS_META: Record<CloseStatus, { label: string; className: string; dot: string }> = {
  open:         { label: 'Open',    className: 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700',             dot: 'bg-rose-500' },
  closed_fp:    { label: '109 FP', className: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700', dot: 'bg-emerald-500' },
  closed_utr:   { label: '110 UTR',className: 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700',                       dot: 'bg-sky-500' },
  closed_rfi:   { label: '111 RFI',className: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700',           dot: 'bg-amber-500' },
  closed_other: { label: 'Closed', className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600',              dot: 'bg-slate-400' },
};

interface AlertPillsProps {
  tx: TransactionRecord;
}

const AlertPills: React.FC<AlertPillsProps> = ({ tx }) => {
  const status = deriveCloseStatus(tx.alert_close_type);
  const meta = STATUS_META[status];
  const rules = tx.rule_names?.filter(Boolean) ?? [];

  // No rules at all → "No Alert" neutral chip
  if (rules.length === 0) {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
        <ShieldOff size={10} className="shrink-0" />
        <span>No Alert</span>
      </span>
    );
  }

  // One pill per rule, each carrying the close status
  return (
    <div className="flex flex-col gap-1">
      {rules.map((rule, idx) => (
        <span
          key={idx}
          title={`Rule: ${rule}\nStatus: ${tx.alert_close_type || 'Open Alert'}`}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold whitespace-nowrap max-w-[230px] ${meta.className}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
          <span className="truncate">{rule}</span>
          <span className="shrink-0 opacity-75">· {meta.label}</span>
        </span>
      ))}
    </div>
  );
};

interface TransactionTableProps {
  transactions: TransactionRecord[];
  selectedRefs: Set<string>;
  onToggleSelect: (ref: string) => void;
  onSelectAll: (refs: string[]) => void;
  onClearSelection: () => void;
  onRowClick: (tx: TransactionRecord) => void;
  onBulkResolve: (closeCode: number, label: string) => void;
  getColLabel: (key: string, fallback: string) => string;
  selectedSenderFilter?: string | null;
  onClearSenderFilter?: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  selectedRefs,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onRowClick,
  onBulkResolve,
  getColLabel,
  selectedSenderFilter,
  onClearSenderFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'status'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter
  const filteredTxns = useMemo(() => {
    return transactions.filter(tx => {
      const isOpen = !tx.alert_close_type || tx.alert_close_type === 'Open Alert' || tx.alert_close_type === '0';
      if (statusFilter === 'OPEN' && !isOpen) return false;
      if (statusFilter === 'CLOSED' && isOpen) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        tx.sender_name.toLowerCase().includes(q) ||
        tx.sender_email.toLowerCase().includes(q) ||
        tx.recipient_name.toLowerCase().includes(q) ||
        tx.recipient_email.toLowerCase().includes(q) ||
        (tx.memo && tx.memo.toLowerCase().includes(q))
      );
    });
  }, [transactions, searchQuery, statusFilter]);

  // Sort
  const sortedTxns = useMemo(() => {
    return [...filteredTxns].sort((a, b) => {
      let diff: number;
      if (sortField === 'amount') diff = a.amount - b.amount;
      else if (sortField === 'status') diff = a.alert_close_type.localeCompare(b.alert_close_type);
      else diff = String(a.transaction_date).localeCompare(String(b.transaction_date));
      return sortAsc ? diff : -diff;
    });
  }, [filteredTxns, sortField, sortAsc]);

  const handleSort = (field: 'date' | 'amount' | 'status') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const isAllSelected = sortedTxns.length > 0 && sortedTxns.every(t => selectedRefs.has(t.id));
  const isPartiallySelected = sortedTxns.some(t => selectedRefs.has(t.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      onClearSelection();
    } else {
      onSelectAll(sortedTxns.map(t => t.id));
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0B0E14] transition-colors duration-200">
      {/* Active Counterparty Drill-down Banner */}
      {selectedSenderFilter && (
        <div className="bg-sky-50 dark:bg-sky-950/60 border-b border-sky-200 dark:border-sky-800/80 px-4 py-2 flex items-center justify-between text-xs animate-in fade-in shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sky-800 dark:text-sky-300">
              Filtered by Counterparty:
            </span>
            <span className="font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-200">
              {selectedSenderFilter}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              ({transactions.length} transaction{transactions.length !== 1 ? 's' : ''})
            </span>
          </div>
          {onClearSenderFilter && (
            <button
              onClick={onClearSenderFilter}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-200 flex items-center space-x-1 cursor-pointer bg-sky-100 dark:bg-sky-900/60 hover:bg-sky-200 dark:hover:bg-sky-800/80 px-2.5 py-1 rounded-md transition-colors"
              title="Return to Counterparty Dispersion list"
            >
              <X size={13} />
              <span>Back to Counterparties</span>
            </button>
          )}
        </div>
      )}

      {/* Control Bar: Filter, Search, Bulk Actions */}
      <div className="p-3 bg-white dark:bg-[#10141E] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          {/* Quick Status Filter Tabs */}
          <div className="bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 flex text-xs">
            {(['ALL', 'OPEN', 'CLOSED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Alerts' : st === 'OPEN' ? 'Open Only' : 'Closed'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search memo, ref, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Showing {sortedTxns.length} of {transactions.length}
          </span>
        </div>

        {/* Bulk Action Controls */}
        {selectedRefs.size > 0 && (
          <div className="flex items-center space-x-2 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 px-3 py-1 rounded-xl animate-in fade-in">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-300 font-mono">
              {selectedRefs.size} Selected
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkResolve(109, 'False Positive')}
              className="text-[11px] font-semibold text-emerald-600 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 h-7"
            >
              109 (FP)
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkResolve(110, 'UTR')}
              className="text-[11px] font-semibold text-rose-600 border-rose-300 dark:border-rose-800 hover:bg-rose-50 h-7"
            >
              110 (UTR)
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkResolve(111, 'RFI')}
              className="text-[11px] font-semibold text-amber-600 border-amber-300 dark:border-amber-800 hover:bg-amber-50 h-7"
            >
              111 (RFI)
            </Button>

            <button
              onClick={onClearSelection}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 ml-1"
            >
              Deselect
            </button>
          </div>
        )}
      </div>

      {/* Forensic Ledger Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-100 dark:bg-slate-900 text-[10px] uppercase tracking-wider text-slate-500 font-mono sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 select-none">
            <tr>
              <th className="p-3 w-10 text-center">
                <button
                  onClick={handleToggleSelectAll}
                  className="cursor-pointer text-slate-500 hover:text-slate-800"
                >
                  {isAllSelected ? (
                    <CheckSquare size={16} className="text-sky-600" />
                  ) : isPartiallySelected ? (
                    <MinusSquare size={16} className="text-sky-600" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th className="p-3 cursor-pointer hover:text-sky-500" onClick={() => handleSort('date')}>
                <div className="flex items-center space-x-1">
                  <span>{getColLabel('TRX_TRAN_DATE', 'Date')}</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="p-3">Ref ID</th>
              <th className="p-3 cursor-pointer hover:text-sky-500" onClick={() => handleSort('amount')}>
                <div className="flex items-center space-x-1">
                  <span>{getColLabel('TRX_AMT1', 'Amount')}</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="p-3">{getColLabel('TRX_FREE_TEXT_8', 'Sender')}</th>
              <th className="p-3">{getColLabel('TRX_ACCT_BEN_NAME', 'Beneficiary')}</th>
              {Boolean(selectedSenderFilter) && (
                <th className="p-3">
                  <div className="flex flex-col">
                    <span>{getColLabel('TRX_OLD_VALUE', 'Security Question')}</span>
                    <span className="text-[9px] text-slate-400 font-normal lowercase tracking-normal">
                      / {getColLabel('TRX_NEW_VALUE', 'Answer')}
                    </span>
                  </div>
                </th>
              )}
              <th className="p-3">{getColLabel('TRX_SEN_MESSAGE', 'Memo / Message')}</th>
              <th className="p-3 cursor-pointer hover:text-sky-500 transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center space-x-1">
                  <span>Alert Rules / Status</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-[#10141E]">
            {sortedTxns.length === 0 ? (
              <tr>
                <td colSpan={selectedSenderFilter ? 9 : 8} className="p-8 text-center text-slate-400">
                  No records match current criteria.
                </td>
              </tr>
            ) : (
              sortedTxns.map((tx) => {
                const isSelected = selectedRefs.has(tx.id);

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onRowClick(tx)}
                    className={`hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-colors cursor-pointer border-l-4 ${
                      isSelected
                        ? 'border-l-sky-500 bg-sky-50/80 dark:bg-sky-950/40'
                        : 'border-l-transparent'
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="p-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(tx.id);
                      }}
                    >
                      <button className="cursor-pointer text-slate-400 hover:text-sky-600">
                        {isSelected ? (
                          <CheckSquare size={15} className="text-sky-600" />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {formatDisplayDate(tx.transaction_date).slice(0, 16)}
                    </td>

                    {/* Ref */}
                    <td className="p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[130px]" title={tx.id}>
                      {tx.id}
                    </td>

                    {/* Amount */}
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      ${tx.amount.toFixed(2)}
                    </td>

                    {/* Sender */}
                    <td className="p-3 max-w-[160px]" title={`${tx.sender_name} (${tx.sender_email})`}>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        <KeywordHighlighter text={tx.sender_name} />
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        <KeywordHighlighter text={tx.sender_email} />
                      </span>
                    </td>

                    {/* Beneficiary */}
                    <td className="p-3 max-w-[160px]" title={`${tx.recipient_name} (${tx.recipient_email})`}>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        <KeywordHighlighter text={tx.recipient_name} />
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        <KeywordHighlighter text={tx.recipient_email} />
                      </span>
                    </td>

                    {/* Security Question & Answer (When filtered by counterparty) */}
                    {Boolean(selectedSenderFilter) && (
                      <td className="p-3 max-w-[200px] truncate" title={`Q: ${tx.sec_question || 'N/A'}\nA: ${tx.sec_answer || 'N/A'}`}>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate font-mono text-[11px]">
                          {tx.sec_question ? (
                            <KeywordHighlighter text={tx.sec_question} />
                          ) : (
                            <span className="text-slate-400 font-normal italic">None / Direct</span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                          {tx.sec_answer ? (
                            <>
                              <span className="text-sky-600 dark:text-sky-400 font-semibold mr-1">Ans:</span>
                              <KeywordHighlighter text={tx.sec_answer} />
                            </>
                          ) : (
                            <span className="text-slate-400 font-normal italic">—</span>
                          )}
                        </span>
                      </td>
                    )}

                    {/* Memo */}
                    <td className="p-3 max-w-[220px] truncate font-mono text-[11px]" title={tx.memo || ''}>
                      <KeywordHighlighter text={tx.memo} />
                    </td>

                    {/* Alert Rules / Status Pills */}
                    <td className="p-3">
                      <AlertPills tx={tx} />
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

export default TransactionTable;
