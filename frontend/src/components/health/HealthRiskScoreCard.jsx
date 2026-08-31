import React from 'react';
import { HiOutlineShieldCheck, HiOutlineExclamation, HiOutlineCheckCircle } from 'react-icons/hi';

export const HealthRiskScoreCard = ({ score = 22, riskLevel = "Low Risk", factors = [], recommendations = [] }) => {
  // Configurable score categories (Requirement #7)
  const getScoreBadge = () => {
    if (score <= 25) return { label: "Low Risk", bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" };
    if (score <= 40) return { label: "Low-Moderate Risk", bg: "bg-blue-500", text: "text-blue-700 dark:text-blue-300" };
    if (score <= 60) return { label: "Moderate Risk", bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" };
    if (score <= 80) return { label: "Serious Risk", bg: "bg-orange-600", text: "text-orange-700 dark:text-orange-300" };
    return { label: "High Risk", bg: "bg-red-600 animate-pulse", text: "text-red-700 dark:text-red-300" };
  };

  const badge = getScoreBadge();

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Multi-Factor Risk Assessment</span>
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <HiOutlineShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Health Risk Score</span>
          </h3>
        </div>
        <span className={`px-3.5 py-1 text-white rounded-full text-xs font-black uppercase ${badge.bg}`}>
          {riskLevel || badge.label}
        </span>
      </div>

      {/* Visual Gauge Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-3xl font-black text-gray-900 dark:text-gray-100">{score} <span className="text-xs font-extrabold text-gray-400">/ 100</span></span>
          <span className="text-xs font-bold text-gray-500">0 (Optimal) — 100 (High Risk)</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-gray-800">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              score <= 25 ? 'bg-emerald-500' :
              score <= 40 ? 'bg-blue-500' :
              score <= 60 ? 'bg-amber-500' :
              score <= 80 ? 'bg-orange-500' : 'bg-red-600'
            }`}
            style={{ width: `${Math.max(5, score)}%` }}
          ></div>
        </div>
      </div>

      {/* Risk Factors Breakdown */}
      {factors && factors.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
          <p className="font-bold text-gray-700 dark:text-gray-300">Tracked Risk Factors Evaluated:</p>
          <div className="space-y-1">
            {factors.map((fact, idx) => (
              <div key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[11px]">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 text-xs space-y-1">
          <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" /> Recommended Action Items:
          </p>
          {recommendations.map((rec, rIdx) => (
            <p key={rIdx} className="text-emerald-700 dark:text-emerald-400 text-[11px]">✓ {rec}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthRiskScoreCard;
