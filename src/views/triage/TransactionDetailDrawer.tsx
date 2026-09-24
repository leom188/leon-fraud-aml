import React, { useState } from 'react';
import { X, FileText, CheckCircle, ShieldAlert, Copy, Check, Code, List } from 'lucide-react';
import { TransactionRecord } from '../../types/rails';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { KeywordHighlighter } from './KeywordHighlighter';
import { formatDisplayDate } from '../../utils/dateUtils';

interface TransactionDetailDrawerProps {
  transaction: TransactionRecord | null;
  onClose: () => void;
  onResolve: (txRef: string, closeCode: number, label: string) => void;
  getColLabel: (key: string, fallback: string) => string;
}

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  transaction,
  onClose,
  onResolve,
  getColLabel
}) => {
  const [activeTab, setActiveTab] = useState<'decoded' | 'raw'>('decoded');
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(transaction.raw_record || transaction, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-white dark:bg-[#10141E] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300 animate-in slide-in-from-right">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText size={16} className="text-sky-600 dark:text-sky-400" />
          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 font-mono">
            TX: {transaction.id}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tab Toggle */}
          <div className="bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 flex text-xs">
            <button
              onClick={() => setActiveTab('decoded')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                activeTab === 'decoded' ? 'bg-white dark:bg-slate-800 text-sky-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Decoded
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                activeTab === 'raw' ? 'bg-white dark:bg-slate-800 text-sky-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Raw Row
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {activeTab === 'decoded' ? (
          <>
            {/* Amount & Status Hero */}
            <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Amount ({transaction.currency})
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  ${transaction.amount.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Status
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono">
                  {transaction.transaction_status}
                </span>
              </div>
            </div>

            {/* Counterparty Block */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Counterparty Details
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">{getColLabel('TRX_FREE_TEXT_8', 'Sender Name')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    <KeywordHighlighter text={transaction.sender_name} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{getColLabel('TRX_FREE_TEXT_3', 'Sender Email')}:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">
                    <KeywordHighlighter text={transaction.sender_email} />
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800/60">
                  <span className="text-slate-500">{getColLabel('TRX_ACCT_BEN_NAME', 'Beneficiary')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    <KeywordHighlighter text={transaction.recipient_name} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{getColLabel('TRX_BEN_ACCT_NUM', 'Recipient Email')}:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">
                    <KeywordHighlighter text={transaction.recipient_email} />
                  </span>
                </div>
              </div>
            </div>

            {/* Forensic Memo & Security Details */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Forensic & Security Tokens
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2.5">
                <div>
                  <span className="text-slate-500 block mb-0.5">{getColLabel('TRX_SEN_MESSAGE', 'Message / Memo')}:</span>
                  <div className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono">
                    <KeywordHighlighter text={transaction.memo} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block mb-0.5">{getColLabel('TRX_OLD_VALUE', 'Security Question')}:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      <KeywordHighlighter text={transaction.sec_question} />
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">{getColLabel('TRX_NEW_VALUE', 'Security Answer')}:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      <KeywordHighlighter text={transaction.sec_answer} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Banking & Network Headers */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Banking & Network Identifiers
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Interac Session ID:</span>
                  <span className="text-slate-800 dark:text-slate-200">{transaction.interac_ref1 || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operator Code:</span>
                  <span className="text-slate-800 dark:text-slate-200">{transaction.operator_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Auto-Deposit Flag:</span>
                  <span className="text-slate-800 dark:text-slate-200">{transaction.autodeposit_flag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client Entity:</span>
                  <span className="text-slate-800 dark:text-slate-200">{transaction.client_name} ({transaction.client_id})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Date:</span>
                  <span className="text-slate-800 dark:text-slate-200">{formatDisplayDate(transaction.transaction_date)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">Raw JSON Payload</span>
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1 text-xs text-sky-600 hover:text-sky-500 font-semibold"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-auto max-h-[500px]">
              {JSON.stringify(transaction.raw_record || transaction, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Drawer Action Footer: Instant Alert Disposition */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Quick Disposition
        </span>
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onResolve(transaction.id, 109, 'False Positive')}
            className="text-[11px] font-semibold text-emerald-600 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            109 (FP)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onResolve(transaction.id, 110, 'UTR')}
            className="text-[11px] font-semibold text-rose-600 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            110 (UTR)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onResolve(transaction.id, 111, 'RFI')}
            className="text-[11px] font-semibold text-amber-600 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          >
            111 (RFI)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailDrawer;
