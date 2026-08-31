import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { IoWater, IoWaterOutline, IoRemoveCircleOutline, IoAddCircleOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { playNotificationSound } from '../utils/soundAlert';

export const WaterReminder = () => {
  const { user } = useContext(AuthContext);
  const [water, setWater] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchWater = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.get(`/tracker/summary?date=${todayStr}`);
      setWater(res.data.tracker?.water_intake || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWater();
  }, [user]);

  const handleUpdateWater = async (amount, isReduction = false) => {
    playNotificationSound();
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.post('/tracker/water', {
        date: todayStr,
        amount: amount
      });
      setWater(res.data.tracker.water_intake);
      if (isReduction) {
        toast.success(`Reduced ${Math.abs(amount)} mL from today's water log! 📉`);
      } else {
        toast.success(`Logged +${amount} mL water intake! 💧`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update water intake.');
    }
  };

  const targetWaterLiters = user?.water_requirement || 2.5;
  const targetWaterMl = targetWaterLiters * 1000;
  const progressPercent = Math.min(100, (water / targetWaterMl) * 100);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Daily Water Tracker</h2>
        <p className="text-sm text-gray-400 mt-1 font-semibold">Log or adjust your daily fluid intake to stay hydrated and support digestion.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main interactive Panel */}
        <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-3xl p-8 shadow-soft flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* Visual water animation bubble */}
            <div className="w-44 h-44 rounded-full border-4 border-blue-500 flex flex-col items-center justify-center bg-blue-50/20 dark:bg-blue-950/10 shadow-inner overflow-hidden relative">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-400/30 dark:bg-blue-500/20 transition-all duration-500" 
                style={{ height: `${progressPercent}%` }}
              ></div>
              <IoWater className="w-12 h-12 text-blue-500 relative z-10 animate-bounce-slow" />
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 relative z-10">{water}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase relative z-10">mL Logged</span>
            </div>
          </div>

          <div className="w-full text-center space-y-1">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Daily Hydration Target</p>
            <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100">{targetWaterLiters} Liters ({targetWaterMl} mL)</p>
          </div>

          {/* Add & Reduce Water Controls */}
          <div className="w-full space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            
            {/* Increase Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block text-left flex items-center gap-1">
                <IoAddCircleOutline className="w-4 h-4" />
                <span>Add Water Intake</span>
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateWater(250, false)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-black py-3 rounded-2xl transition-all shadow-md shadow-blue-500/10 text-xs"
                >
                  <IoWaterOutline className="w-4 h-4" />
                  <span>+250 mL</span>
                </button>
                <button
                  onClick={() => handleUpdateWater(500, false)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black py-3 rounded-2xl transition-all shadow-md shadow-blue-500/10 text-xs"
                >
                  <IoWaterOutline className="w-4 h-4" />
                  <span>+500 mL</span>
                </button>
              </div>
            </div>

            {/* Reduce Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500 dark:text-rose-400 block text-left flex items-center gap-1">
                <IoRemoveCircleOutline className="w-4 h-4" />
                <span>Reduce Water Intake</span>
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateWater(-250, true)}
                  disabled={water <= 0}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-black py-3 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                >
                  <IoRemoveCircleOutline className="w-4 h-4" />
                  <span>-250 mL</span>
                </button>
                <button
                  onClick={() => handleUpdateWater(-500, true)}
                  disabled={water <= 0}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-black py-3 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                >
                  <IoRemoveCircleOutline className="w-4 h-4" />
                  <span>-500 mL</span>
                </button>
              </div>
            </div>

            {/* Reset Option */}
            {water > 0 && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => handleUpdateWater(-water, true)}
                  className="text-[11px] font-extrabold text-gray-400 hover:text-rose-500 transition-colors underline"
                >
                  Reset Today's Water Log to 0 mL
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Info advice Panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-3xl p-6 shadow-soft space-y-4 self-start text-xs text-gray-500 leading-relaxed">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
            <IoWater className="w-5 h-5 text-blue-500" />
            <span>Why Hydrate?</span>
          </h3>
          <p>
            - Supports energy levels and brain function.<br/>
            - Aids digestion, prevents constipation, and flushes metabolic wastes.<br/>
            - Lubricates joint cartilage and tissues.<br/>
            - Supports healthy skin cells structure.
          </p>
        </div>

      </div>
    </div>
  );
};

export default WaterReminder;
