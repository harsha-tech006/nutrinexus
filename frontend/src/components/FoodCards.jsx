import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { IoAdd, IoTrashOutline } from 'react-icons/io5';

export const FoodCards = ({ mealType = 'breakfast', meals = [], onAddClick, onDeleteClick }) => {
  const { t } = useContext(LanguageContext);

  // Filter meals for this type
  const mealItems = meals.filter(item => item.meal_type === mealType);
  const totalCalories = mealItems.reduce((acc, item) => acc + item.calories, 0);

  const getMealTitle = () => {
    switch (mealType) {
      case 'breakfast': return t('breakfast');
      case 'lunch': return t('lunch');
      case 'dinner': return t('dinner');
      case 'snacks': return t('snacks');
      default: return t('mealType');
    }
  };

  const getMealThemeColor = () => {
    switch (mealType) {
      case 'breakfast': return 'border-l-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20';
      case 'lunch': return 'border-l-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/40 dark:bg-teal-950/20';
      case 'dinner': return 'border-l-green-600 text-green-600 dark:text-green-400 bg-green-50/40 dark:bg-green-950/20';
      default: return 'border-l-emerald-400 text-emerald-500 dark:text-emerald-300 bg-emerald-50/20 dark:bg-emerald-950/10';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl shadow-soft overflow-hidden border-l-4 ${getMealThemeColor()}`}>
      
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm capitalize">{getMealTitle()}</h4>
          <span className="text-xs text-gray-400 font-semibold">{totalCalories} {t('kcalLogged')}</span>
        </div>
        <button
          onClick={() => onAddClick(mealType)}
          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-sm"
        >
          <IoAdd className="w-4 h-4" />
          <span>{t('addFood')}</span>
        </button>
      </div>

      {/* Logged items */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800 px-5">
        {mealItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            {t('noItemsLogged')}
          </div>
        ) : (
          mealItems.map((item) => (
            <div key={item._id} className="py-3.5 flex justify-between items-center group">
              <div className="min-w-0 flex-1 pr-4">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{item.food_name}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-semibold mt-0.5">
                  <span>{item.calories} kcal</span>
                  <span>•</span>
                  <span>P: {item.protein}g</span>
                  <span>•</span>
                  <span>C: {item.carbs}g</span>
                  <span>•</span>
                  <span>F: {item.fat}g</span>
                </div>
              </div>
              <button 
                onClick={() => onDeleteClick(item._id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
                title="Delete food entry"
              >
                <IoTrashOutline className="w-4.5 h-4.5" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default FoodCards;
