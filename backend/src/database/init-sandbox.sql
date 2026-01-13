-- Sandbox database for SQL query pattern analysis
-- This database is used ONLY for parsing queries with EXPLAIN
-- It does NOT contain your actual data - we analyze query patterns generically
-- 
-- The sandbox is kept minimal. If your query references tables that don't exist here,
-- the tool will use EXPLAIN (without ANALYZE) which still provides execution plan structure.

-- Note: This is intentionally minimal. The tool analyzes query patterns,
-- not specific data. Tables referenced in user queries may not exist here,
-- and that's expected and handled gracefully.
