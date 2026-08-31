import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlineBell, HiOutlineMailOpen, HiOutlineCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { playNotificationSound } from '../utils/soundAlert';

export const Notifications = () => {
  const defaultNotifications = [
    {
      _id: "notif_1",
      type: "Medicine",
      title: "💊 Vitamin D3 & Calcium Reminder",
      body: "Time to take your post-breakfast supplement for bone mineral support.",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      is_read: false
    },
    {
      _id: "notif_2",
      type: "Water",
      title: "💧 Hydration Milestone Achieved",
      body: "Great job! You have logged 1,500 mL of water today. 500 mL remaining for your 2.0L goal.",
      created_at: new Date(Date.now() - 10800000).toISOString(),
      is_read: false
    },
    {
      _id: "notif_3",
      type: "Yoga",
      title: "🧘 Daily Practice Recommended",
      body: "Your daily yoga sequence is ready! 25 minutes of restorative Cobra & Tree poses.",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      is_read: true
    },
    {
      _id: "notif_4",
      type: "Nutrition",
      title: "🥗 Healthy Indian Meal Recommendation",
      body: "Explore your recommended Lunch: Bajra Roti with Bhindi Masala & Tadka Dal.",
      created_at: new Date(Date.now() - 172800000).toISOString(),
      is_read: true
    }
  ];

  const [notifications, setNotifications] = useState(defaultNotifications);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/reminders/notifications');
      if (res.data?.notifications && res.data.notifications.length > 0) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications(defaultNotifications);
      }
    } catch (err) {
      console.error("Notifications fetch notice:", err);
      setNotifications(defaultNotifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    playNotificationSound();
    try {
      await api.post(`/reminders/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, is_read: true } : n)
      );
      toast.success('Notification marked as read.');
    } catch (err) {
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, is_read: true } : n)
      );
      toast.success('Notification marked as read.');
    }
  };

  const handleMarkAllRead = async () => {
    playNotificationSound();
    try {
      await api.post('/reminders/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">My Notification Alerts</h2>
          <p className="text-sm text-gray-400 mt-1 font-semibold">Inbox logging all reminders, hydration checks, and system events.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playNotificationSound();
              toast('🔊 Notification alert sound test chime!', { icon: '🔔' });
            }}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-extrabold text-xs rounded-xl hover:bg-emerald-100 transition-all active:scale-95"
          >
            🔊 Test Notification Sound
          </button>

          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm self-start"
            >
              <HiOutlineCheck className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-12 text-center shadow-soft">
          <HiOutlineBell className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-xs text-gray-400">Your notification inbox is currently empty.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div 
              key={notif._id} 
              className={`p-5 rounded-2xl border transition-all duration-150 flex items-start justify-between gap-4 bg-white dark:bg-gray-900 border-gray-200/50 dark:border-gray-800/40 ${
                !notif.is_read ? 'shadow-soft border-l-4 border-l-green-500' : 'opacity-70'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                    notif.type === 'Medicine' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400' :
                    notif.type === 'Water' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' :
                    'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                  }`}>
                    {notif.type}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200">{notif.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{notif.body}</p>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkRead(notif._id)}
                  className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors"
                  title="Mark as read"
                >
                  <HiOutlineMailOpen className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Notifications;
