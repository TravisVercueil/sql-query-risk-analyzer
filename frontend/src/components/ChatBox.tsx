import { useState, useEffect, useCallback } from 'react';
import { Send, AlertCircle, X } from 'lucide-react';
import { queryValidator } from '../utils/query-validator';

interface ChatBoxProps {
  onSend: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

export const ChatBox = ({ onSend, isLoading, initialQuery }: ChatBoxProps) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Real-time validation (only show error after user starts typing)
    if (newQuery.trim().length > 0) {
      const validation = queryValidator.validate(newQuery);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid query');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  };

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!query.trim() || isLoading) {
      return;
    }

    // Final validation before sending
    const validation = queryValidator.validate(query);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid query');
      return;
    }

    setValidationError(null);
    onSend(query.trim());
    setQuery('');
  }, [query, isLoading, onSend]);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const textarea = document.querySelector('textarea');
      if (textarea && document.activeElement === textarea && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <form onSubmit={handleSubmit} className="mac-panel p-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={query}
              onChange={handleChange}
              placeholder="Enter your SQL query here (e.g., SELECT * FROM users WHERE id = 1)..."
              className={`mac-input w-full min-h-[120px] font-mono text-sm resize-none pr-8 ${
                validationError ? 'border-mac-warning' : ''
              }`}
              disabled={isLoading}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setValidationError(null);
                }}
                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
                title="Clear query"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={isLoading || !query.trim() || !!validationError}
              className="mac-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Send size={16} />
              Send
            </button>
            <div className="text-xs text-gray-500 text-center">
              Ctrl+Enter
            </div>
          </div>
        </div>
        {validationError && (
          <div className="flex items-start gap-2 text-sm text-mac-warning bg-red-50 border border-mac-warning p-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>
    </form>
  );
};
