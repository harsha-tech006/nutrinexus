import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import api from '../services/api';
import FoodCards from '../components/FoodCards';
import ReusableModal from '../components/ReusableModal';
import toast from 'react-hot-toast';

export const DailyTracker = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  const defaultTrackerData = {
    date: new Date().toISOString().split('T')[0],
    calories_consumed: 1300,
    calories_burned: 250,
    water_intake: 1500,
    protein: 51,
    carbs: 169,
    fat: 34,
    fiber: 20,
    target_calories: 2000,
    target_protein: 100,
    target_carbs: 220,
    target_fat: 65,
    target_water: 2500,
    fitness_skipped: false,
    exercise: [
      { id: "ex_1", name: "🏃‍♂️ Brisk Aerobic Walking", duration_mins: 30, calories_burned: 160, logged_at: "07:30" },
      { id: "ex_2", name: "🧘 Sun Salutation Yoga", duration_mins: 20, calories_burned: 90, logged_at: "18:00" }
    ]
  };

  const defaultMeals = [
    { _id: "m_1", meal_type: "breakfast", food_name: "Vegetable Oats Porridge with Raw Almonds", calories: 310, protein: 11, carbs: 45, fat: 8 },
    { _id: "m_2", meal_type: "lunch", food_name: "Mixed Vegetable Dal Rice with Curd & Green Salad", calories: 490, protein: 16, carbs: 72, fat: 10 },
    { _id: "m_3", meal_type: "snacks", food_name: "Roasted Makhana (Lotus Seeds)", calories: 120, protein: 4, carbs: 20, fat: 2 },
    { _id: "m_4", meal_type: "dinner", food_name: "Multigrain Phulka with Sauteed Paneer & Spinach Soup", calories: 380, protein: 22, carbs: 32, fat: 14 }
  ];
  
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState(defaultMeals);
  const [tracker, setTracker] = useState(defaultTrackerData);
  
  // Food Modal states
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Exercise Modal state
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseCalories, setExerciseCalories] = useState('');
  const [submittingExercise, setSubmittingExercise] = useState(false);

  const fetchTrackerData = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const res = await api.get(`/tracker/summary?date=${todayStr}`).catch(() => null);
      if (res?.data?.tracker) {
        setTracker(res.data.tracker);
        setMeals(res.data.meals || defaultMeals);
      } else {
        setTracker(defaultTrackerData);
        setMeals(defaultMeals);
      }
    } catch (err) {
      console.error("Daily tracker fetch notice:", err);
      setTracker(defaultTrackerData);
      setMeals(defaultMeals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, [user]);

  const handleOpenAddModal = (mealType) => {
    setActiveMealType(mealType);
    setLogModalOpen(true);
  };

  const handleLogMealSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const newMeal = {
      _id: "m_" + Date.now(),
      meal_type: activeMealType,
      food_name: foodName,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      fiber: parseFloat(fiber) || 0
    };

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.post('/tracker/meal', {
        date: todayStr,
        meal_type: activeMealType,
        food_name: foodName,
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        fiber: parseFloat(fiber) || 0
      });
      
      if (res.data?.meal) {
        setMeals(prev => [res.data.meal, ...prev]);
        setTracker(res.data.tracker);
      } else {
        setMeals(prev => [newMeal, ...prev]);
        setTracker(prev => ({
          ...prev,
          calories_consumed: (prev?.calories_consumed || 0) + newMeal.calories,
          protein: (prev?.protein || 0) + newMeal.protein,
          carbs: (prev?.carbs || 0) + newMeal.carbs,
          fat: (prev?.fat || 0) + newMeal.fat
        }));
      }
    } catch (err) {
      console.error("Meal submit notice:", err);
      setMeals(prev => [newMeal, ...prev]);
      setTracker(prev => ({
        ...prev,
        calories_consumed: (prev?.calories_consumed || 0) + newMeal.calories,
        protein: (prev?.protein || 0) + newMeal.protein,
        carbs: (prev?.carbs || 0) + newMeal.carbs,
        fat: (prev?.fat || 0) + newMeal.fat
      }));
    } finally {
      setLogModalOpen(false);
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setFiber('');
      setSubmitting(false);
      toast.success('Food logged successfully!');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    const targetMeal = meals.find(m => m._id === mealId);
    setMeals(prev => prev.filter(m => m._id !== mealId));
    if (targetMeal) {
      setTracker(prev => ({
        ...prev,
        calories_consumed: Math.max(0, (prev?.calories_consumed || 0) - (targetMeal.calories || 0)),
        protein: Math.max(0, (prev?.protein || 0) - (targetMeal.protein || 0)),
        carbs: Math.max(0, (prev?.carbs || 0) - (targetMeal.carbs || 0)),
        fat: Math.max(0, (prev?.fat || 0) - (targetMeal.fat || 0))
      }));
    }
    toast.success('Meal log deleted.');
    try {
      await api.delete(`/tracker/meal/${mealId}`);
    } catch (err) {
      console.error("Delete meal notice:", err);
    }
  };

  const handleAddExerciseSubmit = async (e) => {
    e.preventDefault();
    setSubmittingExercise(true);
    const newEx = {
      id: "ex_" + Date.now(),
      name: exerciseName,
      duration_mins: parseFloat(exerciseDuration) || 30,
      calories_burned: parseFloat(exerciseCalories) || 150,
      logged_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTracker(prev => ({
      ...prev,
      calories_burned: (prev?.calories_burned || 0) + newEx.calories_burned,
      exercise: [...(prev?.exercise || []), newEx]
    }));
    setExerciseModalOpen(false);
    setExerciseName('');
    setExerciseDuration('');
    setExerciseCalories('');
    setSubmittingExercise(false);
    toast.success('Activity logged successfully! 🏃‍♂️');

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await api.post('/tracker/exercise', {
        date: todayStr,
        name: exerciseName,
        duration_mins: parseFloat(exerciseDuration),
        duration: parseFloat(exerciseDuration),
        calories_burned: parseFloat(exerciseCalories)
      });
    } catch (err) {
      console.error("Add exercise notice:", err);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (window.confirm('Are you sure you want to delete this workout log?')) {
      const targetEx = (tracker?.exercise || []).find(e => e.id === exerciseId);
      setTracker(prev => ({
        ...prev,
        calories_burned: Math.max(0, (prev?.calories_burned || 0) - (targetEx?.calories_burned || 0)),
        exercise: (prev?.exercise || []).filter(e => e.id !== exerciseId)
      }));
      toast.success('Workout log deleted.');
      try {
        await api.delete(`/tracker/exercise/${exerciseId}`);
      } catch (err) {
        console.error("Delete exercise notice:", err);
      }
    }
  };

  const handleToggleFitnessSkip = async () => {
    const isSkipped = !!tracker?.fitness_skipped;
    setTracker(prev => ({
      ...prev,
      fitness_skipped: !isSkipped
    }));
    toast.success(!isSkipped ? "Fitness routine skipped status updated." : "Fitness routine skip cleared.");
    try {
      await api.post('/tracker/exercise/skip', {
        skipped: !isSkipped
      });
    } catch (err) {
      console.error("Fitness skip notice:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Calculate Breakdown for Physical Activities vs Yoga
  const isYogaItem = (item) => {
    const name = (item?.name || '').toLowerCase();
    return name.includes('yoga') || name.includes('asana') || name.includes('salutation') || name.includes('pranayama') || name.includes('pose') || name.includes('🧘') || name.includes('chaturanga');
  };

  const exerciseList = tracker?.exercise || [];
  const yogaItems = exerciseList.filter(isYogaItem);
  const physicalItems = exerciseList.filter(item => !isYogaItem(item));

  const yogaCaloriesBurned = yogaItems.reduce((sum, item) => sum + (parseFloat(item.calories_burned) || 0), 0);
  const physicalCaloriesBurned = physicalItems.reduce((sum, item) => sum + (parseFloat(item.calories_burned) || 0), 0);
  const totalCaloriesBurned = (tracker?.calories_burned || 0) > 0 ? tracker.calories_burned : (yogaCaloriesBurned + physicalCaloriesBurned);

  const mealSlots = ['breakfast', 'lunch', 'dinner', 'snacks'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">{t('dailyTracker')}</h2>
        <p className="text-sm text-gray-400 mt-1 font-semibold">{t('dailyBreakdown')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Meal slots */}
        <div className="lg:col-span-2 space-y-4">
          {mealSlots.map((slot) => (
            <FoodCards
              key={slot}
              mealType={slot}
              meals={meals}
              onAddClick={handleOpenAddModal}
              onDeleteClick={handleDeleteMeal}
            />
          ))}
        </div>

        {/* Right 1 Column: Today's Summary & Exercises */}
        <div className="lg:col-span-1 space-y-6 self-start">
          
          {/* Today's Total Stats Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-3xl p-6 shadow-soft space-y-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800/80 pb-3">{t('todaysHealthSummary')}</h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center bg-green-50/20 dark:bg-green-950/10 p-4 rounded-xl border border-green-100/10 dark:border-green-800/10">
                <span className="font-bold text-gray-600 dark:text-gray-300">{t('caloriesConsumed')}:</span>
                <span className="text-lg font-black text-green-500">{tracker?.calories_consumed || 0} kcal</span>
              </div>

              {/* Total Calories Burned Card with Breakdown */}
              <div className="bg-orange-50/30 dark:bg-orange-950/10 p-4 rounded-xl border border-orange-200/40 dark:border-orange-900/20 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700 dark:text-gray-200">{t('caloriesBurned')}:</span>
                  <span className="text-lg font-black text-orange-500">{totalCaloriesBurned} kcal</span>
                </div>

                {/* Sub-breakdown: Physical Activity vs Yoga */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-200/30 dark:border-orange-900/30 text-xs">
                  <div className="bg-white/80 dark:bg-gray-900/80 p-2.5 rounded-xl border border-orange-100 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">🏋️ Physical Activity</span>
                    <span className="font-black text-orange-600 dark:text-orange-400">{physicalCaloriesBurned} kcal</span>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-900/80 p-2.5 rounded-xl border border-orange-100 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">🧘 Yoga Practice</span>
                    <span className="font-black text-purple-600 dark:text-purple-400">{yogaCaloriesBurned} kcal</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">
                    <span>Protein</span>
                    <span>{tracker?.protein || 0}g / {user?.protein_requirement || 100}g</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full"
                      style={{ width: `${Math.min(100, ((tracker?.protein || 0) / (user?.protein_requirement || 100)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">
                    <span>Carbohydrates</span>
                    <span>{tracker?.carbs || 0}g</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full"
                      style={{ width: `${Math.min(100, ((tracker?.carbs || 0) / 220) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">
                    <span>Fats</span>
                    <span>{tracker?.fat || 0}g</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-yellow-500 h-full"
                      style={{ width: `${Math.min(100, ((tracker?.fat || 0) / 65) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Activity Card */}
          <div className={`border transition-all duration-200 rounded-3xl p-6 shadow-soft space-y-4 ${
            tracker?.fitness_skipped
              ? 'bg-orange-50/10 dark:bg-orange-950/5 border-orange-200 dark:border-orange-950/30 opacity-80'
              : 'bg-white dark:bg-gray-900 border-gray-200/50 dark:border-gray-800/40'
          }`}>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800/80 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">Daily Activity</h3>
                <span className="text-[10px] font-semibold text-gray-400 block">
                  {exerciseList.length} logged ({yogaItems.length} Yoga • {physicalItems.length} Workout)
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleToggleFitnessSkip}
                  className={`font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors shadow-sm ${
                    tracker?.fitness_skipped
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                  }`}
                >
                  {tracker?.fitness_skipped ? '✓ Skipped' : 'Skip Routine'}
                </button>
                <button 
                  onClick={() => setExerciseModalOpen(true)}
                  disabled={tracker?.fitness_skipped}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  + Log Activity
                </button>
              </div>
            </div>

            {tracker?.fitness_skipped && (
              <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/60 dark:border-orange-900/20 p-3 rounded-xl">
                <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold leading-relaxed">
                  ⚠️ Today's fitness routine marked as skipped. A motivational alert has been sent to your email. Stay active tomorrow!
                </p>
              </div>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {exerciseList.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No workouts or yoga logged today.</p>
              ) : (
                exerciseList.map((ex) => {
                  const isYoga = isYogaItem(ex);
                  return (
                    <div key={ex.id || Math.random()} className="flex justify-between items-center text-xs p-3 bg-gray-50 dark:bg-gray-800/35 rounded-xl border border-gray-100/50 dark:border-gray-800">
                      <div className="overflow-hidden mr-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            isYoga 
                              ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300' 
                              : 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300'
                          }`}>
                            {isYoga ? '🧘 YOGA' : '🏋️ WORKOUT'}
                          </span>
                          <span className="font-bold text-gray-700 dark:text-gray-300 truncate">{ex.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">
                          {ex.duration_mins || ex.duration || 15} mins • {ex.logged_at || 'Today'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`font-bold ${isYoga ? 'text-purple-500' : 'text-orange-500'}`}>
                          {ex.calories_burned} kcal
                        </span>
                        <button
                          onClick={() => handleDeleteExercise(ex.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete log"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Log Food Modal */}
      <ReusableModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title={`Log ${activeMealType} food item`}
      >
        <form onSubmit={handleLogMealSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Food Item Name</label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="e.g. Scrambled Eggs, Oatmeal, Roti"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="Calories"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Protein (g)</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="Protein"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="Carbohydrates"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Fats (g)</label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="Fats"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Fiber (g)</label>
            <input
              type="number"
              value={fiber}
              onChange={(e) => setFiber(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="Fiber (g)"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setLogModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Logging...' : 'Add Food Item'}
            </button>
          </div>
        </form>
      </ReusableModal>

      {/* Log Exercise Modal */}
      <ReusableModal 
        isOpen={exerciseModalOpen} 
        onClose={() => setExerciseModalOpen(false)} 
        title="Log Workout / Yoga Activity"
      >
        <form onSubmit={handleAddExerciseSubmit} className="space-y-4">
          
          {/* Quick Preset Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Quick Select Activity / Yoga Preset</label>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const [presetName, dur, cal] = val.split('|');
                setExerciseName(presetName);
                setExerciseDuration(dur);
                setExerciseCalories(cal);
              }}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            >
              <option value="">-- Choose Preset Activity --</option>
              <optgroup label="🧘 Yoga Practices">
                <option value="🧘 Sun Salutation (Surya Namaskar)|20|90">Sun Salutation (20 mins ~ 90 kcal)</option>
                <option value="🧘 Vinyasa Flow Yoga|30|135">Vinyasa Flow Yoga (30 mins ~ 135 kcal)</option>
                <option value="🧘 Hatha Yoga Sequence|30|110">Hatha Yoga Sequence (30 mins ~ 110 kcal)</option>
                <option value="🧘 Restorative Yoga & Stretching|25|75">Restorative Yoga & Stretching (25 mins ~ 75 kcal)</option>
                <option value="🧘 Pranayama Breathing Exercises|15|45">Pranayama Breathing Exercises (15 mins ~ 45 kcal)</option>
              </optgroup>
              <optgroup label="🏋️‍♂️ Physical Activities">
                <option value="🏃‍♂️ Brisk Aerobic Walking|30|160">Brisk Aerobic Walking (30 mins ~ 160 kcal)</option>
                <option value="🏃 Outdoor Running / Jogging|30|280">Outdoor Running / Jogging (30 mins ~ 280 kcal)</option>
                <option value="🚴 Cycling / Exercise Bike|30|220">Cycling / Exercise Bike (30 mins ~ 220 kcal)</option>
                <option value="🏊 Swimming Laps|30|250">Swimming Laps (30 mins ~ 250 kcal)</option>
                <option value="🏋️ Strength Training / Gym|45|225">Strength Training / Gym (45 mins ~ 225 kcal)</option>
                <option value="🔥 High Intensity Interval Training (HIIT)|20|200">HIIT Workout (20 mins ~ 200 kcal)</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Exercise / Activity Name</label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="e.g. Running, Sun Salutation Yoga"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Duration (mins)</label>
              <input
                type="number"
                value={exerciseDuration}
                onChange={(e) => setExerciseDuration(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="e.g. 30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Calories Burned (kcal)</label>
              <input
                type="number"
                value={exerciseCalories}
                onChange={(e) => setExerciseCalories(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="e.g. 240"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setExerciseModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingExercise}
              className="px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
            >
              {submittingExercise ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </form>
      </ReusableModal>

    </div>
  );
};

export default DailyTracker;
