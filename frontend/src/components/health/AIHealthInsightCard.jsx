import React from 'react';
import { HiOutlineSparkles, HiOutlineInformationCircle } from 'react-icons/hi';

export const AIHealthInsightCard = ({ insight }) => {
  const defaultText = "Your nutrition adherence has improved over the last 4 weeks. Your protein and water intake are also closer to your personal targets. Continue monitoring your health measurements and consult your healthcare professional for condition-specific decisions.";

  const text = insight?.summary || defaultText;
  const factors = insight?.grounded_factors || [];

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
      <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-500/20 rounded-2xl text-indigo-300">
            <HiOutlineSparkles className="w-5 h-5 animate-pulse" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-300">AI Health Insight</span>
        </div>
        <span className="text-[10px] font-bold text-gray-400">Grounded Clinical Analytics</span>
      </div>

      <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
        "{text}"
      </p>

      {factors.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-indigo-500/30 text-xs">
          <p className="text-[11px] font-bold text-indigo-300">Grounded Data Factors Evaluated:</p>
          <div className="flex flex-wrap gap-1.5">
            {factors.map((f, i) => (
              <span key={i} className="px-2.5 py-1 bg-white/10 rounded-xl text-[10px] font-semibold text-gray-300 border border-white/10">
                ✓ {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Safety Notice Requirement #11 */}
      <div className="flex items-start gap-1.5 text-[10px] text-gray-400 pt-1">
        <HiOutlineInformationCircle className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
        <span>NutriNexus AI insights analyze tracked wellness trends. The AI does not diagnose, guarantee disease cure, or modify prescription dosages.</span>
      </div>
    </div>
  );
};

export default AIHealthInsightCard;
