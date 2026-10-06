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

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col shrink-0 select-none transition-colors duration-200">
      {/* Top Header & Search */}
      <div className="p-3 border-b border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network size={16} className="text-primary" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Entity Clusters ({entities.length})
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter entities, emails, accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Direction Filter Pills */}
        <div className="flex space-x-1 pt-0.5">
          {(['ALL', 'Incoming', 'Outgoing'] as const).map(dir => (
            <button
              key={dir}
              onClick={() => setDirectionFilter(dir)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                directionFilter === dir
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              {dir === 'ALL' ? 'All Rails' : dir}
            </button>
          ))}
        </div>
      </div>

      {/* Cluster Tree List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {filteredEntities.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No matching entities found.
          </div>
        ) : (
          filteredEntities.map((entity) => {
            const isSelected = selectedId === entity.id;
            return (
              <button
                key={entity.id}
                onClick={() => onSelect(entity.id)}
                className={`w-full text-left p-3 transition-all cursor-pointer flex flex-col space-y-1.5 relative ${
                  isSelected
                    ? 'bg-accent border-l-4 border-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                {/* Title & Direction */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[190px]" title={entity.grouping_key}>
                    {entity.grouping_key}
                  </span>
                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                    {entity.transaction_direction}
                  </span>
                </div>

                {/* Parent Client */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {entity.client_name}
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
