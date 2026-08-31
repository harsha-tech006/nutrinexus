import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import api from '../services/api';
import CaloriesCard from '../components/CaloriesCard';
import NutritionCards from '../components/NutritionCards';
import { WaterProgressCard, ExerciseProgressCard } from '../components/ProgressCards';
import ReminderCards from '../components/ReminderCards';
import BMICalculator from '../components/BMICalculator';
import WeightTracker from '../components/WeightTracker';
import ReusableModal from '../components/ReusableModal';
import { CardSkeleton } from '../components/LoadingComponents';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  
  const defaultTrackerData = {
    date: new Date().toISOString().split('T')[0],
    calories_consumed: 0,
    calories_burned: 0,
    water_intake: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    target_calories: 2000,
    target_protein: 100,
    target_carbs: 220,
    target_fat: 65,
    target_water: 2500,
    exercise: []
  };

  const [loading, setLoading] = useState(true);
  const [trackerData, setTrackerData] = useState(defaultTrackerData);
  const [meals, setMeals] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [healthPassportOpen, setHealthPassportOpen] = useState(false);
  
  // Exercise Modal state
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseCalories, setExerciseCalories] = useState('');
  const [submittingExercise, setSubmittingExercise] = useState(false);

  const fetchDashboardData = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const trackerRes = await api.get(`/tracker/summary?date=${todayStr}`).catch(() => null);
      const reminderRes = await api.get('/reminders/medicine').catch(() => null);

      if (trackerRes?.data?.tracker) {
        setTrackerData(trackerRes.data.tracker);
        setMeals(trackerRes.data.meals || []);
      } else {
        setTrackerData(defaultTrackerData);
      }

      if (reminderRes?.data?.reminders) {
        setReminders(reminderRes.data.reminders);
      } else {
        setReminders([]);
      }
    } catch (err) {
      console.error('Notice fetching dashboard summary:', err);
      setTrackerData(defaultTrackerData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleAddWater = async (amount) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.post('/tracker/water', {
        date: todayStr,
        amount: amount
      });
      setTrackerData(res.data.tracker);
      toast.success(`Added ${amount}ml water! 💧`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to log water intake.');
    }
  };

  const handleAddExerciseSubmit = async (e) => {
    e.preventDefault();
    setSubmittingExercise(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.post('/tracker/exercise', {
        date: todayStr,
        name: exerciseName,
        duration_mins: parseFloat(exerciseDuration),
        calories_burned: parseFloat(exerciseCalories)
      });
      setTrackerData(res.data.tracker);
      setExerciseModalOpen(false);
      setExerciseName('');
      setExerciseDuration('');
      setExerciseCalories('');
      toast.success('Workout logged successfully! 🏃‍♂️');
    } catch (err) {
      console.error(err);
      toast.error('Failed to log workout activity.');
    } finally {
      setSubmittingExercise(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const consumed = trackerData?.calories_consumed || 0;
  const burned = trackerData?.calories_burned || 0;
  const targetCalories = user?.tdee || 2000;

  const protein = trackerData?.protein || 0;
  const carbs = trackerData?.carbs || 0;
  const fat = trackerData?.fat || 0;
  
  const targetProtein = user?.protein_requirement || 100;
  const targetWater = (user?.water_requirement || 2.5) * 1000;

  return (
    <div className="space-y-6">
      
      {/* Welcome header with Full Health Passport Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">{t('welcome')}, {user?.name || 'Harsha'}!</h2>
          <p className="text-sm text-gray-400 mt-1 font-semibold">
            {t('todaysHealthSummary')} - {new Date().toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'})} at {new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
          </p>
        </div>

        <button
          onClick={() => setHealthPassportOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 self-start md:self-center"
        >
          <span>📋 {t('viewFullHealthPassport')}</span>
        </button>
      </div>

      {/* Calories Overview */}
      <CaloriesCard consumed={consumed} burned={burned} target={targetCalories} />

      {/* Macronutrient breakdown */}
      <NutritionCards 
        protein={protein} 
        carbs={carbs} 
        fat={fat}
        targetProtein={targetProtein}
        targetCarbs={220} // default
        targetFat={65} // default
      />

      {/* Third row: Water, Workouts, Weight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Hydration Tracker */}
        <WaterProgressCard 
          current={trackerData?.water_intake || 0} 
          target={targetWater} 
          onAddWater={handleAddWater} 
        />

        {/* Physical Exercise Activity Logger */}
        <ExerciseProgressCard 
          caloriesBurned={burned} 
          durationMins={trackerData?.exercise?.reduce((acc, ex) => acc + ex.duration_mins, 0) || 0}
          onAddExercise={() => setExerciseModalOpen(true)} 
        />

        {/* Target Weight Goals */}
        <WeightTracker />

      </div>

      {/* Full Health Passport Summary Spotlight Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🩺</span>
            <div>
              <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100">{t('fullHealthProfileTitle')}</h3>
              <p className="text-xs text-gray-400">{t('fullHealthProfileDesc')}</p>
            </div>
          </div>
          <button
            onClick={() => setHealthPassportOpen(true)}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t('expandDetails')} ➔
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">{t('nameAndAge')}</span>
            <span className="font-extrabold text-gray-800 dark:text-gray-200 text-sm mt-0.5 block">{user?.name || 'Harsha'} ({user?.age || 26} yrs)</span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">{t('heightAndWeight')}</span>
            <span className="font-extrabold text-gray-800 dark:text-gray-200 text-sm mt-0.5 block">{user?.height || 1.75} m • {user?.weight || 68.0} kg</span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">{t('healthGoal')}</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">
              {user?.goal ? (t(user.goal) !== user.goal ? t(user.goal) : user.goal) : t('healthyLifestyle')}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">{t('diseasesConditions')}</span>
            <span className="font-extrabold text-purple-600 dark:text-purple-400 text-sm mt-0.5 block truncate">
              {user?.diseases?.length ? user.diseases.join(', ') : 'Diabetes, PCOS, Hypertension'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Medicine, BMI, and Today's meals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReminderCards reminders={reminders} />
        <BMICalculator />
        
        {/* Quick today's meals log list */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 shadow-soft">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{t('todaysMealChoices')}</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {meals.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">{t('noItemsLogged')}</p>
            ) : (
              meals.map((meal, index) => (
                <div key={index} className="flex justify-between items-center text-xs p-3 bg-gray-50 dark:bg-gray-800/35 rounded-xl border border-gray-100/50 dark:border-gray-800">
                  <div>
                    <span className="font-bold text-gray-700 dark:text-gray-300 block">{meal.food_name}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{meal.meal_type}</span>
                  </div>
                  <span className="font-bold text-green-500">{meal.calories} kcal</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Yoga Guide & Disease Guide Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Interactive Yoga Guide Spotlight Card */}
        <div className="bg-gradient-to-br from-emerald-950 via-gray-900 to-teal-950 text-white rounded-3xl p-6 shadow-soft border border-emerald-500/20 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                🧘 Disease-Based Yoga Guide
              </span>
              <span className="text-xs text-emerald-400 font-extrabold bg-emerald-900/40 px-2.5 py-0.5 rounded-md">43 Poses</span>
            </div>
            <h3 className="text-lg font-black text-white">Metabolic & Disease Yoga Companion</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Targeted yoga poses, animated procedure video demonstrators, voice guides, and breathing synchronizer for major health conditions.
            </p>

            {/* Quick Disease Tags linking directly to disease yoga poses in Yoga Guide */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { name: 'Diabetes', label: 'Diabetes' },
                { name: 'PCOS', label: 'PCOS / PCOD' },
                { name: 'Hypertension', label: 'High BP' },
                { name: 'Obesity', label: 'Weight Loss' },
                { name: 'Rickets', label: 'Rickets' },
                { name: 'Anemia', label: 'Anemia' },
                { name: 'GERD', label: 'Acid Reflux' },
                { name: 'Urinary', label: 'UTI' }
              ].map((dis) => (
                <Link
                  key={dis.name}
                  to={`/yoga_guide?disease=${encodeURIComponent(dis.name)}`}
                  className="text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-all"
                >
                  {dis.label} ➔
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/yoga_guide"
            className="flex items-center justify-between bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-3 rounded-xl transition-all shadow-md mt-2"
          >
            <span>Open All Disease Yogas & Procedure Videos</span>
            <span>➔</span>
          </Link>
        </div>

        {/* Medical Disease Guide Quick Card */}
        <div className="bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950 text-white rounded-3xl p-6 shadow-soft border border-purple-500/20 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-widest text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                🩺 Medical Disease & Nutrition
              </span>
              <span className="text-xs text-gray-400 font-bold">20+ Disease Guides</span>
            </div>
            <h3 className="text-lg font-black text-white">Foods to Eat, Foods to Avoid & Medicines</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Scientific dietary recommendations, lifestyle protocols, and educational drug class directory for major health conditions.
            </p>
          </div>

          <Link
            to="/disease_guide"
            className="flex items-center justify-between bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl transition-all shadow-md mt-2"
          >
            <span>Open Disease & Nutrition Guide</span>
            <span>➔</span>
          </Link>
        </div>

      </div>

      {/* Log Exercise Modal */}
      <ReusableModal 
        isOpen={exerciseModalOpen} 
        onClose={() => setExerciseModalOpen(false)} 
        title="Log Workout Activity"
      >
        <form onSubmit={handleAddExerciseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Exercise Name</label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="e.g. Running, Swimming, Yoga"
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

      {/* Comprehensive Full Health Passport Modal */}
      <ReusableModal
        isOpen={healthPassportOpen}
        onClose={() => setHealthPassportOpen(false)}
        title="📋 NutriNexus Full Health Passport & Complete History"
      >
        <div className="space-y-6 text-gray-700 dark:text-gray-200 text-xs max-h-[75vh] overflow-y-auto pr-1">
          
          {/* Header Summary */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="text-lg font-black">{user?.name || 'Harsha'}</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Primary Goal: <strong>{user?.goal || 'Healthy Lifestyle'}</strong> • Status Updated {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0"
            >
              🖨️ Print / Save Passport
            </button>
          </div>

          {/* 1. Demographics & Medical Profile */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>👤 1. Personal & Medical Profile</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div><span className="text-[10px] text-gray-400 font-bold uppercase block">Full Name</span><strong className="text-gray-800 dark:text-gray-200">{user?.name || 'Harsha'}</strong></div>
              <div><span className="text-[10px] text-gray-400 font-bold uppercase block">Age & Gender</span><strong className="text-gray-800 dark:text-gray-200">{user?.age || 26} yrs • {user?.gender || 'Male'}</strong></div>
              <div><span className="text-[10px] text-gray-400 font-bold uppercase block">Height & Weight</span><strong className="text-gray-800 dark:text-gray-200">{user?.height || 1.75} m • {user?.weight || 68.0} kg</strong></div>
              <div><span className="text-[10px] text-gray-400 font-bold uppercase block">BMI & Category</span><strong className="text-emerald-500">{user?.bmi || 22.2} (Healthy Range)</strong></div>
              <div><span className="text-[10px] text-gray-400 font-bold uppercase block">Daily TDEE Budget</span><strong className="text-gray-800 dark:text-gray-200">{user?.tdee || 2000} kcal/day</strong></div>
              <div><span className="text-[10px] text-gray-400 font-bold uppercase block">Target Hydration</span><strong className="text-blue-500">{user?.water_requirement || 2.5} Liters/day</strong></div>
              <div className="col-span-2 md:col-span-3 border-t border-gray-200/50 dark:border-gray-700/50 pt-2.5 mt-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Diagnosed Diseases / Conditions</span>
                <span className="font-extrabold text-purple-600 dark:text-purple-400 text-xs">
                  {user?.diseases?.length ? user.diseases.join(', ') : 'Diabetes, PCOS, Hypertension'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Today's Live Tracking Summary */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>📊 2. Today's Daily Tracking Status ({new Date().toLocaleDateString()})</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Calories Consumed</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{consumed} / {targetCalories} kcal</span>
              </div>
              <div className="bg-orange-50/40 dark:bg-orange-950/20 p-3 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Calories Burned</span>
                <span className="text-base font-black text-orange-500">{burned} kcal</span>
              </div>
              <div className="bg-blue-50/40 dark:bg-blue-950/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Water Intake</span>
                <span className="text-base font-black text-blue-500">{trackerData?.water_intake || 1500} / {targetWater} mL</span>
              </div>
              <div className="bg-purple-50/40 dark:bg-purple-950/20 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Protein / Carbs / Fat</span>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">{protein}g P • {carbs}g C • {fat}g F</span>
              </div>
            </div>
          </div>

          {/* 3. Daily Workouts & Fitness Updates */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>🏃‍♂️ 3. Logged Workout Activities</span>
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
              {trackerData?.exercise?.length ? (
                trackerData.exercise.map((ex, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{ex.name} ({ex.duration_mins} mins)</span>
                    <span className="font-extrabold text-orange-500">{ex.calories_burned} kcal burned</span>
                  </div>
                ))
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Brisk Aerobic Walking (30 mins at 07:30 AM)</span>
                    <span className="font-extrabold text-orange-500">160 kcal burned</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Sun Salutation Yoga (20 mins at 06:00 PM)</span>
                    <span className="font-extrabold text-orange-500">90 kcal burned</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Complete Meal History & Food Logs */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>🥗 4. Today's Meal Logging History</span>
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
              {meals.length > 0 ? (
                meals.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200 block">{m.food_name}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{m.meal_type}</span>
                    </div>
                    <span className="font-extrabold text-emerald-500">{m.calories} kcal</span>
                  </div>
                ))
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
                    <div><span className="font-bold text-gray-800 dark:text-gray-200 block">Vegetable Oats Porridge with Raw Almonds</span><span className="text-[10px] text-amber-500 font-bold uppercase">Breakfast (08:30 AM)</span></div>
                    <span className="font-extrabold text-emerald-500">310 kcal</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
                    <div><span className="font-bold text-gray-800 dark:text-gray-200 block">Mixed Vegetable Dal Rice with Curd & Salad</span><span className="text-[10px] text-emerald-500 font-bold uppercase">Lunch (01:15 PM)</span></div>
                    <span className="font-extrabold text-emerald-500">490 kcal</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
                    <div><span className="font-bold text-gray-800 dark:text-gray-200 block">Roasted Makhana (Lotus Seeds)</span><span className="text-[10px] text-teal-500 font-bold uppercase">Snack (05:00 PM)</span></div>
                    <span className="font-extrabold text-emerald-500">120 kcal</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
                    <div><span className="font-bold text-gray-800 dark:text-gray-200 block">Multigrain Phulka with Sauteed Paneer & Spinach Soup</span><span className="text-[10px] text-indigo-500 font-bold uppercase">Dinner (08:00 PM)</span></div>
                    <span className="font-extrabold text-emerald-500">380 kcal</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. Prescribed Medicine Reminders */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
              <span>💊 5. Prescribed Medicine Reminders</span>
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
                <div><span className="font-bold text-gray-800 dark:text-gray-200 block">Metformin 500mg</span><span className="text-[10px] text-purple-500 font-bold uppercase">Post Breakfast (08:00 AM) & Post Dinner (08:00 PM)</span></div>
                <span className="text-xs font-bold text-emerald-500">Active</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800">
                <div><span className="font-bold text-gray-800 dark:text-gray-200 block">Vitamin D3 60K & Calcium Citrate</span><span className="text-[10px] text-purple-500 font-bold uppercase">Post Lunch (01:30 PM)</span></div>
                <span className="text-xs font-bold text-emerald-500">Active</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setHealthPassportOpen(false)}
              className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs px-6 py-2.5 rounded-xl transition-all"
            >
              Close Health Passport
            </button>
          </div>

        </div>
      </ReusableModal>

    </div>
  );
};

export default Dashboard;
