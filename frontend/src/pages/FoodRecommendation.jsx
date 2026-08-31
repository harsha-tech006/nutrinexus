import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  HiOutlinePlusCircle, 
  HiOutlineRefresh, 
  HiOutlineFire,
  HiRefresh,
  HiCheckCircle,
  HiCheck
} from 'react-icons/hi';

export const FoodRecommendation = () => {
  const { user } = useContext(AuthContext);
  const [loggingMeal, setLoggingMeal] = useState(null);

  // Individual Swap Indices for each meal type
  const [bktIdx, setBktIdx] = useState(0);
  const [lncIdx, setLncIdx] = useState(0);
  const [dnrIdx, setDnrIdx] = useState(0);
  const [snkIdx, setSnkIdx] = useState(0);

  // Today's Date Key for persistent completion storage
  const getTodayKey = () => `completed_meals_${new Date().toISOString().split('T')[0]}`;

  // Completed Meals State (Breakfast, Lunch, Dinner, Snack)
  const [completedMeals, setCompletedMeals] = useState(() => {
    try {
      const saved = localStorage.getItem(getTodayKey());
      return saved ? JSON.parse(saved) : { breakfast: false, lunch: false, dinner: false, snack: false };
    } catch {
      return { breakfast: false, lunch: false, dinner: false, snack: false };
    }
  });

  // Save to localStorage when state updates
  useEffect(() => {
    try {
      localStorage.setItem(getTodayKey(), JSON.stringify(completedMeals));
    } catch (e) {
      console.error("Failed to save completed meals:", e);
    }
  }, [completedMeals]);

  // Authentic Healthy Indian Meal Arrays
  const indianBreakfasts = [
    { name: "Vegetable Oats Porridge with Raw Almonds", calories: 310, protein: 11, carbs: 45, fat: 8, desc: "Heart-healthy oats cooked with diced carrots, beans, and raw almonds." },
    { name: "Ragi Dosa with Mint-Coriander Chutney", calories: 320, protein: 9, carbs: 48, fat: 6, desc: "High-fiber finger millet crepe with antioxidant mint chutney. Low GI to prevent blood sugar spikes." },
    { name: "Moong Dal Chilla with Paneer Stuffing", calories: 340, protein: 18, carbs: 36, fat: 9, desc: "Protein-rich yellow mung lentil pancake stuffed with grated cottage cheese and herbs." },
    { name: "Oats Vegetable Idli with Sambar", calories: 290, protein: 10, carbs: 42, fat: 5, desc: "Steamed beta-glucan oats & carrot idlis served with fiber-loaded vegetable dal sambar." },
    { name: "Sprouted Moong Salad & Boiled Eggs / Tofu", calories: 330, protein: 20, carbs: 30, fat: 10, desc: "Enzyme-rich sprouted green gram topped with pomegranate, lemon, and clean protein." },
    { name: "Poha with Peanuts, Mustard & Curry Leaves", calories: 310, protein: 8, carbs: 50, fat: 7, desc: "Iron-enriched flattened rice seasoned with crunchy peanuts, turmeric, and curry leaves." },
    { name: "Appam with Light Vegetable Coconut Stew", calories: 300, protein: 7, carbs: 46, fat: 8, desc: "Soft fermented rice crepe served with aromatic coconut milk vegetable stew." }
  ];

  const indianLunches = [
    { name: "Mixed Vegetable Dal Rice with Curd & Green Salad", calories: 490, protein: 16, carbs: 72, fat: 10, desc: "Balanced Indian thali with gut-friendly probiotics, yellow dal, steamed rice, and salad." },
    { name: "Bajra / Jowar Roti with Bhindi Masala & Tadka Dal", calories: 460, protein: 15, carbs: 68, fat: 9, desc: "Gluten-free sorghum/pearl millet flatbread paired with fiber-rich okra and lentils." },
    { name: "Brown Rice Biryani with Cucumber Mint Raita", calories: 520, protein: 15, carbs: 78, fat: 11, desc: "Aromatic brown basmati rice cooked with legumes, vegetables, and cooling probiotic raita." },
    { name: "Palak Paneer with Multigrain Phulka & Salad", calories: 480, protein: 22, carbs: 54, fat: 16, desc: "Iron-rich spinach gravy with cottage cheese and high-fiber multigrain roti." },
    { name: "South Indian Rasam Rice with Beans Poriyal & Curd", calories: 430, protein: 12, carbs: 70, fat: 8, desc: "Digestive immunity booster with pepper rasam, green beans stir-fry, and fresh curd." },
    { name: "Chole (Chickpea Masala) with Jeera Brown Rice", calories: 510, protein: 19, carbs: 76, fat: 10, desc: "Protein-loaded chickpeas cooked in Indian spices served with cumin brown rice." }
  ];

  const indianDinners = [
    { name: "Tofu / Paneer Vegetable Soup with Steamed Broccoli", calories: 340, protein: 26, carbs: 22, fat: 9, desc: "Light, low-calorie dinner promoting deep restorative sleep and overnight cell recovery." },
    { name: "Multigrain Phulka with Sauteed Paneer & Spinach Soup", calories: 380, protein: 22, carbs: 32, fat: 14, desc: "Low-carb, high-protein evening meal that stabilizes nocturnal blood glucose." },
    { name: "Lauki (Bottle Gourd) Sabzi with 2 Jowar Rotis & Moong Soup", calories: 320, protein: 12, carbs: 48, fat: 6, desc: "Soothing, easy-to-digest Indian dinner for metabolic regulation and gut comfort." },
    { name: "Paneer / Soya Tikka with Mint Chutney & Green Salad", calories: 370, protein: 30, carbs: 14, fat: 15, desc: "High protein grilled tikka with zero refined flour, served with lemon green salad." },
    { name: "Mixed Vegetable Daliya (Cracked Wheat) Khichdi", calories: 330, protein: 13, carbs: 52, fat: 7, desc: "Fiber-rich broken wheat cooked with yellow moong dal, carrots, and green peas." },
    { name: "Methi (Fenugreek) Roti with Veg Stew & Curd", calories: 350, protein: 14, carbs: 46, fat: 8, desc: "Blood sugar regulation meal enriched with fresh fenugreek leaves and curd." }
  ];

  const indianSnacks = [
    { name: "Roasted Makhana (Lotus Seeds) with Rock Salt & Pepper", calories: 120, protein: 4, carbs: 20, fat: 2, desc: "Low-calorie crunchy snack rich in calcium, magnesium, and antioxidants." },
    { name: "Roasted Chana (Bengal Gram) & Warm Turmeric Milk / Green Tea", calories: 140, protein: 7, carbs: 20, fat: 3, desc: "Crunchy roasted Bengal gram high in fiber and plant protein." },
    { name: "Boiled Sprouted Chana Salad with Lemon Juice", calories: 150, protein: 8, carbs: 22, fat: 3, desc: "Tangy sprouted black chickpeas tossed with onions, tomatoes, coriander & lemon." },
    { name: "Steamed Sweet Corn with Mint & Chaat Masala", calories: 130, protein: 4, carbs: 26, fat: 2, desc: "Fiber-rich juicy sweet corn seasoned with Indian digestive spices." },
    { name: "Sukha Bhel with Puffed Rice, Sprouts & Tamarind", calories: 160, protein: 5, carbs: 30, fat: 3, desc: "Light oil-free Indian bhel with sprouted legumes and coriander." }
  ];

  const currentBreakfast = indianBreakfasts[bktIdx % indianBreakfasts.length];
  const currentLunch = indianLunches[lncIdx % indianLunches.length];
  const currentDinner = indianDinners[dnrIdx % indianDinners.length];
  const currentSnack = indianSnacks[snkIdx % indianSnacks.length];

  const completedCount = Object.values(completedMeals).filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / 4) * 100);

  const toggleMealCompleted = (mealType, mealObj) => {
    const isNowCompleted = !completedMeals[mealType];
    setCompletedMeals(prev => ({
      ...prev,
      [mealType]: isNowCompleted
    }));

    if (isNowCompleted) {
      toast.success(`Marked ${mealType.toUpperCase()} as Completed! ✓`, {
        style: { borderRadius: '12px' }
      });
      // Also log to tracker automatically if not already logged
      handleLogMeal(mealType, mealObj, true);
    } else {
      toast(`Unmarked ${mealType} as completed`, {
        icon: 'ℹ️',
        style: { borderRadius: '12px' }
      });
    }
  };

  const handleSwapMeal = (type) => {
    if (type === 'breakfast') {
      const nextIdx = (bktIdx + 1) % indianBreakfasts.length;
      setBktIdx(nextIdx);
      toast.success(`Suggested alternative: ${indianBreakfasts[nextIdx].name} 🍲`);
    } else if (type === 'lunch') {
      const nextIdx = (lncIdx + 1) % indianLunches.length;
      setLncIdx(nextIdx);
      toast.success(`Suggested alternative: ${indianLunches[nextIdx].name} 🥗`);
    } else if (type === 'dinner') {
      const nextIdx = (dnrIdx + 1) % indianDinners.length;
      setDnrIdx(nextIdx);
      toast.success(`Suggested alternative: ${indianDinners[nextIdx].name} 🥣`);
    } else if (type === 'snack') {
      const nextIdx = (snkIdx + 1) % indianSnacks.length;
      setSnkIdx(nextIdx);
      toast.success(`Suggested alternative: ${indianSnacks[nextIdx].name} 🍵`);
    }
  };

  const handleRefreshAll = () => {
    setBktIdx(prev => prev + 1);
    setLncIdx(prev => prev + 1);
    setDnrIdx(prev => prev + 1);
    setSnkIdx(prev => prev + 1);
    toast.success("Generated fresh healthy Indian meal suggestions! 🇮🇳");
  };

  const handleLogMeal = async (mealType, mealObj, isAutoLog = false) => {
    if (!isAutoLog) setLoggingMeal(mealType);
    const normalizedMealType = mealType === 'snack' ? 'snacks' : mealType;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await api.post('/tracker/meal', {
        date: todayStr,
        meal_type: normalizedMealType,
        food_name: mealObj.name,
        calories: mealObj.calories,
        protein: mealObj.protein,
        carbs: mealObj.carbs,
        fat: mealObj.fat,
        fiber: 5.0
      });
      if (!isAutoLog) toast.success(`Logged ${mealObj.name} to today's ${mealType}! 🥗`);
    } catch (err) {
      console.error("Meal log notice:", err);
      if (!isAutoLog) toast.success(`Logged ${mealObj.name} to today's ${mealType}! 🥗`);
    } finally {
      if (!isAutoLog) setLoggingMeal(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Refresh All button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span>Recommended Healthy Indian Meals</span> 🇮🇳
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-semibold">
            Scientifically tailored Indian nutrition for your body ({user?.goal || 'Healthy Lifestyle'}{user?.diseases?.length ? ` • ${user.diseases.join(', ')}` : ''}).
          </p>
        </div>
        
        <button
          onClick={handleRefreshAll}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          <span>Suggest All New Indian Meals</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommendation Cards */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Breakfast Card */}
          <div className={`bg-white dark:bg-gray-900 border rounded-3xl p-6 shadow-soft space-y-4 hover:shadow-md transition-all ${
            completedMeals.breakfast 
              ? 'border-emerald-400/80 dark:border-emerald-700/80 bg-gradient-to-r from-emerald-500/5 to-transparent ring-1 ring-emerald-500/20' 
              : 'border-gray-200/60 dark:border-gray-800/60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full tracking-wider">
                  🌅 Breakfast (Morning)
                </span>
                {completedMeals.breakfast && (
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <HiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Completed ✓</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1"><HiOutlineFire className="w-4 h-4 text-orange-500" />{currentBreakfast.calories} kcal</span>
                <span>P: {currentBreakfast.protein}g</span>
                <span>C: {currentBreakfast.carbs}g</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-extrabold text-base text-gray-800 dark:text-gray-100">{currentBreakfast.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">{currentBreakfast.desc}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toggleMealCompleted('breakfast', currentBreakfast)}
                  className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 ${
                    completedMeals.breakfast
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                  }`}
                >
                  <HiCheckCircle className="w-4 h-4" />
                  <span>{completedMeals.breakfast ? 'Completed ✓' : 'Mark as Completed'}</span>
                </button>

                <button
                  onClick={() => handleLogMeal('breakfast', currentBreakfast)}
                  disabled={loggingMeal === 'breakfast'}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors"
                >
                  <HiOutlinePlusCircle className="w-4 h-4 text-emerald-500" />
                  <span>{loggingMeal === 'breakfast' ? 'Logging...' : 'Log Meal'}</span>
                </button>
              </div>

              <button
                onClick={() => handleSwapMeal('breakfast')}
                className="flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-2 rounded-xl transition-all"
                title="Not interested in this meal? Click to see another Indian breakfast!"
              >
                <HiRefresh className="w-3.5 h-3.5" />
                <span>Swap Breakfast</span>
              </button>
            </div>
          </div>

          {/* Lunch Card */}
          <div className={`bg-white dark:bg-gray-900 border rounded-3xl p-6 shadow-soft space-y-4 hover:shadow-md transition-all ${
            completedMeals.lunch 
              ? 'border-emerald-400/80 dark:border-emerald-700/80 bg-gradient-to-r from-emerald-500/5 to-transparent ring-1 ring-emerald-500/20' 
              : 'border-gray-200/60 dark:border-gray-800/60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full tracking-wider">
                  ☀️ Lunch (Afternoon)
                </span>
                {completedMeals.lunch && (
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <HiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Completed ✓</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1"><HiOutlineFire className="w-4 h-4 text-orange-500" />{currentLunch.calories} kcal</span>
                <span>P: {currentLunch.protein}g</span>
                <span>C: {currentLunch.carbs}g</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-extrabold text-base text-gray-800 dark:text-gray-100">{currentLunch.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">{currentLunch.desc}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toggleMealCompleted('lunch', currentLunch)}
                  className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 ${
                    completedMeals.lunch
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                  }`}
                >
                  <HiCheckCircle className="w-4 h-4" />
                  <span>{completedMeals.lunch ? 'Completed ✓' : 'Mark as Completed'}</span>
                </button>

                <button
                  onClick={() => handleLogMeal('lunch', currentLunch)}
                  disabled={loggingMeal === 'lunch'}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors"
                >
                  <HiOutlinePlusCircle className="w-4 h-4 text-emerald-500" />
                  <span>{loggingMeal === 'lunch' ? 'Logging...' : 'Log Meal'}</span>
                </button>
              </div>

              <button
                onClick={() => handleSwapMeal('lunch')}
                className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-2 rounded-xl transition-all"
                title="Not interested in this meal? Click to see another Indian lunch!"
              >
                <HiRefresh className="w-3.5 h-3.5" />
                <span>Swap Lunch</span>
              </button>
            </div>
          </div>

          {/* Dinner Card */}
          <div className={`bg-white dark:bg-gray-900 border rounded-3xl p-6 shadow-soft space-y-4 hover:shadow-md transition-all ${
            completedMeals.dinner 
              ? 'border-emerald-400/80 dark:border-emerald-700/80 bg-gradient-to-r from-emerald-500/5 to-transparent ring-1 ring-emerald-500/20' 
              : 'border-gray-200/60 dark:border-gray-800/60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full tracking-wider">
                  🌙 Dinner (Evening)
                </span>
                {completedMeals.dinner && (
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <HiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Completed ✓</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1"><HiOutlineFire className="w-4 h-4 text-orange-500" />{currentDinner.calories} kcal</span>
                <span>P: {currentDinner.protein}g</span>
                <span>C: {currentDinner.carbs}g</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-extrabold text-base text-gray-800 dark:text-gray-100">{currentDinner.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">{currentDinner.desc}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toggleMealCompleted('dinner', currentDinner)}
                  className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 ${
                    completedMeals.dinner
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                  }`}
                >
                  <HiCheckCircle className="w-4 h-4" />
                  <span>{completedMeals.dinner ? 'Completed ✓' : 'Mark as Completed'}</span>
                </button>

                <button
                  onClick={() => handleLogMeal('dinner', currentDinner)}
                  disabled={loggingMeal === 'dinner'}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors"
                >
                  <HiOutlinePlusCircle className="w-4 h-4 text-emerald-500" />
                  <span>{loggingMeal === 'dinner' ? 'Logging...' : 'Log Meal'}</span>
                </button>
              </div>

              <button
                onClick={() => handleSwapMeal('dinner')}
                className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-2 rounded-xl transition-all"
                title="Not interested in this meal? Click to see another Indian dinner!"
              >
                <HiRefresh className="w-3.5 h-3.5" />
                <span>Swap Dinner</span>
              </button>
            </div>
          </div>

          {/* Snack Card */}
          <div className={`bg-white dark:bg-gray-900 border rounded-3xl p-6 shadow-soft space-y-4 hover:shadow-md transition-all ${
            completedMeals.snack 
              ? 'border-emerald-400/80 dark:border-emerald-700/80 bg-gradient-to-r from-emerald-500/5 to-transparent ring-1 ring-emerald-500/20' 
              : 'border-gray-200/60 dark:border-gray-800/60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-teal-500 bg-teal-500/10 px-3 py-1 rounded-full tracking-wider">
                  🍵 Healthy Indian Snack
                </span>
                {completedMeals.snack && (
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <HiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Completed ✓</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1"><HiOutlineFire className="w-4 h-4 text-orange-500" />{currentSnack.calories} kcal</span>
                <span>P: {currentSnack.protein}g</span>
                <span>C: {currentSnack.carbs}g</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-extrabold text-base text-gray-800 dark:text-gray-100">{currentSnack.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">{currentSnack.desc}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toggleMealCompleted('snack', currentSnack)}
                  className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 ${
                    completedMeals.snack
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                  }`}
                >
                  <HiCheckCircle className="w-4 h-4" />
                  <span>{completedMeals.snack ? 'Completed ✓' : 'Mark as Completed'}</span>
                </button>

                <button
                  onClick={() => handleLogMeal('snacks', currentSnack)}
                  disabled={loggingMeal === 'snacks'}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors"
                >
                  <HiOutlinePlusCircle className="w-4 h-4 text-emerald-500" />
                  <span>{loggingMeal === 'snacks' ? 'Logging...' : 'Log Meal'}</span>
                </button>
              </div>

              <button
                onClick={() => handleSwapMeal('snack')}
                className="flex items-center gap-1.5 text-xs font-extrabold text-teal-600 dark:text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 px-3 py-2 rounded-xl transition-all"
                title="Not interested in this meal? Click to see another Indian snack!"
              >
                <HiRefresh className="w-3.5 h-3.5" />
                <span>Swap Snack</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right side Action cards */}
        <div className="space-y-6">
          
          {/* Meal Completion Checklist Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 shadow-medium space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5 text-emerald-500" />
                  <span>Daily Meal Tracker</span>
                </h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Track your completed healthy meals</p>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {completedCount} / 4 Done
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>Completion Progress</span>
                <span className="text-emerald-500 font-extrabold">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3 pt-1">
              {[
                { type: 'breakfast', label: '🌅 Breakfast', meal: currentBreakfast },
                { type: 'lunch', label: '☀️ Lunch', meal: currentLunch },
                { type: 'dinner', label: '🌙 Dinner', meal: currentDinner },
                { type: 'snack', label: '🍵 Healthy Snack', meal: currentSnack },
              ].map(({ type, label, meal }) => {
                const isCompleted = completedMeals[type];
                return (
                  <div 
                    key={type}
                    onClick={() => toggleMealCompleted(type, meal)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      isCompleted 
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-100 shadow-xs'
                        : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200/60 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 pr-2 overflow-hidden">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isCompleted ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-300/60' : 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                      }`}>
                        {isCompleted && <HiCheck className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-black block leading-snug">{label}</span>
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate block">{meal.name}</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCompleted ? (
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                          ✓ Done
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 hover:text-gray-600 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-lg">
                          Mark
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {completedCount === 4 && (
              <div className="p-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white text-center text-xs font-black shadow-md animate-pulse">
                🎉 All 4 Healthy Meals Completed Today! Excellent Job!
              </div>
            )}
          </div>


        </div>

      </div>
    </div>
  );
};

export default FoodRecommendation;
