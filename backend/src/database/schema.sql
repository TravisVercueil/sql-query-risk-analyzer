-- Metadata database schema for SQL Query Risk & Cost Analyzer
-- This database stores analysis history and metadata (optional feature)

CREATE TABLE IF NOT EXISTS query_analyses (
  id SERIAL PRIMARY KEY,
  query_hash VARCHAR(64) NOT NULL,
  query_text TEXT NOT NULL,
  total_cost DECIMAL(10, 2),
  execution_time_ms DECIMAL(10, 2),
  risk_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_query_analyses_hash ON query_analyses(query_hash);
CREATE INDEX IF NOT EXISTS idx_query_analyses_created_at ON query_analyses(created_at);
