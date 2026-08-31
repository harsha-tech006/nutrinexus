import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { HiOutlineLightBulb, HiOutlineFlag } from 'react-icons/hi';
import toast from 'react-hot-toast';

export const GoalTracker = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  const [goalType, setGoalType] = useState('Healthy Lifestyle');
  const [startWeight, setStartWeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/report/goals');
      const goalObj = res.data.goal;
      setGoalType(goalObj.goal_type || 'Healthy Lifestyle');
      setStartWeight(goalObj.start_weight || user?.weight || '');
      setCurrentWeight(goalObj.current_weight || user?.weight || '');
      setTargetWeight(goalObj.target_weight || '');
      setTargetCalories(goalObj.target_calories || user?.tdee || 2000);
      setTargetDate(goalObj.target_date || '');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchGoals();
  }, [user]);

  const handleUpdateGoals = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.post('/report/goals', {
        goal_type: goalType,
        start_weight: parseFloat(startWeight),
        current_weight: parseFloat(currentWeight),
        target_weight: parseFloat(targetWeight),
        target_calories: parseFloat(targetCalories),
        target_date: targetDate
      });

      // Sync user profile local weights
      await updateProfile({
        goal: goalType,
        weight: parseFloat(currentWeight)
      });
      
      toast.success('Fitness goals saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update goals.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Goals & Targets Planner</h2>
        <p className="text-sm text-gray-400 mt-1 font-semibold">Manage your wellness objectives and weight progress timeline.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main form Column */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 shadow-soft">
          <form onSubmit={handleUpdateGoals} className="space-y-5">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800/80 pb-3 flex items-center gap-2">
              <HiOutlineFlag className="w-5 h-5 text-green-500" />
              <span>Define Goals</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Target Wellness Goal</label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Weight Gain">Weight Gain</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Healthy Lifestyle">Healthy Lifestyle</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Start Weight (kg)</label>
                <input
                  type="number"
                  step="any"
                  value={startWeight}
                  onChange={(e) => setStartWeight(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  placeholder="Start"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Current Weight (kg)</label>
                <input
                  type="number"
                  step="any"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  placeholder="Current"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Goal Weight (kg)</label>
                <input
                  type="number"
                  step="any"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  placeholder="Target"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Daily Target Calories (kcal)</label>
                <input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  placeholder="Target kcal"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Target Timeline Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all shadow-medium shadow-green-500/10 disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Set Goals & Recalculate Timeline'}
            </button>
          </form>
        </div>

        {/* Tip panel Column */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 shadow-soft space-y-4 self-start">
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <HiOutlineLightBulb className="w-5 h-5 text-yellow-500" />
            <span>Nutrition Tip</span>
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            <b>Weight Loss:</b> Aim for a calorie deficit of 300-500 kcal from your TDEE maintenance level. Keep protein high (~1.8g per kg body weight) to spare lean mass.<br/><br/>
            <b>Muscle Gain:</b> Focus on a slight caloric surplus (+200-400 kcal) combined with heavy lifting and high protein (~2.0g per kg body weight).
          </p>
        </div>

      </div>
    </div>
  );
};

export default GoalTracker;
