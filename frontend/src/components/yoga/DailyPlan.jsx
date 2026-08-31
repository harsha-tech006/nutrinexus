import React, { useContext } from 'react';
import { HiCheck, HiPlay, HiOutlineClock, HiOutlineFire, HiSparkles } from 'react-icons/hi';
import { LanguageContext } from '../../context/LanguageContext';

export const DailyPlan = ({
  plan,
  onStartPose,
  onViewDetails,
  loading = false
}) => {
  const { language, t } = useContext(LanguageContext);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="text-xs text-gray-400 font-bold">Generating AI Daily Plan...</p>
      </div>
    );
  }

  if (!plan || !plan.sequence || plan.sequence.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 text-center space-y-3">
        <p className="text-sm text-gray-400 font-semibold">No daily routine generated. Adjust your health conditions in profile first.</p>
      </div>
    );
  }

  const { sequence, total_duration_mins, total_calories, completed_today_ids } = plan;
  const completionCount = sequence.filter(pose => completed_today_ids.includes(pose._id)).length;
  const isFinished = completionCount === sequence.length;

  return (
    <div className="space-y-6">
      
      {/* Overview Card */}
      <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-soft overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
          <svg viewBox="0 0 100 100" className="w-48 h-48" fill="currentColor">
            <circle cx="50" cy="50" r="40"/>
          </svg>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-[10px] uppercase font-black bg-white/20 px-2 py-0.5 rounded-full tracking-wider">
              {t('dailyPlan')}
            </span>
            <h3 className="text-xl font-black mt-1">Today's Personalized Routine</h3>
            <p className="text-xs text-emerald-100 font-medium mt-1">
              Curated based on your health conditions, goal, and profile limits.
            </p>
          </div>

          <div className="flex items-center gap-6 pt-2 border-t border-white/10">
            <div>
              <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider block">{t('duration')}</span>
              <span className="text-base font-extrabold flex items-center gap-1 mt-0.5">
                <HiOutlineClock className="w-4 h-4" />
                {total_duration_mins} mins
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider block">{t('caloriesBurned')}</span>
              <span className="text-base font-extrabold flex items-center gap-1 mt-0.5">
                <HiOutlineFire className="w-4 h-4 text-amber-300" />
                {total_calories} cal
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider block">Completed</span>
              <span className="text-base font-extrabold mt-0.5">
                {completionCount} / {sequence.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-white/25 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-500 ease-out" 
                style={{ width: `${(completionCount / sequence.length) * 100}%` }}
              />
            </div>
            {isFinished && (
              <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider flex items-center gap-1">
                <HiSparkles className="w-3.5 h-3.5" />
                All Poses Done! Great job today!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Routine Timeline list */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 space-y-6">
        <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200">Routine Steps</h4>
        
        <div className="relative border-l border-gray-100 dark:border-gray-800 ml-4 space-y-6">
          {sequence.map((pose, idx) => {
            const isCompleted = completed_today_ids.includes(pose._id);
            const hasTranslation = pose.translations && pose.translations[language];
            const name = hasTranslation && pose.translations[language].name
              ? pose.translations[language].name
              : pose.name;

            return (
              <div key={pose._id} className="relative pl-6">
                
                {/* Timeline node */}
                <div className={`absolute -left-3 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'bg-white border-gray-200 text-gray-400 dark:bg-gray-950 dark:border-gray-800'
                } transition-all duration-300`}>
                  {isCompleted ? (
                    <HiCheck className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Step Card details */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 dark:bg-gray-800/20 dark:hover:bg-gray-800/40 border border-gray-100/50 dark:border-gray-800/40 transition-all duration-200">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                      {pose.routine_role}
                    </span>
                    <h5 className="font-extrabold text-xs text-gray-800 dark:text-gray-200">
                      {name}
                    </h5>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-semibold">
                      <span>{pose.routine_duration || pose.duration}</span>
                      <span>•</span>
                      <span>{pose.calories_burned || 0} cal</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(pose)}
                      className="px-3 py-1.5 text-[10px] font-bold border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                      {t('view')}
                    </button>
                    {!isCompleted && (
                      <button
                        onClick={() => onStartPose(pose)}
                        className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-soft transition-colors"
                      >
                        <HiPlay className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

export default DailyPlan;
