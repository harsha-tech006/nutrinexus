import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const DiseaseProgressChart = ({ condition = "Diabetes", labels = [], glucose = [], systolicBP = [], weight = [] }) => {
  const isGlucose = condition === "Diabetes" || condition === "PCOS";
  const isBP = condition === "Hypertension";
  
  const datasetLabel = isGlucose ? 'Fasting Blood Glucose (mg/dL)' : isBP ? 'Systolic Blood Pressure (mmHg)' : 'Body Weight (kg)';
  const primaryData = isGlucose ? (glucose.length > 0 ? glucose : [135, 128, 122, 118, 114, 110, 107]) :
                      isBP ? (systolicBP.length > 0 ? systolicBP : [136, 134, 131, 128, 126, 125, 124]) :
                      (weight.length > 0 ? weight : [73.5, 73.1, 72.7, 72.3, 71.9, 71.6, 71.4]);

  const chartColor = isGlucose ? '#ec4899' : isBP ? '#3b82f6' : '#10b981';

  const data = {
    labels: labels.length > 0 ? labels : ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: datasetLabel,
        data: primaryData,
        borderColor: chartColor,
        backgroundColor: chartColor,
        tension: 0.3,
        pointRadius: 4
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
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Condition Tracking</span>
        <h3 className="text-base font-black text-gray-900 dark:text-gray-100">{condition} Clinical Parameter Chart</h3>
      </div>

      <div className="h-60 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default DiseaseProgressChart;
