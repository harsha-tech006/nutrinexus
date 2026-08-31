import React, { useContext } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { HiCheckCircle, HiOutlineClock, HiOutlineFire, HiOutlineLightningBolt, HiOutlineLightBulb } from 'react-icons/hi';
import { LanguageContext } from '../../context/LanguageContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  Filler
);

export const YogaAnalytics = ({
  analytics,
  loading = false
}) => {
  const { t } = useContext(LanguageContext);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="text-xs text-gray-400 font-bold">Aggregating practice analytics...</p>
      </div>
    );
  }

  if (!analytics) return null;

  const {
    total_sessions = 0,
    total_time_mins = 0,
    total_calories = 0.0,
    streak = 0,
    weekly_trend = [],
    monthly_trend = [],
    insights = []
  } = analytics;

  // Chart configuration for Weekly Trend (Line Chart)
  const weeklyLabels = weekly_trend.map(d => d.label);
  const weeklyData = weekly_trend.map(d => d.sessions);
  const weeklyChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        fill: true,
        label: 'Sessions Completed',
        data: weeklyData,
        borderColor: '#10B981', // Emerald Green
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        borderWidth: 2.5,
      }
    ]
  };

  const weeklyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` Sessions: ${context.raw}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(156, 163, 175, 0.05)' },
        ticks: { stepSize: 1, color: 'gray', font: { size: 10 } },
        min: 0
      },
      x: {
        grid: { display: false },
        ticks: { color: 'gray', font: { size: 10 } }
      }
    }
  };

  // Chart configuration for Monthly Trend (Bar Chart)
  const monthlyLabels = monthly_trend.map(d => d.label);
  const monthlyData = monthly_trend.map(d => d.sessions);
  const monthlyChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Sessions Completed',
        data: monthlyData,
        backgroundColor: 'rgba(59, 130, 246, 0.75)', // Blue
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 8,
      }
    ]
  };

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { color: 'rgba(156, 163, 175, 0.05)' },
        ticks: { stepSize: 1, color: 'gray', font: { size: 10 } },
        min: 0
      },
      x: {
        grid: { display: false },
        ticks: { color: 'gray', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sessions */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-soft flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <HiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider block">Total Sessions</span>
            <span className="text-lg font-black text-gray-800 dark:text-gray-200 mt-0.5">{total_sessions}</span>
          </div>
        </div>

        {/* Practice Time */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-soft flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400">
            <HiOutlineClock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider block">Total Minutes</span>
            <span className="text-lg font-black text-gray-800 dark:text-gray-200 mt-0.5">{total_time_mins} min</span>
          </div>
        </div>

        {/* Calories Burned */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-soft flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <HiOutlineFire className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider block">Calories Burned</span>
            <span className="text-lg font-black text-gray-800 dark:text-gray-200 mt-0.5">{total_calories} kcal</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-soft flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
            <HiOutlineLightningBolt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider block">{t('dailyStreak')}</span>
            <span className="text-lg font-black text-gray-800 dark:text-gray-200 mt-0.5">{streak} Days</span>
          </div>
        </div>

      </div>

      {/* Chart visualization trend columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Trend line */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-soft space-y-4">
          <div>
            <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200">Weekly Activity</h4>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">Completions recorded over the last 7 days</p>
          </div>
          <div className="h-56 relative w-full">
            {weeklyData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">No weekly trend to show.</div>
            ) : (
              <Line data={weeklyChartData} options={weeklyChartOptions} />
            )}
          </div>
        </div>

        {/* Monthly Trend bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-soft space-y-4">
          <div>
            <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200">Monthly Progress</h4>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">Sessions completed per week over the last month</p>
          </div>
          <div className="h-56 relative w-full">
            {monthlyData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">No monthly trend to show.</div>
            ) : (
              <Bar data={monthlyChartData} options={monthlyChartOptions} />
            )}
          </div>
        </div>

      </div>

      {/* AI Health Improvement Insights */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/10 dark:to-emerald-950/10 border border-teal-100/50 dark:border-teal-950/30 rounded-3xl p-6 space-y-4 shadow-soft">
        <h4 className="font-extrabold text-sm text-teal-800 dark:text-teal-400 flex items-center gap-2">
          <HiOutlineLightBulb className="w-5 h-5" />
          {t('healthInsights')}
        </h4>
        <ul className="space-y-3 pl-1">
          {insights.map((insight, index) => (
            <li key={index} className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed flex items-start gap-2">
              <span className="text-emerald-500 font-black shrink-0 mt-0.5">✦</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default YogaAnalytics;
