import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { HiOutlineCog, HiOutlineSun, HiOutlineMoon, HiOutlineDownload, HiOutlineTrash, HiOutlineDocumentText } from 'react-icons/hi';
import api from '../services/api';
import toast from 'react-hot-toast';
import generateHealthReportPDF from '../utils/pdfExporter';

export const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, setTheme } = useContext(ThemeContext);
  const { language, changeLanguage, t } = useContext(LanguageContext);

  const [deleting, setDeleting] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingJSON, setExportingJSON] = useState(false);

  // Export PDF Handler
  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const [profileRes, historyRes] = await Promise.all([
        api.get('/auth/profile').catch(() => ({ data: { user } })),
        api.get('/tracker/history?limit=1000').catch(() => ({ data: { history: [] } }))
      ]);

      const profileData = profileRes?.data?.user || user || {};
      const historyData = historyRes?.data?.history || [];

      generateHealthReportPDF(profileData, historyData);
      toast.success('Your PDF health report has been generated successfully! 📄');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to export PDF report.');
    } finally {
      setExportingPDF(false);
    }
  };

  // Export JSON Handler
  const handleExportJSON = async () => {
    setExportingJSON(true);
    try {
      const [profileRes, historyRes] = await Promise.all([
        api.get('/auth/profile').catch(() => ({ data: { user } })),
        api.get('/tracker/history?limit=1000').catch(() => ({ data: { history: [] } }))
      ]);

      const exportData = {
        profile: profileRes?.data?.user || user || {},
        food_history: historyRes?.data?.history || [],
        exported_at: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `NutriNexus_MyData_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success('Your health log data exported successfully! 📂');
    } catch (err) {
      console.error('JSON export error:', err);
      toast.error('Failed to export JSON data.');
    } finally {
      setExportingJSON(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete your NutriNexus account? This action is irreversible and all your health logs will be erased.')) {
      setDeleting(true);
      try {
        await api.delete(`/admin/users/${user?.id || user?._id}`);
        toast.success('Your account has been deleted.');
        logout();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete account. Contact administrator.');
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Application Settings</h2>
        <p className="text-sm text-gray-400 mt-1 font-semibold">Customize app displays, toggle dark mode, or manage your personal database.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-3xl p-6 shadow-soft space-y-6">
        
        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800/80 pb-3 flex items-center gap-2">
          <HiOutlineCog className="w-5 h-5 text-emerald-500" />
          <span>Preference Settings</span>
        </h3>

        {/* Theme Settings */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Dark Interface Mode</h4>
            <p className="text-xs text-gray-400 mt-0.5">Toggle light or dark styling system.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
            {/* Light Mode Button */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isDarkMode
                  ? 'bg-white text-emerald-600 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <HiOutlineSun className="w-4 h-4 text-amber-500" />
              <span>Light Mode</span>
            </button>

            {/* Dark Mode Button */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isDarkMode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <HiOutlineMoon className="w-4 h-4 text-indigo-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800/80 pt-4">
          <div>
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{t('language')}</h4>
            <p className="text-xs text-gray-400 mt-0.5">Select your primary user interface translations language.</p>
          </div>
          
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-gray-700 dark:text-gray-300 font-semibold"
          >
            <option value="english">English</option>
            <option value="hindi">हिन्दी (Hindi)</option>
            <option value="kannada">ಕನ್ನಡ (Kannada)</option>
            <option value="tamil">தமிழ் (Tamil)</option>
            <option value="telugu">తెలుగు (Telugu)</option>
            <option value="malayalam">മലയാളം (Malayalam)</option>
            <option value="marathi">मराठी (Marathi)</option>
          </select>
        </div>

        {/* Export Data PDF & JSON */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-t border-gray-100 dark:border-gray-800/80 pt-4">
          <div>
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Export My Health Data Report</h4>
            <p className="text-xs text-gray-400 mt-0.5">Download a clinical PDF report of your logged daily meals, water, and weight history.</p>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Export PDF Button */}
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              <HiOutlineDocumentText className="w-4 h-4" />
              <span>{exportingPDF ? 'Generating...' : 'Export PDF'}</span>
            </button>

            {/* Export JSON Button */}
            <button
              onClick={handleExportJSON}
              disabled={exportingJSON}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl transition-all border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              title="Export raw JSON format"
            >
              <HiOutlineDownload className="w-4 h-4" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Danger zone: Account Delete */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800/80 pt-4">
          <div>
            <h4 className="font-bold text-sm text-red-600 dark:text-red-400">Permanently Erase Profile</h4>
            <p className="text-xs text-gray-400 mt-0.5">Deletes your login access credentials and clears all historical records from database.</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <HiOutlineTrash className="w-4 h-4" />
            <span>{deleting ? 'Deleting...' : 'Delete Account'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
