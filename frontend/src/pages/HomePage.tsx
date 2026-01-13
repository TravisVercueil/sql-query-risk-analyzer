import { useState, useEffect } from 'react';
import { ChatBox } from '../components/ChatBox';
import { MessageBubble } from '../components/MessageBubble';
import { ExampleQueries } from '../components/ExampleQueries';
import { QueryHistory } from '../components/QueryHistory';
import { queryAnalysesApi } from '../services/query-analyses.api';
import type { QueryAnalysis } from '../types';

const QUERY_HISTORY_KEY = 'sql_analyzer_query_history';
const MAX_HISTORY = 5;

export const HomePage = () => {
  const [analyses, setAnalyses] = useState<QueryAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  // Load query history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(QUERY_HISTORY_KEY);
      if (stored) {
        setQueryHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load query history:', e);
    }
  }, []);

  const handleSend = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedQuery(''); // Clear selected query

    try {
      const analysis = await queryAnalysesApi.analyzeQuery(query);
      // Replace previous analysis with the new one
      setAnalyses([analysis]);
      
      // Save to history
      try {
        const updatedHistory = [
          query,
          ...queryHistory.filter(q => q !== query)
        ].slice(0, MAX_HISTORY);
        setQueryHistory(updatedHistory);
        localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(updatedHistory));
      } catch (e) {
        console.error('Failed to save query history:', e);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze query');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExample = (query: string) => {
    setSelectedQuery(query);
  };

  const handleClearHistory = () => {
    setQueryHistory([]);
    localStorage.removeItem(QUERY_HISTORY_KEY);
  };

  return (
    <div className="min-h-screen bg-mac-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mac-panel p-6">
          <h1 className="font-chicago text-2xl font-bold mb-2">
            SQL Query Risk Analyzer
          </h1>
          <p className="text-sm text-gray-600">
            Paste your SQL query and get instant feedback on performance, scalability, and optimization recommendations.
          </p>
        </div>

        {/* Example Queries */}
        <ExampleQueries 
          onSelectQuery={handleSelectExample} 
          disabled={isLoading}
        />

        {/* Query History */}
        {queryHistory.length > 0 && (
          <QueryHistory
            queries={queryHistory}
            onSelectQuery={handleSelectExample}
            onClearHistory={handleClearHistory}
            disabled={isLoading}
          />
        )}

        {/* Chat Input */}
        <ChatBox 
          onSend={handleSend} 
          isLoading={isLoading}
          initialQuery={selectedQuery}
        />

        {/* Error Display */}
        {error && (
          <div className="mac-panel p-4 border-2 border-mac-warning bg-red-50">
            <p className="text-sm text-mac-warning font-semibold">Error: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mac-panel p-4 text-center">
            <p className="text-sm text-gray-600">Analyzing query...</p>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {analyses.map((analysis, idx) => (
            <MessageBubble key={idx} analysis={analysis} />
          ))}
        </div>

        {/* Empty State */}
        {analyses.length === 0 && !isLoading && !error && (
          <div className="mac-panel p-8 text-center">
            <p className="text-sm text-gray-500">
              Enter a SQL query above to get started with analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
