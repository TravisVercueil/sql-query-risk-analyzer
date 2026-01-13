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
