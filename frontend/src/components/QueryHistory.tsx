import { Clock, X } from 'lucide-react';

interface QueryHistoryProps {
  queries: string[];
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
  disabled?: boolean;
}

export const QueryHistory = ({ 
  queries, 
  onSelectQuery, 
  onClearHistory,
  disabled 
}: QueryHistoryProps) => {
  if (queries.length === 0) {
    return null;
  }

  return (
    <div className="mac-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-600" />
          <h3 className="font-chicago font-semibold text-sm">Recent Queries</h3>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
          title="Clear history"
        >
          <X size={12} />
          Clear
        </button>
      </div>
      <div className="space-y-1">
        {queries.map((query, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuery(query)}
            disabled={disabled}
            className="w-full text-left mac-button p-2 text-xs font-mono hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors truncate"
            title={query}
          >
            {query.length > 60 ? `${query.substring(0, 60)}...` : query}
          </button>
        ))}
      </div>
    </div>
  );
};
