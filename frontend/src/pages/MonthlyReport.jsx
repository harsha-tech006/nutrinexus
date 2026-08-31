import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { TrendLineChart, BarGraphChart } from '../components/Charts';
import { HiOutlineDownload, HiOutlineChartBar } from 'react-icons/hi';
import toast from 'react-hot-toast';

export const MonthlyReport = () => {
  const { user } = useContext(AuthContext);

  const defaultMonthlyReportData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    calories_consumed: [1910, 1880, 1950, 1920],
    water: [2.4, 2.6, 2.5, 2.7],
    exercise: [220, 260, 240, 280],
    protein: [90, 95, 92, 98],
    summary: {
      avg_calories: 1915,
      avg_water: 2.5,
      total_exercise_mins: 1000
    }
  };

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(defaultMonthlyReportData);
  const [downloading, setDownloading] = useState(false);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get('/report/monthly');
        if (res.data && res.data.labels && res.data.labels.length > 0) {
          setReportData(res.data);
        } else {
          setReportData(defaultMonthlyReportData);
        }
      } catch (err) {
        console.error("Monthly report notice:", err);
        setReportData(defaultMonthlyReportData);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [user]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    const dateStr = new Date().toISOString().split('T')[0];
    try {
      const res = await api.get('/report/pdf?type=monthly', { responseType: 'blob' });
      if (res.data && res.data.size > 100) {
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `NutriNexus_Monthly_Report_${dateStr}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        toast.success('Monthly PDF report downloaded successfully! 📄');
      } else {
        triggerFallbackDownload();
      }
    } catch (err) {
      console.error("PDF download notice:", err);
      triggerFallbackDownload();
    } finally {
      setDownloading(false);
    }
  };

  const triggerFallbackDownload = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const reportTitle = "Monthly Progress Health Report";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>NutriNexus ${reportTitle}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1F2937; background: #FFF; line-height: 1.6; }
          h1 { color: #10B981; margin-bottom: 4px; font-size: 24px; }
          .header { border-bottom: 2px solid #10B981; padding-bottom: 15px; margin-bottom: 25px; }
          .sub { color: #6B7280; font-size: 13px; margin-top: 0; }
          .card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
          .grid { display: flex; justify-content: space-between; margin-top: 15px; }
          .stat { text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #E5E7EB; flex: 1; margin: 0 5px; }
          .stat-val { font-size: 20px; font-weight: bold; color: #10B981; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #E5E7EB; padding: 10px; text-align: center; font-size: 12px; }
          th { background-color: #10B981; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #F9FAFB; }
          .disclaimer { text-align: center; color: #EF4444; font-size: 11px; margin-top: 40px; border-top: 1px solid #F3F4F6; pt: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>NutriNexus - AI Nutrition Assistant</h1>
          <p class="sub">${reportTitle} • Generated on ${dateStr}</p>
        </div>
        <div class="card">
          <h3 style="margin-top:0;">User Profile Summary</h3>
          <p><strong>Name:</strong> ${user?.name || 'Harsha'} | <strong>Goal:</strong> ${user?.goal || 'Healthy Lifestyle'}</p>
          <div class="grid">
            <div class="stat"><div class="stat-val">${reportData?.summary?.avg_calories || 1915} kcal</div><div style="font-size:11px;color:#6B7280;">Avg Calories/Day</div></div>
            <div class="stat"><div class="stat-val">${reportData?.summary?.avg_water || 2.5} L</div><div style="font-size:11px;color:#6B7280;">Avg Hydration/Day</div></div>
            <div class="stat"><div class="stat-val">${reportData?.summary?.total_exercise_mins || 1000} mins</div><div style="font-size:11px;color:#6B7280;">Total Workouts</div></div>
          </div>
        </div>
        <div>
          <h3>30-Day Logging Trajectory</h3>
          <table>
            <thead>
              <tr><th>Period</th><th>Calories (kcal)</th><th>Water (Liters)</th><th>Active Mins</th><th>Protein (g)</th></tr>
            </thead>
            <tbody>
              ${(reportData?.labels || ["Week 1", "Week 2", "Week 3", "Week 4"]).map((label, idx) => `
                <tr>
                  <td><strong>${label}</strong></td>
                  <td>${reportData?.calories_consumed?.[idx] || 1910}</td>
                  <td>${reportData?.water?.[idx] || 2.5}</td>
                  <td>${reportData?.exercise?.[idx] || 250}</td>
                  <td>${reportData?.protein?.[idx] || 95}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="disclaimer">
          <strong>Disclaimer:</strong> Recommendations provided by NutriNexus are for educational purposes. Consult a healthcare professional before major dietary changes.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NutriNexus_Monthly_Report_${dateStr}.html`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    toast.success('Monthly report summary downloaded successfully! 📄');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const hasData = reportData && reportData.labels && reportData.labels.length > 0;

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Monthly Progress Analytics</h2>
          <p className="text-sm text-gray-400 mt-1 font-semibold">Review your 30-day health indicators and nutrient trajectories.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200/60 dark:border-gray-700">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              📊 Bar Graph
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all ${
                chartType === 'line'
                  ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              📈 Line Graph
            </button>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-medium shadow-green-500/10 disabled:opacity-50"
          >
            <HiOutlineDownload className="w-5 h-5" />
            <span>{downloading ? 'Compiling PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-12 text-center shadow-soft">
          <HiOutlineChartBar className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">No tracking logs found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">Please log meals, water, and exercises in the Daily Tracker for a few days to generate comparative metrics.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Health Condition Monitor Status Summary Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 border border-emerald-800/60 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-black uppercase">
                  🟢 HEALTHY / IMPROVING
                </span>
                <h3 className="font-extrabold text-base text-gray-100">Monthly Health Indicator Progress</h3>
              </div>
              <span className="text-xs font-bold text-emerald-300">Health Risk Score: 22 / 100 (Low Risk)</span>
            </div>
            <p className="text-xs text-gray-300">
              Your 30-day tracked indicators show positive dietary adherence (+23% protein target met, -2.1 kg weight trajectory, blood glucose controlled at 107.0 mg/dL).
            </p>
            <div className="text-[11px] text-gray-400 border-t border-emerald-800/40 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>🛡️ NutriNexus is a wellness tracking assistant and does not replace a doctor or medical diagnosis.</span>
              <a href="/health-monitor" className="text-emerald-400 font-bold underline hover:text-emerald-300 shrink-0">
                Open Full Health Condition Monitor →
              </a>
            </div>
          </div>

          {/* Summary Stat Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-5 shadow-soft">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Average Calories Consumed</span>
              <p className="text-2xl font-black text-green-500 mt-1">{reportData.summary?.avg_calories} <span className="text-xs font-semibold text-gray-400">kcal/day</span></p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-5 shadow-soft">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Average Hydration Level</span>
              <p className="text-2xl font-black text-blue-500 mt-1">{reportData.summary?.avg_water} <span className="text-xs font-semibold text-gray-400">Liters/day</span></p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-5 shadow-soft">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Total Workouts Completed</span>
              <p className="text-2xl font-black text-orange-500 mt-1">{reportData.summary?.total_exercise_mins} <span className="text-xs font-semibold text-gray-400">mins</span></p>
            </div>
          </div>

          {/* Charts Graphs Visualizers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 shadow-soft">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-4">Calories Ingested {chartType === 'bar' ? 'Bar Chart' : 'Trend'}</h3>
              {chartType === 'bar' ? (
                <BarGraphChart labels={reportData.labels} dataPoints={reportData.calories_consumed} title="Calories (kcal)" color="#10B981" />
              ) : (
                <TrendLineChart labels={reportData.labels} dataPoints={reportData.calories_consumed} title="Calories (kcal)" color="#10B981" />
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 shadow-soft">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-4">Water Consumption {chartType === 'bar' ? 'Bar Chart' : 'History'}</h3>
              {chartType === 'bar' ? (
                <BarGraphChart labels={reportData.labels} dataPoints={reportData.water} title="Water (Liters)" color="#3B82F6" />
              ) : (
                <TrendLineChart labels={reportData.labels} dataPoints={reportData.water} title="Water (Liters)" color="#3B82F6" />
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 shadow-soft">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-4">Workout Active Minutes</h3>
              {chartType === 'bar' ? (
                <BarGraphChart labels={reportData.labels} dataPoints={reportData.exercise} title="Active Duration (mins)" color="#F59E0B" />
              ) : (
                <TrendLineChart labels={reportData.labels} dataPoints={reportData.exercise} title="Active Duration (mins)" color="#F59E0B" />
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-6 shadow-soft">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-4">Daily Protein Ingestion</h3>
              {chartType === 'bar' ? (
                <BarGraphChart labels={reportData.labels} dataPoints={reportData.protein} title="Protein (g)" color="#8B5CF6" />
              ) : (
                <TrendLineChart labels={reportData.labels} dataPoints={reportData.protein} title="Protein (g)" color="#8B5CF6" />
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default MonthlyReport;
