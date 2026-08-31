import React, { useState, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { HiOutlineCalculator } from 'react-icons/hi';

export const BMICalculator = () => {
  const { t } = useContext(LanguageContext);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [categoryKey, setCategoryKey] = useState('');

  const calculate = (e) => {
    e.preventDefault();
    const w = parseFloat(weight);
    let h = parseFloat(height);

    if (w > 0 && h > 0) {
      if (h > 3.0) {
        h = h / 100.0;
      }
      
      const computedBmi = w / (h * h);
      const roundedBmi = parseFloat(computedBmi.toFixed(2));
      setBmi(roundedBmi);

      if (roundedBmi < 18.5) {
        setCategoryKey('underweight');
      } else if (roundedBmi >= 18.5 && roundedBmi < 24.9) {
        setCategoryKey('normalWeight');
      } else if (roundedBmi >= 25 && roundedBmi < 29.9) {
        setCategoryKey('overweight');
      } else {
        setCategoryKey('obese');
      }
    }
  };

  const getBmiColor = () => {
    if (!bmi) return 'text-gray-500';
    if (bmi < 18.5) return 'text-sky-500 dark:text-sky-400';
    if (bmi >= 18.5 && bmi < 24.9) return 'text-emerald-600 dark:text-emerald-400';
    if (bmi >= 25 && bmi < 29.9) return 'text-amber-500 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineCalculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-bold text-gray-900 dark:text-gray-100">{t('bmiCalculator')}</h3>
      </div>

      <form onSubmit={calculate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('weight')} (kg)</label>
          <input
            type="number"
            step="any"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="e.g. 70"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('height')} (cm)</label>
          <input
            type="number"
            step="any"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="e.g. 175"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm"
        >
          {t('calculateBmi')}
        </button>
      </form>

      {bmi && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('yourBmiIs')}</p>
          <p className={`text-3xl font-extrabold my-1 ${getBmiColor()}`}>{bmi}</p>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t(categoryKey)}</p>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;
