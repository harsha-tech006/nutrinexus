import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const NutritionProgressChart = ({ labels = [], calories = [], protein = [], waterLiters = [] }) => {
  const data = {
    labels: labels.length > 0 ? labels : ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: 'Calories (kcal)',
        data: calories.length > 0 ? calories : [1950, 1920, 1890, 1860, 1840, 1820, 1800],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 8
      },
      {
        label: 'Protein (g)',
        data: protein.length > 0 ? protein : [65, 70, 75, 80, 82, 85, 88],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#9ca3af', font: { size: 11, weight: 'bold' } }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } } },
      y: { grid: { color: 'rgba(156, 163, 175, 0.1)' }, ticks: { color: '#9ca3af', font: { size: 10 } } }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Macro & Energy Intake</span>
        <h3 className="text-base font-black text-gray-900 dark:text-gray-100">Nutrition Adherence Bar Chart</h3>
      </div>

      <div className="h-60 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default NutritionProgressChart;
