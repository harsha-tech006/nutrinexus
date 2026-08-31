import React, { useContext } from 'react';
import { HiFire, HiCheckCircle } from 'react-icons/hi';
import { LanguageContext } from '../../context/LanguageContext';

export const WeeklyChallenge = ({
  challenge,
  loading = false
}) => {
  const { t } = useContext(LanguageContext);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="text-xs text-gray-400 font-bold">Loading weekly challenge progress...</p>
      </div>
    );
  }

  if (!challenge) return null;

  const { days = [], completion_percentage = 0, streak = 0, badges = [] } = challenge;

  return (
    <div className="space-y-6">
      
      {/* Challenge Summary Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-soft grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Streak & Completion */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full tracking-wider">
              {t('weeklyChallenge')}
            </span>
            <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">7-Day Yoga Streak</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Complete at least one pose daily to keep your streak burning!
            </p>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 px-4 py-2.5 rounded-2xl border border-amber-100/50 dark:border-amber-900/30">
              <HiFire className="w-8 h-8 text-amber-500 animate-pulse" />
              <div>
                <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider block">{t('dailyStreak')}</span>
                <span className="text-base font-extrabold text-gray-700 dark:text-gray-200">{streak} Days</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2.5 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
              <HiCheckCircle className="w-8 h-8 text-emerald-500" />
              <div>
                <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider block">{t('completionPercentage')}</span>
                <span className="text-base font-extrabold text-gray-700 dark:text-gray-200">{completion_percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Calendar Grid */}
        <div className="bg-gray-50 dark:bg-gray-800/20 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/40 flex flex-col justify-center">
          <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-3">Weekly Tracker</h4>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold">{day.day_name}</span>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-black shadow-sm transition-all duration-300 ${
                    day.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/10' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-300'
                  }`}
                  title={day.date}
                >
                  {day.completed ? "✓" : i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default WeeklyChallenge;
