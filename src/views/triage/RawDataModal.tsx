import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../../components/ui/dialog';
import { Database, Search, Copy, Check } from 'lucide-react';
import { GroupedEntity } from '../../types/rails';

interface RawDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: GroupedEntity | null;
}

export const RawDataModal: React.FC<RawDataModalProps> = ({
  isOpen,
  onClose,
  entity
}) => {
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');

  if (!entity) return null;

  const rawRows = entity.transactions.map(t => t.raw_record || t);

  const filteredRows = rawRows.filter(r => {
    if (!search.trim()) return true;
    return JSON.stringify(r).toLowerCase().includes(search.toLowerCase());
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(rawRows, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-popover border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-sky-600">
            <Database size={18} />
            <DialogTitle className="text-base font-bold">
              Raw Audit Records: {entity.grouping_key}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Direct view of {rawRows.length} unmutated ingestion rows exactly as received.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search raw values..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
              />
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy All Raw Records'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-auto max-h-96 border border-slate-800">
            {JSON.stringify(filteredRows, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RawDataModal;
