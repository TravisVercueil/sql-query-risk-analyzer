import { useState } from 'react';
import { Database } from 'lucide-react';

interface ExampleQueriesProps {
  onSelectQuery: (query: string) => void;
  disabled?: boolean;
}

const exampleQueries = [
  {
    title: 'Simple Lookup',
    query: "SELECT * FROM users WHERE email = 'user@example.com';",
    description: 'Basic WHERE clause lookup'
  },
  {
    title: 'Join Query',
    query: `SELECT u.name, o.total_amount 
FROM users u 
JOIN orders o ON u.id = o.user_id 
WHERE o.status = 'completed';`,
    description: 'Join with WHERE filter'
  },
  {
    title: 'Aggregation',
    query: `SELECT 
  category,
  COUNT(*) as total,
  AVG(price) as avg_price
FROM products
GROUP BY category
ORDER BY total DESC;`,
    description: 'GROUP BY with aggregation'
  },
  {
    title: 'Complex Join',
    query: `SELECT 
  p.name,
  SUM(oi.quantity) as total_sold,
  SUM(oi.quantity * oi.price) as revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY revenue DESC
LIMIT 10;`,
    description: 'Multiple joins with aggregation'
  }
];

export const ExampleQueries = ({ onSelectQuery, disabled }: ExampleQueriesProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        disabled={disabled}
        className="mac-button text-sm px-3 py-2 flex items-center gap-2 disabled:opacity-50"
      >
        <Database size={16} />
        Show Example Queries
      </button>
    );
  }

  return (
    <div className="mac-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-chicago font-semibold text-sm">Example Queries</h3>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs text-gray-600 hover:text-gray-900"
        >
          Hide
        </button>
      </div>
      <div className="space-y-2">
        {exampleQueries.map((example, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              onSelectQuery(example.query);
              setExpanded(false);
            }}
            disabled={disabled}
            className="mac-panel p-3 text-left w-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div className="font-semibold text-sm mb-1">{example.title}</div>
            <div className="text-xs text-gray-600 mb-2">{example.description}</div>
            <pre className="text-xs font-mono bg-gray-50 border border-gray-300 p-2 overflow-x-auto">
              {example.query}
            </pre>
          </button>
        ))}
      </div>
    </div>
  );
};
