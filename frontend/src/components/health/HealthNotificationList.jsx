import React, { useState } from 'react';
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineExclamation, HiX } from 'react-icons/hi';

export const HealthNotificationList = ({ notifications = [], onMarkRead }) => {
  const [filter, setFilter] = useState('All');

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Alerts') return n.severity === 'serious' || n.severity === 'high_risk' || n.severity === 'moderate';
    if (filter === 'Healthy') return n.severity === 'healthy';
    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HiOutlineBell className="w-5 h-5 text-emerald-500" />
          <h3 className="text-base font-black text-gray-900 dark:text-gray-100">Smart Alert & Health Feed</h3>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl text-xs">
          {['All', 'Alerts', 'Healthy'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                filter === f 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No recent health notifications.</p>
        ) : (
          filteredNotifs.map((notif, idx) => {
            const isHighRisk = notif.severity === 'high_risk' || notif.severity === 'serious';
            const isMod = notif.severity === 'moderate';
            
            return (
              <div 
                key={notif.id || notif._id || idx}
                className={`p-4 rounded-2xl border transition-all text-xs space-y-1 ${
                  isHighRisk 
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200' 
                    : isMod 
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between font-extrabold">
                  <span className="flex items-center gap-1.5">
                    {isHighRisk ? <HiOutlineExclamation className="w-4 h-4 text-red-600" /> : <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />}
                    <span>{notif.title}</span>
                  </span>
                  <span className="text-[10px] opacity-70 font-mono">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">{notif.message}</p>

                {!notif.read && onMarkRead && (
                  <button
                    onClick={() => onMarkRead(notif.id || notif._id)}
                    className="text-[10px] underline font-bold pt-1 hover:text-emerald-600"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HealthNotificationList;
