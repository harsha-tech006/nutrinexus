import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { IoWater, IoWalk, IoTimeOutline } from 'react-icons/io5';

export const WaterProgressCard = ({ current = 0, target = 3000, onAddWater }) => {
  const { t } = useContext(LanguageContext);
  const percent = target > 0 ? (current / target) * 100 : 0;
  const boundedPercent = Math.max(0, Math.min(100, percent));

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-5 shadow-soft flex flex-col justify-between h-44">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('waterIntake')}</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{current}</span>
            <span className="text-xs text-gray-400">/ {target} mL</span>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
          <IoWater className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-600 dark:bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${boundedPercent}%` }}
          ></div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onAddWater(250)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 rounded-lg transition-colors shadow-sm"
          >
            +250ml
          </button>
          <button 
            onClick={() => onAddWater(500)}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs py-1.5 rounded-lg transition-colors shadow-sm"
          >
            +500ml
          </button>
        </div>
      </div>
    </div>
  );
};

export const ExerciseProgressCard = ({ caloriesBurned = 0, durationMins = 0, onAddExercise }) => {
  const { t } = useContext(LanguageContext);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-5 shadow-soft flex flex-col justify-between h-44">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('exerciseBurned')}</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{caloriesBurned}</span>
            <span className="text-xs text-gray-400">kcal {t('burned')}</span>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
          <IoWalk className="w-5 h-5 animate-bounce-slow" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <IoTimeOutline className="w-4 h-4 text-teal-500 dark:text-teal-400" />
          <span>{t('activeDuration')}: <b>{durationMins}</b> {t('mins')}</span>
        </div>
        
        <button 
          onClick={onAddExercise}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-sm"
        >
          {t('logWorkoutActivity')}
        </button>
      </div>
    </div>
  );
};

const ProgressCards = { WaterProgressCard, ExerciseProgressCard };
export default ProgressCards;
