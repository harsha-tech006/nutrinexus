import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export const NutritionCards = ({ 
  protein = 0, 
  carbs = 0, 
  fat = 0, 
  targetProtein = 100, 
  targetCarbs = 220, 
  targetFat = 65 
}) => {
  const { t } = useContext(LanguageContext);
  
  const macros = [
    {
      label: `${t('protein')} (g)`,
      current: protein,
      target: targetProtein,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40'
    },
    {
      label: `${t('carbs')} (g)`,
      current: carbs,
      target: targetCarbs,
      color: 'bg-teal-500',
      textColor: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40'
    },
    {
      label: `${t('fat')} (g)`,
      current: fat,
      target: targetFat,
      color: 'bg-green-600',
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/40'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {macros.map((macro, idx) => {
        const percent = macro.target > 0 ? (macro.current / macro.target) * 100 : 0;
        const boundedPercent = Math.max(0, Math.min(100, percent));
        
        return (
          <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-5 shadow-soft">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{macro.label}</span>
              <span className={`text-xs font-bold ${macro.textColor}`}>{Math.round(percent)}%</span>
            </div>
            
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{Math.round(macro.current)}</span>
              <span className="text-xs text-gray-400">/ {macro.target}g</span>
            </div>
            
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`${macro.color} h-full transition-all duration-300`}
                style={{ width: `${boundedPercent}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NutritionCards;
