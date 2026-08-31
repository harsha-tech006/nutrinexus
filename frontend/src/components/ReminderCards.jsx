import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { HiOutlineBell, HiOutlineClock } from 'react-icons/hi';

export const ReminderCards = ({ reminders = [] }) => {
  const { t } = useContext(LanguageContext);
  const activeReminders = reminders.filter(r => r.is_active);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-6 shadow-soft">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineBell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-gray-900 dark:text-gray-100">{t('upcomingReminders')}</h3>
        </div>
        <Link to="/medicine-reminder" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
          {t('manage')}
        </Link>
      </div>

      <div className="space-y-3">
        {activeReminders.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            {t('noActiveReminders')}
          </div>
        ) : (
          activeReminders.slice(0, 3).map((rem, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <HiOutlineClock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-gray-900 dark:text-gray-100">{rem.medicine_name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{rem.dosage}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">
                {rem.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReminderCards;
