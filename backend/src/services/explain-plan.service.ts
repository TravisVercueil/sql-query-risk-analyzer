import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const sandboxPool = new Pool({
  connectionString: process.env.SANDBOX_DATABASE_URL || process.env.DATABASE_URL,
  statement_timeout: 30000, // 30 seconds
  query_timeout: 30000,
});

export interface ExecutionPlan {
  totalCost: number;
  executionTime?: number;
  plan: any;
  rows?: number;
  actualRows?: number;
}

export const explainPlanService = {
  async getExplainPlan(query: string): Promise<ExecutionPlan> {
    const client = await sandboxPool.connect();
    
    try {
      // First, try EXPLAIN ANALYZE (may fail on some queries)
      let explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
      let result;

      try {
        result = await client.query(explainQuery);
      } catch (error) {
        // Fallback to EXPLAIN without ANALYZE if query execution fails
        // This happens when tables don't exist in sandbox - that's OK, we just need the plan structure
        explainQuery = `EXPLAIN (FORMAT JSON) ${query}`;
        try {
          result = await client.query(explainQuery);
        } catch (planError) {
          // If even EXPLAIN fails, the query likely references non-existent tables
          // This is expected - we're analyzing query patterns, not executing against real data
          throw new Error(
            'Query could not be parsed. This may be because the tables referenced in your query do not exist in the analysis sandbox. ' +
            'The tool analyzes query patterns generically - ensure your query uses valid SQL syntax.'
          );
        }
      }

      // PostgreSQL returns EXPLAIN JSON in a specific format
      // The result.rows[0] contains an object with a key that varies
      const row = result.rows[0];
      let planData;
      
      // Handle different possible key names
      if (row['QUERY PLAN']) {
        planData = row['QUERY PLAN'];
      } else if (row['query plan']) {
        planData = row['query plan'];
      } else {
        // Try to get the first value
        planData = Object.values(row)[0];
      }

      // Parse if it's a string, or use directly if it's already parsed
      let plan;
      if (typeof planData === 'string') {
        plan = JSON.parse(planData);
      } else {
        plan = planData;
      }

      // Handle array format
      if (Array.isArray(plan)) {
        plan = plan[0];
      }

      if (!plan || !plan.Plan) {
        throw new Error('Invalid execution plan returned');
      }

      const rootPlan = plan.Plan;
      const totalCost = this.extractTotalCost(rootPlan);
      const executionTime = plan['Execution Time'];
      const rows = rootPlan['Plan Rows'];
      const actualRows = rootPlan['Actual Rows'];

      return {
        totalCost,
        executionTime,
        plan: rootPlan,
        rows,
        actualRows
      };
    } finally {
      client.release();
    }
  },

  extractTotalCost(plan: any): number {
    if (plan['Total Cost']) {
      return plan['Total Cost'];
    }

    // Recursively sum costs from child plans
    let cost = plan['Startup Cost'] || 0;
    
    if (plan['Plans']) {
      for (const childPlan of plan['Plans']) {
        cost += this.extractTotalCost(childPlan);
      }
    }

    return cost;
  }
};
