import type { QueryAnalysis, Verdict } from '../types';
import { CheckCircle, AlertTriangle, AlertCircle, Info, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface MessageBubbleProps {
  analysis: QueryAnalysis;
}

export const MessageBubble = ({ analysis }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyFix = async () => {
    // Extract SQL from the action if it contains CREATE INDEX or similar
    const action = analysis.recommendedFix.action;
    const sqlMatch = action.match(/(CREATE\s+INDEX[^;]+;?)/i);
    const textToCopy = sqlMatch ? sqlMatch[1] : action;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getVerdictColor = (verdict: Verdict) => {
    switch (verdict) {
      case 'OPTIMAL':
        return 'text-mac-success border-mac-success bg-green-50';
      case 'SAFE_FOR_NOW':
        return 'text-yellow-700 border-yellow-600 bg-yellow-50';
      case 'RISKY':
        return 'text-mac-warning border-mac-warning bg-red-50';
      case 'CRITICAL':
        return 'text-mac-warning border-mac-warning bg-red-100';
      default:
        return 'text-gray-700 border-gray-400 bg-gray-50';
    }
  };

  const getVerdictIcon = (verdict: Verdict) => {
    switch (verdict) {
      case 'OPTIMAL':
        return <CheckCircle size={20} className="text-mac-success" />;
      case 'SAFE_FOR_NOW':
        return <Info size={20} className="text-yellow-700" />;
      case 'RISKY':
      case 'CRITICAL':
        return <AlertTriangle size={20} className="text-mac-warning" />;
      default:
        return <AlertCircle size={20} className="text-gray-600" />;
    }
  };

  const getVerdictLabel = (verdict: Verdict) => {
    switch (verdict) {
      case 'OPTIMAL':
        return 'Optimal';
      case 'SAFE_FOR_NOW':
        return 'Safe for Now';
      case 'RISKY':
        return 'Risky';
      case 'CRITICAL':
        return 'Critical';
      default:
        return verdict;
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'text-mac-success';
      case 'MEDIUM':
        return 'text-yellow-700';
      case 'LOW':
        return 'text-mac-warning';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="mac-panel p-6 space-y-6">
      {/* Verdict & Headline */}
      <div className="border-b border-gray-300 pb-4">
        <div className="flex items-start gap-3 mb-3">
          {getVerdictIcon(analysis.verdict)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 border ${getVerdictColor(analysis.verdict)}`}>
                {getVerdictLabel(analysis.verdict)}
              </span>
            </div>
            <h2 className="font-chicago font-semibold text-lg mb-2">
              {analysis.headline}
            </h2>
          </div>
        </div>
      </div>

      {/* Primary Risk */}
      <div>
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle size={18} className="text-mac-warning mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-chicago font-semibold text-base mb-2">Primary Risk</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Issue:</span>{' '}
                {analysis.primaryRisk.issue}
              </div>
              <div>
                <span className="font-semibold">Why it matters:</span>{' '}
                {analysis.primaryRisk.whyItMatters}
              </div>
              <div>
                <span className="font-semibold">Estimated risk at:</span>{' '}
                {analysis.primaryRisk.estimatedRiskAt}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Fix */}
      <div>
        <div className="flex items-start gap-3 mb-3">
          <CheckCircle size={18} className="text-mac-success mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-chicago font-semibold text-base">Recommended Fix</h3>
              {analysis.recommendedFix.action.includes('CREATE INDEX') || 
               analysis.recommendedFix.action.includes('ADD INDEX') ? (
                <button
                  onClick={handleCopyFix}
                  className="mac-button text-xs px-2 py-1 flex items-center gap-1"
                  title="Copy SQL to clipboard"
                >
                  {copied ? (
                    <>
                      <Check size={12} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy
                    </>
                  )}
                </button>
              ) : null}
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Action:</span>{' '}
                {analysis.recommendedFix.action}
              </div>
              <div>
                <span className="font-semibold">Impact:</span>{' '}
                {analysis.recommendedFix.impact}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence & Next Step */}
      <div className="border-t border-gray-300 pt-4 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Info size={16} className="text-mac-primary" />
            <span className="font-semibold text-sm">Confidence:</span>
            <span className={`text-sm ${getConfidenceColor(analysis.confidence.level)}`}>
              {analysis.confidence.level}
            </span>
          </div>
          <p className="text-xs text-gray-600 ml-6">{analysis.confidence.reason}</p>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">Next Step:</span>
          </div>
          <p className="text-sm text-gray-700 ml-0">{analysis.nextStep}</p>
        </div>
      </div>
    </div>
  );
};
