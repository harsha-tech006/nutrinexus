import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { HiOutlineTrendingUp } from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';

export const WeightTracker = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [goal, setGoal] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const res = await api.get('/report/goals');
        setGoal(res.data.goal);
        setCurrentWeight(res.data.goal.current_weight || user?.weight || '');
        setTargetWeight(res.data.goal.target_weight || '');
      } catch (err) {
        console.error('Error fetching goal details:', err);
      }
    };
    if (user) fetchGoal();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.post('/report/goals', {
        goal_type: goal?.goal_type || user?.goal || 'Healthy Lifestyle',
        target_weight: parseFloat(targetWeight) || user?.weight || 70,
        current_weight: parseFloat(currentWeight),
        target_calories: user?.tdee || 2000
      });
      setGoal(res.data.goal);
      
      // Update local profile weight
      await updateProfile({ weight: parseFloat(currentWeight) });
      
      toast.success('Weight updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update weight.');
    } finally {
      setUpdating(false);
    }
  };

  const getProgressPercent = () => {
    if (!goal) return 0;
    const start = goal.start_weight;
    const current = goal.current_weight;
    const target = goal.target_weight;
    
    if (start === target) return 100;
    
    const totalChangeNeeded = target - start;
    const changeDone = current - start;
    
    let percent = (changeDone / totalChangeNeeded) * 100;
    percent = Math.max(0, Math.min(100, percent));
    return Math.round(percent);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineTrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-bold text-gray-900 dark:text-gray-100">{t('weightAndGoalsTracker')}</h3>
      </div>

      {goal && (
        <div className="mb-6 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            <span>{t('healthGoal')}: {t(goal.goal_type) !== goal.goal_type ? t(goal.goal_type) : goal.goal_type}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{getProgressPercent()}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 dark:bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${getProgressPercent()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mt-2">
            <span>{t('start') || 'Start'}: {goal.start_weight} kg</span>
            <span>{t('current') || 'Current'}: {goal.current_weight} kg</span>
            <span>{t('target') || 'Target'}: {goal.target_weight} kg</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('currentKg')}</label>
            <input
              type="number"
              step="any"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Current"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('targetGoalKg')}</label>
            <input
              type="number"
              step="any"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Target"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          {updating ? t('updating') : t('logCurrentWeight')}
        </button>
      </form>
    </div>
  );
};

export default WeightTracker;
