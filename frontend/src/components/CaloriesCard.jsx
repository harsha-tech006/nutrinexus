import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { IoFlame, IoRestaurant } from 'react-icons/io5';

export const CaloriesCard = ({ consumed = 0, burned = 0, target = 2000 }) => {
  const { t } = useContext(LanguageContext);
  const remaining = Math.max(0, Math.round(target - consumed + burned));
  
  // Progress percent calculation
  const totalBudget = target + burned;
  const percent = totalBudget > 0 ? (consumed / totalBudget) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-200">
      
      {/* Circle indicator */}
      <div className="flex-shrink-0 relative">
        <svg className="transform -rotate-90" width={130} height={130}>
          <circle
            className="text-gray-100 dark:text-gray-800"
            strokeWidth={10}
            stroke="currentColor"
            fill="transparent"
            r={54}
            cx={65}
            cy={65}
          />
          <circle
            stroke="#10B981"
            strokeWidth={10}
            strokeDasharray={2 * Math.PI * 54}
            strokeDashoffset={2 * Math.PI * 54 - (Math.min(100, percent) / 100) * (2 * Math.PI * 54)}
            strokeLinecap="round"
            fill="transparent"
            r={54}
            cx={65}
            cy={65}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{remaining}</span>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">{t('remaining')}</span>
        </div>
      </div>

      {/* Grid numbers details */}
      <div className="flex-1 w-full space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider">{t('caloriesBudget')}</h3>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5">{target} <span className="text-sm font-medium text-gray-400">kcal</span></p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <IoRestaurant className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{t('foodLogged')}</span>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{Math.round(consumed)} kcal</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-teal-50/80 dark:bg-teal-950/40 p-3 rounded-2xl border border-teal-100 dark:border-teal-900/30">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-sm">
              <IoFlame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{t('burned')}</span>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{Math.round(burned)} kcal</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CaloriesCard;
