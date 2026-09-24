import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldAlert, Network, ChevronRight, Users } from 'lucide-react';
import { GroupedEntity, TransactionDirection } from '../../types/rails';
import { Badge } from '../../components/ui/badge';

interface EntitySidebarProps {
  entities: GroupedEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  getColLabel: (key: string, fallback: string) => string;
}

export const EntitySidebar: React.FC<EntitySidebarProps> = ({
  entities,
  selectedId,
  onSelect,
  getColLabel
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'ALL' | TransactionDirection>('ALL');

  const filteredEntities = useMemo(() => {
    return entities.filter(e => {
      const matchesDir = directionFilter === 'ALL' || e.transaction_direction === directionFilter;
      if (!matchesDir) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.grouping_key.toLowerCase().includes(q) ||
        e.client_name.toLowerCase().includes(q) ||
        e.customer_account.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      );
    });
  }, [entities, searchQuery, directionFilter]);

  const criticalCount = entities.filter(e => e.risk_level === 'Critical').length;

  return (
    <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10141E] flex flex-col shrink-0 select-none transition-colors duration-200">
      {/* Top Header & Search */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network size={16} className="text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Entity Clusters ({entities.length})
            </span>
          </div>
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              {criticalCount} Critical
            </span>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter entities, emails, accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Direction Filter Pills */}
        <div className="flex space-x-1 pt-0.5">
          {(['ALL', 'Incoming', 'Outgoing'] as const).map(dir => (
            <button
              key={dir}
              onClick={() => setDirectionFilter(dir)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                directionFilter === dir
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {dir === 'ALL' ? 'All Rails' : dir}
            </button>
          ))}
        </div>
      </div>

      {/* Cluster Tree List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
        {filteredEntities.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No matching entities found.
          </div>
        ) : (
          filteredEntities.map((entity) => {
            const isSelected = selectedId === entity.id;
            const isCritical = entity.risk_level === 'Critical';
            const isElevated = entity.risk_level === 'Elevated';

            return (
              <button
                key={entity.id}
                onClick={() => onSelect(entity.id)}
                className={`w-full text-left p-3 transition-all cursor-pointer flex flex-col space-y-1.5 relative ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-l-4 border-sky-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                {/* Title & Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[170px]" title={entity.grouping_key}>
                    {entity.grouping_key}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        : isElevated
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {entity.risk_level}
                  </span>
                </div>

                {/* Parent Client & Direction */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[150px]">{entity.client_name}</span>
                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                    {entity.transaction_direction}
                  </span>
                </div>

                {/* Metrics Footer */}
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800/40 text-slate-600 dark:text-slate-400">
                  <span className="font-mono">
                    {entity.transaction_count} txns
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${entity.total_amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EntitySidebar;
