import React from 'react';
import { HiCheck, HiOutlineSparkles, HiOutlineClock, HiOutlineTrendingUp } from 'react-icons/hi';

export const ProgressTracker = ({
  completedSessions = [],
  dailyTarget = 3
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Filter sessions logged today
  const todaySessions = completedSessions.filter(s => {
    // Handle both ISO timestamps and date strings
    if (s.date) return s.date === todayStr;
    if (s.timestamp) return s.timestamp.startsWith(todayStr);
    return false;
  });

  const completedCount = todaySessions.length;
  const totalDurationMins = Math.round(todaySessions.reduce((acc, s) => acc + (s.duration_sec || 0), 0) / 60);
  const totalCalories = Math.round(todaySessions.reduce((acc, s) => acc + (s.calories_burned || 0), 0));
  const completionPercentage = Math.min(100, Math.round((completedCount / dailyTarget) * 100));

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-soft space-y-4">
      
      {/* Tracker Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200">Today's Progress</h4>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5">
            Your daily target is to practice {dailyTarget} yoga poses.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 px-3 py-1 rounded-xl border border-emerald-100/30">
          <HiOutlineTrendingUp className="w-4 h-4" />
          <span>{completionPercentage}% Achieved</span>
        </div>
      </div>

      {/* Progress metrics and timeline bar */}
      <div className="space-y-3">
        
        {/* Progress bar */}
        <div className="relative w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Small stats layout */}
        <div className="grid grid-cols-3 gap-4 pt-1">
          
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <HiCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider block">Completed</span>
              <span className="text-xs font-extrabold text-gray-700 dark:text-gray-200">{completedCount} Poses</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
              <HiOutlineSparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider block">Calories</span>
              <span className="text-xs font-extrabold text-gray-700 dark:text-gray-200">{totalCalories} kcal</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400">
              <HiOutlineClock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-gray-400 uppercase font-black tracking-wider block">Time Spent</span>
              <span className="text-xs font-extrabold text-gray-700 dark:text-gray-200">{totalDurationMins} mins</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProgressTracker;
