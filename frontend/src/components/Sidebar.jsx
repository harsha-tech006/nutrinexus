import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

// Icons
import { 
  HiOutlineChartBar, HiOutlineCalendar, HiOutlineClipboardList, 
  HiOutlineHeart, HiOutlineClock, HiOutlineCog, HiOutlineChatAlt,
  HiOutlineBell, HiOutlineAdjustments,
  HiX, HiOutlineDocumentReport, HiOutlineLocationMarker,
  HiOutlineVideoCamera, HiOutlineUserGroup, HiOutlineSparkles
} from 'react-icons/hi';
import { IoFlameOutline, IoWaterOutline } from 'react-icons/io5';
import { TbYoga } from 'react-icons/tb';
import { FaBaby } from 'react-icons/fa';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);

  const menuItems = [
    { path: '/dashboard', label: t('dashboard'), icon: HiOutlineChartBar },
    { path: '/health-monitor', label: 'Health Condition Monitor', icon: HiOutlineHeart },
    { path: '/daily-tracker', label: t('dailyTracker'), icon: HiOutlineCalendar },
    { path: '/goal-tracker', label: t('goalTracker'), icon: HiOutlineClipboardList },
    { path: '/food-recommendation', label: t('mealRecommendation'), icon: IoFlameOutline },
    { path: '/water-reminder', label: t('waterTracker'), icon: IoWaterOutline },
    { path: '/pregnancy-nutrition', label: 'Pregnancy Nutrition', icon: FaBaby },
    { path: '/cycle-tracker', label: 'Cycle & Period Tracker', icon: HiOutlineSparkles },
    { path: '/yoga-guide', label: t('yogaGuide'), icon: TbYoga },
    { path: '/disease-guide', label: t('diseaseGuide'), icon: HiOutlineHeart },
    { path: '/medicine-reminder', label: t('medicineReminder'), icon: HiOutlineClock },
    { path: '/hospitals', label: t('nearestHospitals') !== 'nearestHospitals' ? t('nearestHospitals') : 'Nearest Hospitals SOS', icon: HiOutlineLocationMarker },
    { path: '/ai-chat', label: t('aiNutritionChat'), icon: HiOutlineChatAlt },
    { path: '/weekly-report', label: t('weeklyReport'), icon: HiOutlineDocumentReport },
    { path: '/monthly-report', label: t('monthlyReport'), icon: HiOutlineDocumentReport },
    { path: '/history', label: t('foodLogHistory'), icon: HiOutlineAdjustments },
    { path: '/notifications', label: t('notifications'), icon: HiOutlineBell },
    { path: '/settings', label: t('settings'), icon: HiOutlineCog },
  ];

  // Mobile Drawer Overlay
  const overlayClasses = isOpen 
    ? "fixed inset-0 z-50 bg-gray-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
    : "fixed inset-0 z-50 bg-gray-950/0 pointer-events-none transition-opacity duration-300 md:hidden";

  // Sidebar container classes
  const sidebarClasses = `fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:z-0 ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div className={overlayClasses} onClick={onClose}></div>

      {/* Sidebar Panel */}
      <aside className={sidebarClasses}>
        {/* Header (Mobile only) */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 md:hidden">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">NutriNexus Menu</span>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini card */}
        {user && (
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 hidden md:block">
            <div className="flex items-center gap-3 bg-emerald-50/80 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-emerald-300 shrink-0 shadow-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt="User Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate uppercase tracking-wider">
                  {user.goal ? (t(user.goal) !== user.goal ? t(user.goal) : user.goal) : t('healthyLifestyle')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Options List */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50/80 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
