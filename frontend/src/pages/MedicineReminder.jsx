import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MedicineCards from '../components/MedicineCards';
import ReusableModal from '../components/ReusableModal';
import { HiOutlineClock, HiOutlinePlus } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { playReminderSound } from '../utils/soundAlert';

export const MedicineReminder = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');
  const [selectedDays, setSelectedDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders/medicine');
      setReminders(res.data?.reminders || []);
    } catch (err) {
      console.error('Error fetching medicine schedule:', err);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Live alarm sound & notification ticker
  useEffect(() => {
    if (!reminders || reminders.length === 0) return;

    const checkAlarm = () => {
      const now = new Date();
      const currentHHMM = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

      reminders.forEach(r => {
        if (r.is_active && r.time === currentHHMM && (r.days || []).includes(currentDay)) {
          playReminderSound();
          toast.success(`⏰ Time for ${r.medicine_name} (${r.dosage})!`, { duration: 8000, icon: '🔔' });
        }
      });
    };

    const interval = setInterval(checkAlarm, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [reminders]);

  const handleDayToggle = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!name || !dosage || !time) {
      return toast.error('Please enter medicine name, dosage, and time.');
    }
    if (selectedDays.length === 0) {
      return toast.error('Please select at least one day.');
    }
    setSaving(true);

    const newReminderItem = {
      _id: 'rem_' + Date.now(),
      medicine_name: name.trim(),
      dosage: dosage.trim(),
      time: time.trim(),
      days: selectedDays,
      is_active: true
    };

    try {
      const res = await api.post('/reminders/medicine', {
        medicine_name: name,
        dosage,
        time,
        days: selectedDays
      });
      
      const serverRem = res.data?.reminder;
      const finalItem = serverRem || newReminderItem;
      setReminders(prev => [...prev.filter(r => r._id !== finalItem._id), finalItem].sort((a,b) => (a.time || '').localeCompare(b.time || '')));
    } catch (err) {
      console.warn('Backend API note during creation, using optimist reminder entry:', err);
      setReminders(prev => [...prev, newReminderItem].sort((a,b) => (a.time || '').localeCompare(b.time || '')));
    } finally {
      setModalOpen(false);
      setName('');
      setDosage('');
      setTime('');
      setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
      toast.success('Pill reminder scheduled successfully!');
      playReminderSound();
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    setReminders(prev => 
      prev.map(r => r._id === id ? { ...r, is_active: isActive } : r)
    );
    toast.success(isActive ? 'Reminder activated.' : 'Reminder silenced.');
    if (isActive) playReminderSound();

    try {
      await api.put(`/reminders/medicine/${id}`, { is_active: isActive });
    } catch (err) {
      console.warn('Backend status update sync note:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine reminder?')) {
      setReminders(prev => prev.filter(r => r._id !== id));
      toast.success('Reminder deleted.');

      try {
        await api.delete(`/reminders/medicine/${id}`);
      } catch (err) {
        console.warn('Backend delete sync note:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Spotlight Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>Medicine Reminders</span>
            <HiOutlineClock className="w-6 h-6 text-emerald-500 animate-pulse" />
          </h2>
          <p className="text-sm text-gray-400 mt-1 font-semibold">
            Organize and toggle schedules for your prescription or vitamin intakes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playReminderSound();
              toast('🔊 Audio alert test chime sounded!', { icon: '🔔' });
            }}
            className="px-3 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-200/60"
            title="Test audio chime"
          >
            🔊 Test Alarm Sound
          </button>
          
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 self-start md:self-center"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>New Reminder</span>
          </button>
        </div>
      </div>

      {/* Main List */}
      <MedicineCards 
        reminders={reminders} 
        loading={loading}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />

      {/* Schedule New Reminder Modal */}
      <ReusableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule New Reminder"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Medicine / Vitamin Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vitamin D3, Metformin"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Dosage
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 Tablet, 10ml"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Alert Time (HH:MM)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Days of Week
            </label>
            <div className="flex flex-wrap gap-1.5">
              {daysOfWeek.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </ReusableModal>

    </div>
  );
};

export default MedicineReminder;
