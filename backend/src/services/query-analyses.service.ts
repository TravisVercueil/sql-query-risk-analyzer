import { queryValidator } from '../validators/query.validator';
import { analysisExplainerService } from '../ai/analysis-explainer.ai';

export type Verdict = 'SAFE_FOR_NOW' | 'RISKY' | 'CRITICAL' | 'OPTIMAL';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface QueryAnalysis {
  verdict: Verdict;
  headline: string;
  primaryRisk: PrimaryRisk;
  recommendedFix: RecommendedFix;
  confidence: Confidence;
  nextStep: string;
}

export interface PrimaryRisk {
  issue: string;
  whyItMatters: string;
  estimatedRiskAt: string;
}

export interface RecommendedFix {
  action: string;
  impact: string;
}

export interface Confidence {
  level: ConfidenceLevel;
  reason: string;
}

export const queryAnalysesService = {
  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    // 1. Validate query safety
    queryValidator.validate(query);

    // 2. Get AI analysis directly from the query
    const analysis = await analysisExplainerService.explainAnalysis(query);

    return analysis;
  }
};
