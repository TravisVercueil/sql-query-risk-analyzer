import type { QueryAnalysis } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const queryAnalysesApi = {
  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    const response = await fetch(`${API_BASE_URL}/query-analyses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.message || 'Failed to analyze query');
    }

    return response.json();
  }
};
