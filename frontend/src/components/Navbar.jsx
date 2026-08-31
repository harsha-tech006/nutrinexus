import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import notificationService from '../services/notificationService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { playReminderSound, playNotificationSound } from '../utils/soundAlert';

// Icons
import { HiMenuAlt1, HiOutlineBell, HiOutlineUserCircle, HiOutlineSun, HiOutlineMoon, HiOutlineLogout } from 'react-icons/hi';
import { IoFitness } from 'react-icons/io5';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { t } = useContext(LanguageContext);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const alertedRef = useRef(new Set());
  const prevNotifCountRef = useRef(0);

  // Fetch unread notifications with notification sound chime
  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await notificationService.getNotifications(true); // Get unread only
          const list = res.data.notifications || [];
          if (list.length > prevNotifCountRef.current && prevNotifCountRef.current > 0) {
            playNotificationSound();
          }
          prevNotifCountRef.current = list.length;
          setNotifications(list);
        } catch (err) {
          console.error('Error fetching unread notifications:', err);
        }
      };
      fetchNotifications();
      // Poll every 1 minute for new notifications
      const timer = setInterval(fetchNotifications, 60000);
      return () => clearInterval(timer);
    }
  }, [user]);

  // Global background medicine ticker (plays alarm sound on match across any page)
  useEffect(() => {
    if (!user) return;

    const checkGlobalMedicineReminders = async () => {
      try {
        const res = await api.get('/reminders/medicine');
        const list = res.data?.reminders || [];
        if (!list.length) return;

        const now = new Date();
        const currentHHMM = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const minuteKey = `${currentDay}_${currentHHMM}`;

        list.forEach(r => {
          if (r.is_active && r.time === currentHHMM && (r.days || []).includes(currentDay)) {
            const itemKey = `${r._id || r.medicine_name}_${minuteKey}`;
            if (!alertedRef.current.has(itemKey)) {
              alertedRef.current.add(itemKey);
              playReminderSound();
              toast(`⏰ Medicine Alarm: Time to take ${r.medicine_name} (${r.dosage})!`, {
                duration: 9000,
                icon: '💊',
                style: {
                  background: '#10B981',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  borderRadius: '14px',
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
                }
              });
            }
          }
        });
      } catch (e) {
        // silent fallback
      }
    };

    checkGlobalMedicineReminders();
    const interval = setInterval(checkGlobalMedicineReminders, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications([]);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none md:hidden"
          >
            <HiMenuAlt1 className="h-6 w-6" />
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <IoFitness className="w-8 h-8 text-emerald-500 animate-pulse-slow" />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent font-black">
              NutriNexus
            </span>
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Emergency Hospital SOS shortcut */}
          <Link
            to="/hospitals"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 font-bold rounded-xl text-xs transition shadow-sm"
            title="Nearest Hospital & Emergency SOS"
          >
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            <span className="hidden sm:inline">Emergency SOS</span>
            <span className="sm:hidden">SOS</span>
          </Link>
          
          {/* Language Selector */}
          <LanguageSelector />

          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <HiOutlineSun className="h-5 w-5 text-amber-400" /> : <HiOutlineMoon className="h-5 w-5 text-gray-700" />}
          </button>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-lg p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <HiOutlineBell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{t('recentNotifications')}</h3>
                    {notifications.length > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                        {t('markAllRead')}
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">{t('noNotifications')}</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif._id)}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                              {notif.type}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <h4 className="font-medium text-xs text-gray-800 dark:text-gray-200 mt-1">{notif.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-center">
                    <Link to="/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 block py-1 font-medium">
                      {t('viewAllNotifications')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Account Profile Menu */}
          {user && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden border border-emerald-300">
                  {user.avatar ? (
                    <img src={user.avatar} alt="User Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <HiOutlineUserCircle className="w-5 h-5 text-gray-400" />
                    <span>{t('myProfile')}</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                  >
                    <HiOutlineLogout className="w-5 h-5" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
