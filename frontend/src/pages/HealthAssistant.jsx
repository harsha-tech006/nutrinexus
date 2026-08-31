import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  HiOutlineSparkles, 
  HiOutlineBookOpen, 
  HiOutlineClipboardCheck, 
  HiCheck, 
  HiX, 
  HiOutlineShare, 
  HiOutlineSave, 
  HiOutlineDownload, 
  HiOutlineRefresh, 
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlineMinus
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export const HealthAssistant = () => {
  const { user } = useContext(AuthContext);
  const [planType, setPlanType] = useState('daily'); // daily, weekly, monthly
  const [mealPlan, setMealPlan] = useState(null);
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emptyProfile, setEmptyProfile] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Health Profile customizer states
  const [customDiet, setCustomDiet] = useState('Vegetarian');
  const [customGoal, setCustomGoal] = useState('Healthy Lifestyle');
  const [customDiseases, setCustomDiseases] = useState([]);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [openSectionIdx, setOpenSectionIdx] = useState(0);

  useEffect(() => {
    if (user) {
      setCustomDiet(user.dietary_preference || 'Vegetarian');
      setCustomGoal(user.goal || 'Healthy Lifestyle');
      setCustomDiseases(user.diseases || []);
    }
  }, [user]);

  const fetchMealPlan = async (type, regenerate = false) => {
    setLoading(true);
    try {
      const res = await api.get(`/ai/mealplan?plan_type=${type}&regenerate=${regenerate}`);
      if (res.data.empty_profile) {
        setEmptyProfile(true);
        setMealPlan(null);
        setTracker(null);
      } else {
        setEmptyProfile(false);
        if (type === 'daily') {
          setMealPlan(res.data.meal_plan);
          setTracker(res.data.tracker);
        } else {
          setMealPlan(res.data.meal_plan);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate AI meal plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMealPlan(planType);
    }
  }, [user, planType]);

  const handleToggleEaten = async (mealType, currentEaten) => {
    try {
      const res = await api.post('/ai/mealplan/eaten', {
        meal_type: mealType,
        eaten: !currentEaten
      });
      setMealPlan(res.data.meal_plan);
      setTracker(res.data.tracker);
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update meal completion status.');
    }
  };

  const handleToggleSkip = async (mealType, currentSkipped) => {
    try {
      const res = await api.post('/ai/mealplan/skip', {
        meal_type: mealType,
        skipped: !currentSkipped
      });
      setMealPlan(res.data.meal_plan);
      setTracker(res.data.tracker);
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update meal skipped status.');
    }
  };

  const handleReplaceMeal = async (mealType) => {
    const loader = toast.loading('Generating healthy alternative...');
    try {
      const res = await api.post('/ai/mealplan/replace', {
        meal_type: mealType
      });
      setMealPlan(res.data.meal_plan);
      toast.success(res.data.message, { id: loader });
    } catch (err) {
      console.error(err);
      toast.error('Failed to replace meal.', { id: loader });
    }
  };

  const handleUpdateWater = async (amount) => {
    try {
      const currentVal = mealPlan?.water_consumed_ml || 0;
      const newVal = Math.max(0, currentVal + amount);
      const res = await api.post('/ai/mealplan/water', {
        water_ml: newVal
      });
      setMealPlan(res.data.meal_plan);
      setTracker(res.data.tracker);
      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error('Failed to log water consumption.');
    }
  };

  const handleSharePlan = () => {
    if (!mealPlan || planType !== 'daily') return;
    const text = `My NutriNexus AI Meal Plan for Today:
- Breakfast: ${mealPlan.meals.breakfast.name} (${mealPlan.meals.breakfast.calories} kcal)
- Morning Snack: ${mealPlan.meals.morning_snack.name} (${mealPlan.meals.morning_snack.calories} kcal)
- Lunch: ${mealPlan.meals.lunch.name} (${mealPlan.meals.lunch.calories} kcal)
- Evening Snack: ${mealPlan.meals.evening_snack.name} (${mealPlan.meals.evening_snack.calories} kcal)
- Dinner: ${mealPlan.meals.dinner.name} (${mealPlan.meals.dinner.calories} kcal)
Daily Target: ${mealPlan.nutrition_summary.target_calories} kcal.
Generate yours at NutriNexus AI!`;
    navigator.clipboard.writeText(text);
    toast.success('Meal plan summary copied to clipboard!');
  };

  const handleSavePlan = () => {
    toast.success('Meal plan saved to history successfully!');
  };

  const handlePrintPlan = () => {
    window.print();
  };

  const handleSaveAndRegenerate = async () => {
    setUpdatingProfile(true);
    const loader = toast.loading('Updating profile settings and regenerating meal plan...');
    try {
      await api.put('/auth/profile', {
        goal: customGoal,
        dietary_preference: customDiet,
        diseases: customDiseases
      });
      await fetchMealPlan(planType, true);
      toast.success('Profile updated and fresh plan generated! 🥗', { id: loader });
    } catch (err) {
      console.error(err);
      toast.error('Failed to update clinical profile settings.', { id: loader });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const parseTextReport = (text) => {
    if (!text) return [];
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;

    for (let line of lines) {
      const cleanLine = line.trim();
      const isHeader = cleanLine.startsWith('### Day') || 
                       cleanLine.startsWith('### Week') || 
                       cleanLine.startsWith('**Day') ||
                       (cleanLine.startsWith('Day ') && cleanLine.endsWith(':')) ||
                       cleanLine.startsWith('### Monday') || 
                       cleanLine.startsWith('### Tuesday') ||
                       cleanLine.startsWith('### Wednesday') ||
                       cleanLine.startsWith('### Thursday') ||
                       cleanLine.startsWith('### Friday') ||
                       cleanLine.startsWith('### Saturday') ||
                       cleanLine.startsWith('### Sunday');

      if (isHeader) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: cleanLine.replace(/###|\*\*/g, '').trim(),
          content: []
        };
      } else {
        if (currentSection) {
          currentSection.content.push(line);
        } else {
          if (cleanLine) {
            if (sections.length === 0) {
              sections.push({
                title: "General Recommendation",
                content: [line]
              });
              currentSection = sections[0];
            }
          }
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections.map(sec => ({
      title: sec.title,
      content: sec.content.join('\n').trim()
    }));
  };

  if (emptyProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto space-y-6">
        <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-500 rounded-full">
          <HiOutlineSparkles className="w-16 h-16 animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-gray-800 dark:text-gray-100">Personalized Plan Awaiting</h3>
        <p className="text-xs text-gray-400 font-bold leading-relaxed">
          Complete your medical and physical profile to receive personalized AI meal plans tailored to your BMI, fitness goals, and clinical constraints.
        </p>
        <Link
          to="/profile"
          className="w-full inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold text-xs py-3 px-6 rounded-2xl shadow-soft hover:scale-[1.02] transition-all"
        >
          Complete Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">AI Meal Planner</h2>
          <p className="text-sm text-gray-400 mt-1 font-semibold">Generates personalized nutrition plans based on your profile.</p>
        </div>
        
        {/* Toggle buttons */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl self-start">
          {['daily', 'weekly', 'monthly'].map((type) => (
            <button
              key={type}
              onClick={() => setPlanType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                planType === type
                  ? 'bg-green-500 text-white shadow-soft shadow-green-500/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading && !mealPlan ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          <p className="text-xs text-gray-400 animate-pulse uppercase font-semibold tracking-wider">AI Nutritionist is compiling your menu...</p>
        </div>

      ) : planType !== 'daily' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl px-5 py-4 shadow-soft">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold">
              <HiOutlineSparkles className="w-5 h-5 animate-pulse" />
              <h3 className="capitalize text-sm font-black">{planType} Meal Recommendation</h3>
            </div>
            <button
              onClick={handlePrintPlan}
              className="p-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
              title="Print Plan"
            >
              <HiOutlineDownload className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {parseTextReport(mealPlan).map((section, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl overflow-hidden shadow-soft transition-all"
              >
                <button
                  onClick={() => setOpenSectionIdx(openSectionIdx === idx ? -1 : idx)}
                  className="w-full px-6 py-4 flex justify-between items-center bg-gray-50/30 dark:bg-gray-850/10 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors text-left"
                >
                  <span className="font-bold text-xs text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span>📅</span>
                    <span>{section.title}</span>
                  </span>
                  <span className="text-gray-400 text-xs font-semibold">
                    {openSectionIdx === idx ? 'Collapse ▲' : 'Expand ▼'}
                  </span>
                </button>

                {openSectionIdx === idx && (
                  <div className="p-6 prose dark:prose-invert max-w-none text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line border-t border-gray-150 dark:border-gray-800">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div id="print-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main timeline of meal cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header info bar */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl px-5 py-4 shadow-soft">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-green-50 dark:bg-green-950/20 text-green-500 rounded-lg text-xs font-black">AI Active</span>
                <span className="text-xs font-black text-gray-700 dark:text-gray-300">Target: {mealPlan?.nutrition_summary?.target_calories} kcal</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => fetchMealPlan('daily', true)}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  title="Generate New Menu"
                >
                  <HiOutlineRefresh className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSharePlan}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  title="Share Menu"
                >
                  <HiOutlineShare className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrintPlan}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  title="Print Menu"
                >
                  <HiOutlineDownload className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Smart Daily Tip */}
            {mealPlan?.daily_tip && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/10 dark:to-teal-950/10 border border-emerald-100/60 dark:border-emerald-900/20 p-4 rounded-2xl flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Daily Smart Tip</h5>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">{mealPlan.daily_tip}</p>
                </div>
              </div>
            )}

            {/* Meals timeline grid */}
            <div className="space-y-4">
              {mealPlan?.meals && Object.entries(mealPlan.meals).map(([key, meal]) => {
                const iconMap = {
                  breakfast: "🍽️",
                  morning_snack: "🍎",
                  lunch: "🥗",
                  evening_snack: "🥜",
                  dinner: "🍲"
                };
                
                return (
                  <div 
                    key={key} 
                    className={`bg-white dark:bg-gray-900 border transition-all duration-200 rounded-3xl p-5 shadow-soft flex flex-col ${
                      meal.eaten 
                        ? 'border-green-200 dark:border-green-950/30 opacity-90' 
                        : meal.skipped
                        ? 'border-orange-200/60 dark:border-orange-950/30 opacity-75'
                        : 'border-gray-200/50 dark:border-gray-800/40 hover:border-gray-300 dark:hover:border-gray-700/60'
                    }`}
                  >
                    
                    {/* Breakfast Skipped Compensating Box */}
                    {key === 'lunch' && mealPlan.meals.breakfast?.skipped && (
                      <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/60 dark:border-orange-900/20 p-4 rounded-2xl mb-4 space-y-2">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-xs">
                          <span>⚠️</span>
                          <span>Breakfast was skipped today!</span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                          To prevent energy drops and stabilize blood sugar, your lunch should have high fiber and extra protein. We suggest one of these healthy additions:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                          <div className="p-2.5 bg-white dark:bg-gray-900 border border-gray-150/40 dark:border-gray-800 rounded-xl text-[10px] font-bold text-gray-600 dark:text-gray-350">
                            🥗 <span className="text-orange-500 font-black">Option A:</span> Double the salad portion or add 100g Grilled Tofu/Chicken breast (+18g Protein)
                          </div>
                          <div className="p-2.5 bg-white dark:bg-gray-900 border border-gray-150/40 dark:border-gray-800 rounded-xl text-[10px] font-bold text-gray-600 dark:text-gray-350">
                            🥛 <span className="text-orange-500 font-black">Option B:</span> Add 150g Low-fat Curd/Greek Yogurt or a handful of raw almonds (+10g Protein)
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Food Image cover */}
                      <div className="w-full md:w-32 h-28 shrink-0 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 relative group">
                        {meal.imageUrl ? (
                          <img 
                            src={meal.imageUrl} 
                            alt={meal.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/assets/meals/oats.jpg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl bg-green-50 dark:bg-green-950/20">
                            {iconMap[key] || "🍛"}
                          </div>
                        )}
                        
                        {meal.eaten && (
                          <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-green-500 text-white p-1 rounded-full shadow-md">
                              <HiCheck className="w-4 h-4 font-black" />
                            </span>
                          </div>
                        )}

                        {meal.skipped && (
                          <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md uppercase tracking-wider">
                              Skipped
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Meal details block */}
                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        
                        <div className="space-y-1.5">
                          {/* Meal Title and Timings */}
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-green-500 flex items-center gap-1.5">
                              <span>{iconMap[key] || "🍽️"}</span>
                              <span>{key.replace('_', ' ')}</span>
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">{meal.schedule}</span>
                          </div>

                          {/* Meal Name */}
                          <h4 className="text-sm font-black text-gray-800 dark:text-gray-100 line-clamp-1">{meal.name}</h4>
                          
                          {/* Timing and Info Chips */}
                          <div className="flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-[10px] text-gray-400 font-bold rounded-md">Prep: {meal.prep_time}</span>
                            <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-[10px] text-gray-400 font-bold rounded-md">Serving: {meal.serving_size}</span>
                          </div>

                          {/* Nutrition Chips */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded-md">{meal.calories} kcal</span>
                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-md">P: {meal.protein}g</span>
                            <span className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 text-[10px] font-bold rounded-md">C: {meal.carbs}g</span>
                            <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-md">F: {meal.fat}g</span>
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md">Fiber: {meal.fiber}g</span>
                          </div>
                        </div>

                        {/* Benefits bullets */}
                        {meal.benefits && meal.benefits.length > 0 && (
                          <div className="text-[10px] text-gray-400 font-bold leading-relaxed list-inside pl-1 space-y-0.5">
                            {meal.benefits.slice(0, 2).map((b, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                                <span>{b}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Interactive Buttons */}
                        <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-800/60 pt-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedRecipe(meal)}
                              className="inline-flex items-center gap-1 text-[10px] font-black text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors uppercase tracking-wider"
                            >
                              <HiOutlineEye className="w-3.5 h-3.5" />
                              <span>View Recipe</span>
                            </button>
                            
                            <button
                              onClick={() => handleReplaceMeal(key)}
                              className="inline-flex items-center gap-1 text-[10px] font-black text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider"
                            >
                              <HiOutlineRefresh className="w-3.5 h-3.5" />
                              <span>Replace</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {['breakfast', 'lunch', 'morning_snack', 'evening_snack'].includes(key) && (
                              <button
                                onClick={() => handleToggleSkip(key, meal.skipped)}
                                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                                  meal.skipped 
                                    ? 'bg-orange-500 text-white shadow-soft shadow-orange-500/15'
                                    : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100'
                                }`}
                              >
                                {meal.skipped ? '✓ Skipped' : 'Skip Meal'}
                              </button>
                            )}

                            <button
                              onClick={() => handleToggleEaten(key, meal.eaten)}
                              disabled={meal.skipped}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                                meal.eaten 
                                  ? 'bg-green-500 text-white shadow-soft shadow-green-500/15'
                                  : 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 hover:bg-green-100'
                              }`}
                            >
                              {meal.eaten ? '✓ Eaten' : 'Mark as Eaten'}
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Parameters and Daily Nutrition Summary */}
          <div className="space-y-6">
            
            {/* Clinical Profile & Conditions Customizer */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-3xl p-6 shadow-soft space-y-4">
              <h3 className="font-black text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2 border-b border-gray-150 dark:border-gray-800/60 pb-3">
                <span>🧬</span>
                <span>Profile & Clinical Goals</span>
              </h3>
              
              <div className="space-y-3.5 text-xs">
                {/* Diet Preference Select */}
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Diet Type</label>
                  <select
                    value={customDiet}
                    onChange={(e) => setCustomDiet(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                  </select>
                </div>

                {/* Fitness Goal Select */}
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Fitness Goal</label>
                  <select
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  >
                    <option value="Healthy Lifestyle">Healthy Lifestyle</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                  </select>
                </div>

                {/* Clinical Conditions Checklist */}
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">Clinical Conditions</label>
                  <div className="space-y-1.5 pt-1 pl-1">
                    {['Diabetes', 'PCOS', 'Kidney Disease', 'Hypertension', 'Obesity'].map((cond) => (
                      <label key={cond} className="flex items-center gap-2 font-bold text-gray-600 dark:text-gray-350 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={customDiseases.includes(cond)}
                          onChange={() => {
                            if (customDiseases.includes(cond)) {
                              setCustomDiseases(prev => prev.filter(c => c !== cond));
                            } else {
                              setCustomDiseases(prev => [...prev, cond]);
                            }
                          }}
                          className="rounded text-green-500 focus:ring-green-500/20 border-gray-300 dark:border-gray-800"
                        />
                        <span>{cond}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={handleSaveAndRegenerate}
                  disabled={updatingProfile}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 rounded-xl text-center shadow-md transition-all text-xs"
                >
                  {updatingProfile ? 'Saving Settings...' : 'Save & Regenerate Plan'}
                </button>
              </div>
            </div>

            {/* Daily Nutrition Summary card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-3xl p-6 shadow-soft space-y-5">

              <h3 className="font-black text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2 border-b border-gray-150 dark:border-gray-800/60 pb-3">
                <HiOutlineClipboardCheck className="w-5 h-5 text-green-500" />
                <span>Today's Nutrition Summary</span>
              </h3>

              {tracker && mealPlan?.nutrition_summary && (
                <div className="space-y-4">
                  {/* Calories Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                      <span>Calories Consumed</span>
                      <span>{tracker.calories_consumed || 0} / {mealPlan.nutrition_summary.target_calories} kcal</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((tracker.calories_consumed || 0) / mealPlan.nutrition_summary.target_calories) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Protein Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      <span>Protein (Target: {mealPlan.nutrition_summary.target_protein}g)</span>
                      <span>{tracker.protein || 0}g</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((tracker.protein || 0) / mealPlan.nutrition_summary.target_protein) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Carbs Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      <span>Carbohydrates (Target: {mealPlan.nutrition_summary.target_carbs}g)</span>
                      <span>{tracker.carbs || 0}g</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-sky-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((tracker.carbs || 0) / mealPlan.nutrition_summary.target_carbs) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Fats Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      <span>Healthy Fats (Target: {mealPlan.nutrition_summary.target_fat}g)</span>
                      <span>{tracker.fat || 0}g</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((tracker.fat || 0) / mealPlan.nutrition_summary.target_fat) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Fiber Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      <span>Fiber (Target: {mealPlan.nutrition_summary.target_fiber}g)</span>
                      <span>{tracker.fiber || 0}g</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((tracker.fiber || 0) / mealPlan.nutrition_summary.target_fiber) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Water Goal Tracker */}
            {mealPlan && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-3xl p-6 shadow-soft space-y-4">
                <h3 className="font-black text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2 border-b border-gray-150 dark:border-gray-800/60 pb-3">
                  <span className="text-lg">💧</span>
                  <span>Water Intake Tracker</span>
                </h3>
                
                <div className="text-center space-y-3">
                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                    {/* Water visual ring */}
                    <svg className="transform -rotate-90" width="144" height="144">
                      <circle
                        className="text-gray-100 dark:text-gray-800"
                        strokeWidth="6"
                        stroke="currentColor"
                        fill="transparent"
                        r="64"
                        cx="72"
                        cy="72"
                      />
                      <circle
                        className="text-sky-500 transition-all duration-500"
                        strokeWidth="6"
                        strokeDasharray={2 * Math.PI * 64}
                        strokeDashoffset={(2 * Math.PI * 64) - (((mealPlan.water_consumed_ml || 0) / mealPlan.water_goal_ml) * 2 * Math.PI * 64)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="64"
                        cx="72"
                        cy="72"
                      />
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tighter">
                        {mealPlan.water_consumed_ml || 0}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">/ {mealPlan.water_goal_ml} ml</span>
                    </div>
                  </div>

                  {/* Log Water buttons */}
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleUpdateWater(-250)}
                      className="p-2 rounded-xl bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                      title="Subtract 250ml"
                    >
                      <HiOutlineMinus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateWater(250)}
                      className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-[10px] rounded-xl flex items-center gap-1 shadow-md shadow-sky-500/10 transition-colors"
                    >
                      <HiOutlinePlus className="w-3.5 h-3.5" />
                      <span>250ml</span>
                    </button>
                    <button
                      onClick={() => handleUpdateWater(500)}
                      className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] rounded-xl flex items-center gap-1 shadow-md shadow-sky-600/15 transition-colors"
                    >
                      <HiOutlinePlus className="w-3.5 h-3.5" />
                      <span>500ml</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Planning Parameters card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 shadow-soft space-y-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2 border-b border-gray-150 dark:border-gray-800/60 pb-3">
                <HiOutlineBookOpen className="w-5 h-5 text-green-500" />
                <span>Dietary Context</span>
              </h3>
              <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Weight Profile:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{user?.weight} kg (Goal: {user?.goal})</span>
                </div>
                <div className="flex justify-between">
                  <span>Activity Index:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{user?.activity_level || 'Moderate'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conditions:</span>
                  <span className="font-bold text-red-500 truncate max-w-[150px]">
                    {(user?.diseases && user.diseases.join(', ')) || 'None'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Recipe step-by-step Modal Overlay */}
          {selectedRecipe && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/80 dark:bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-800/80 space-y-5 shadow-2xl relative">
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute right-4 top-4 p-1.5 rounded-lg bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <HiX className="w-4 h-4" />
                </button>

                <div className="space-y-1.5 pr-8">
                  <span className="text-[10px] font-black uppercase text-green-500 tracking-wider">AI Recipe Guide</span>
                  <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">{selectedRecipe.name}</h3>
                </div>

                {/* Info summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-850 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/40 text-center">
                  <div>
                    <h6 className="text-[9px] font-black text-gray-400 uppercase">Prep Time</h6>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{selectedRecipe.prep_time}</span>
                  </div>
                  <div>
                    <h6 className="text-[9px] font-black text-gray-400 uppercase">Calories</h6>
                    <span className="text-xs font-bold text-orange-500">{selectedRecipe.calories} kcal</span>
                  </div>
                  <div>
                    <h6 className="text-[9px] font-black text-gray-400 uppercase">Protein</h6>
                    <span className="text-xs font-bold text-indigo-500">{selectedRecipe.protein}g</span>
                  </div>
                  <div>
                    <h6 className="text-[9px] font-black text-gray-400 uppercase">Fiber</h6>
                    <span className="text-xs font-bold text-emerald-500">{selectedRecipe.fiber}g</span>
                  </div>
                </div>

                {/* Recipe instructions */}
                <div className="space-y-2">
                  <h5 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Preparation Steps</h5>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800/60 p-4 rounded-xl">
                    {selectedRecipe.recipe}
                  </p>
                </div>

                {/* Healthy alternative details */}
                {selectedRecipe.healthy_alternative && (
                  <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-900/10 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h6 className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">Healthy Alternative</h6>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{selectedRecipe.healthy_alternative}</p>
                    </div>
                    <button
                      onClick={() => {
                        toast.success('Replacing meal with alternative option...');
                        setSelectedRecipe(null);
                        // Add action or just trigger a dynamic replacement
                      }}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider rounded-xl transition-all"
                    >
                      Swap Alternative
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default HealthAssistant;
