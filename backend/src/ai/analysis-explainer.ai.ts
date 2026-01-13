import OpenAI from 'openai';
import dotenv from 'dotenv';
import type { 
  QueryAnalysis, 
  Verdict,
  ConfidenceLevel
} from '../services/query-analyses.service';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analysisExplainerService = {
  async explainAnalysis(
    query: string
  ): Promise<QueryAnalysis> {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to basic analysis without AI
      return this.generateBasicAnalysis(query);
    }

    try {
      const prompt = this.buildPrompt(query);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a senior database engineer analyzing SQL query performance. 
            Analyze the query structure and predict performance at various scales.
            Be specific, actionable, and reference the actual table and column names from the user's query.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const analysis = JSON.parse(content);
      return this.validateAndFormatAnalysis(analysis);
    } catch (error) {
      console.error('AI analysis failed, falling back to basic analysis:', error);
      return this.generateBasicAnalysis(query);
    }
  },

  buildPrompt(query: string): string {
    return `You are a senior database engineer analyzing a SQL query.

Analyze this SQL query and provide a JSON response with the following EXACT structure:

{
  "verdict": "SAFE_FOR_NOW|RISKY|CRITICAL|OPTIMAL",
  "headline": "One sentence summary of the query's performance status",
  "primaryRisk": {
    "issue": "e.g., 'Sequential scan on orders table', 'No index on user_id column', 'Cartesian product in JOIN'",
    "whyItMatters": "Why this is a problem and what happens if not addressed",
    "estimatedRiskAt": "e.g., '500k+ rows', '100k+ rows', 'Current scale'"
  },
  "recommendedFix": {
    "action": "Specific actionable fix (e.g., 'Add index on orders.user_id')",
    "impact": "What will improve after implementing this fix"
  },
  "confidence": {
    "level": "HIGH|MEDIUM|LOW",
    "reason": "Why you're confident or not confident in this analysis"
  },
  "nextStep": "Specific next action for the user (e.g., 'Re-run EXPLAIN ANALYZE after adding the index', 'Monitor query performance as table grows')"
}

SQL Query to Analyze:
\`\`\`sql
${query}
\`\`\`

Analysis Guidelines:
- Verdict: SAFE_FOR_NOW = works fine now but may degrade, RISKY = performance issues likely, CRITICAL = immediate problems, OPTIMAL = well-optimized
- Headline: One clear sentence that captures the essence
- Primary Risk: Focus on the single most important issue
- Recommended Fix: One specific, actionable fix (include SQL if creating an index)
- Confidence: Based on how clear the query structure is
- Next Step: What the user should do next

IMPORTANT: Reference the actual table and column names from the user's query. Be specific about THEIR tables and columns.

Provide the JSON response now.`;
  },


  validateAndFormatAnalysis(analysis: any): QueryAnalysis {
    const validVerdicts: Verdict[] = ['SAFE_FOR_NOW', 'RISKY', 'CRITICAL', 'OPTIMAL'];
    const validConfidenceLevels: ConfidenceLevel[] = ['HIGH', 'MEDIUM', 'LOW'];
    
    return {
      verdict: validVerdicts.includes(analysis.verdict) ? analysis.verdict : 'RISKY',
      headline: analysis.headline || 'Query analysis completed',
      primaryRisk: analysis.primaryRisk || {
        issue: 'Unknown issue',
        whyItMatters: 'Unable to determine',
        estimatedRiskAt: 'Unknown'
      },
      recommendedFix: analysis.recommendedFix || {
        action: 'Review query structure',
        impact: 'Improve query performance'
      },
      confidence: {
        level: (analysis.confidence?.level && validConfidenceLevels.includes(analysis.confidence.level)) 
          ? analysis.confidence.level 
          : 'MEDIUM',
        reason: analysis.confidence?.reason || 'Analysis based on query structure'
      },
      nextStep: analysis.nextStep || 'Review the query and consider optimizations'
    };
  },

  generateBasicAnalysis(
    query: string
  ): QueryAnalysis {
    // Basic query structure analysis
    const upperQuery = query.toUpperCase();
    const hasWhere = upperQuery.includes('WHERE');
    const hasJoin = upperQuery.includes('JOIN');
    const hasSelectStar = !!upperQuery.match(/SELECT\s+\*/);
    
    // Extract table name for context
    const fromMatch = query.match(/FROM\s+(\w+)/i);
    const tableName = fromMatch ? fromMatch[1] : 'table';
    
    // Determine verdict and risk
    let verdict: Verdict = 'SAFE_FOR_NOW';
    let issue = '';
    let whyItMatters = '';
    let estimatedRiskAt = '';
    let action = '';
    let impact = '';
    
    if (!hasWhere) {
      verdict = 'RISKY';
      issue = `Sequential scan on ${tableName} (no WHERE clause)`;
      whyItMatters = 'Execution time grows linearly with table size - will scan all rows';
      estimatedRiskAt = '50k+ rows';
      action = 'Add WHERE clause to filter rows';
      impact = 'Eliminates full table scan and reduces rows examined';
    } else if (hasSelectStar) {
      verdict = 'SAFE_FOR_NOW';
      issue = `SELECT * retrieves all columns from ${tableName}`;
      whyItMatters = 'Retrieves unnecessary data, increasing memory and network overhead';
      estimatedRiskAt = '100k+ rows';
      action = 'Replace SELECT * with specific column names';
      impact = 'Reduces data transfer and improves query efficiency';
    } else {
      verdict = 'SAFE_FOR_NOW';
      issue = `Query structure looks reasonable but may need indexes`;
      whyItMatters = 'Performance depends on whether indexes exist on filtered/joined columns';
      estimatedRiskAt = '500k+ rows';
      action = 'Ensure indexes exist on WHERE and JOIN clause columns';
      impact = 'Enables index scans instead of sequential scans';
    }

    return {
      verdict,
      headline: !hasWhere 
        ? `Risky query - will scan entire ${tableName} table without filtering`
        : hasSelectStar
        ? `Safe for now, but SELECT * may cause issues as data grows`
        : `Query structure looks reasonable`,
      primaryRisk: {
        issue,
        whyItMatters,
        estimatedRiskAt
      },
      recommendedFix: {
        action,
        impact
      },
      confidence: {
        level: 'MEDIUM' as ConfidenceLevel,
        reason: 'Analysis based on query structure only - actual performance depends on indexes and data distribution'
      },
      nextStep: !hasWhere 
        ? `Add WHERE clause to filter rows, then re-analyze`
        : `Review query performance and add indexes if needed`
    };
  }
};
