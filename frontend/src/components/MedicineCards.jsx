import React from 'react';
import { IoAlarmOutline, IoTrashOutline } from 'react-icons/io5';

export const MedicineCards = ({ 
  reminder, 
  reminders, 
  loading = false, 
  onToggleActive, 
  onDelete, 
  onDeleteClick 
}) => {
  const handleDeleteAction = onDelete || onDeleteClick;

  const formatDays = (days) => {
    if (!days || days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes('Saturday') && !days.includes('Sunday')) return 'Weekdays';
    return days.map(d => typeof d === 'string' ? d.slice(0, 3) : d).join(', ');
  };

  // Helper component for rendering individual card item
  const renderSingleCard = (item) => {
    if (!item) return null;
    const isActive = item.is_active ?? true;

    return (
      <div 
        key={item._id || item.id || Math.random()} 
        className={`bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-soft transition-all duration-200 ${
          isActive ? 'border-l-4 border-l-emerald-500' : 'opacity-60 border-l-4 border-l-gray-300 dark:border-l-gray-700'
        }`}
      >
        <div className="flex justify-between items-start gap-4">
          
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2.5 rounded-xl ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              <IoAlarmOutline className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{item.medicine_name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.dosage} • {item.time}</p>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">{formatDays(item.days)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active status slider */}
            {onToggleActive && (
              <button
                type="button"
                onClick={() => onToggleActive(item._id || item.id, !isActive)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  isActive ? 'bg-emerald-600 justify-end' : 'bg-gray-300 dark:bg-gray-800 justify-start'
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow-md transition-all"></span>
              </button>
            )}

            {/* Delete trigger */}
            {handleDeleteAction && (
              <button
                type="button"
                onClick={() => handleDeleteAction(item._id || item.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                title="Delete reminder"
              >
                <IoTrashOutline className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

        </div>
      </div>
    );
  };

  // 1. Single item rendering mode
  if (reminder) {
    return renderSingleCard(reminder);
  }

  // 2. Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 h-28 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  // 3. Array list rendering mode
  const list = Array.isArray(reminders) ? reminders : [];

  if (list.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl">
          ⏰
        </div>
        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">No Active Reminders</h4>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Click "New Reminder" to construct pill timings, alerts, and days.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {list.map((item) => renderSingleCard(item))}
    </div>
  );
};

export default MedicineCards;
