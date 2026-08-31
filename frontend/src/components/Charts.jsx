import React from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Filler 
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Filler
);

export const MacroPieChart = ({ protein = 0, carbs = 0, fat = 0 }) => {
  const data = {
    labels: ['Protein (g)', 'Carbs (g)', 'Fat (g)'],
    datasets: [
      {
        data: [protein, carbs, fat],
        backgroundColor: [
          'rgba(34, 197, 94, 0.75)',  // Emerald Green
          'rgba(59, 130, 246, 0.75)',  // Blue
          'rgba(234, 179, 8, 0.75)',   // Yellow/Amber
        ],
        borderColor: [
          '#22c55e',
          '#3b82f6',
          '#eab308',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { size: 11 },
          color: 'gray'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            return ` ${context.label}: ${val.toFixed(1)}g`;
          }
        }
      }
    }
  };

  return (
    <div className="relative w-full h-44">
      {protein === 0 && carbs === 0 && fat === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
          No meal logs to display macro distribution.
        </div>
      ) : (
        <Pie data={data} options={options} />
      )}
    </div>
  );
};

export const TrendLineChart = ({ labels = [], dataPoints = [], title = "Calories Trend", color = "#10B981" }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        fill: true,
        label: title,
        data: dataPoints,
        borderColor: color,
        backgroundColor: `${color}15`, // Alpha transparency opacity
        tension: 0.3,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'gray',
          font: { size: 10 }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'gray',
          font: { size: 9 },
          maxRotation: 45,
          minRotation: 0
        }
      },
    },
  };

  return (
    <div className="w-full h-56">
      {dataPoints.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
          No trend records found in range.
        </div>
      ) : (
        <Line data={data} options={options} />
      )}
    </div>
  );
};

export const BarGraphChart = ({ labels = [], dataPoints = [], title = "Metrics", color = "#10B981" }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: title,
        data: dataPoints,
        backgroundColor: color,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { color: 'gray', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'gray', font: { size: 9 }, maxRotation: 45, minRotation: 0 }
      },
    },
  };

  return (
    <div className="w-full h-56">
      {dataPoints.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
          No records found in range.
        </div>
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
};

export const ProgressRing = ({ percent = 0, size = 120, strokeWidth = 10, color = "#10B981", subtitle = "Remaining" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, percent) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Circle */}
        <circle
          className="text-gray-100 dark:text-gray-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Absolute text content in middle */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold text-gray-800 dark:text-gray-100">{Math.round(percent)}%</span>
        <span className="text-[10px] text-gray-400 font-semibold uppercase">{subtitle}</span>
      </div>
    </div>
  );
};
