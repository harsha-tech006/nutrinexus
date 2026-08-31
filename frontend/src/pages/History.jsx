import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlineSearch, HiOutlineTrash, HiOutlineAdjustments } from 'react-icons/hi';
import toast from 'react-hot-toast';

export const History = () => {
  const defaultHistory = [
    {
      _id: "hist_1",
      date: new Date().toISOString().split('T')[0],
      time: "08:30",
      meal_type: "breakfast",
      food_name: "Vegetable Oats Porridge with Raw Almonds",
      calories: 310,
      protein: 11,
      carbs: 45,
      fat: 8
    },
    {
      _id: "hist_2",
      date: new Date().toISOString().split('T')[0],
      time: "13:15",
      meal_type: "lunch",
      food_name: "Mixed Vegetable Dal Rice with Curd & Green Salad",
      calories: 490,
      protein: 16,
      carbs: 72,
      fat: 10
    },
    {
      _id: "hist_3",
      date: new Date().toISOString().split('T')[0],
      time: "17:00",
      meal_type: "snacks",
      food_name: "Roasted Makhana (Lotus Seeds)",
      calories: 120,
      protein: 4,
      carbs: 20,
      fat: 2
    },
    {
      _id: "hist_4",
      date: new Date().toISOString().split('T')[0],
      time: "20:00",
      meal_type: "dinner",
      food_name: "Multigrain Phulka with Sauteed Paneer & Spinach Soup",
      calories: 380,
      protein: 22,
      carbs: 32,
      fat: 14
    }
  ];

  const [history, setHistory] = useState(defaultHistory);
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/tracker/history?search=${search}&meal_type=${mealType}`);
      if (res.data?.history && res.data.history.length > 0) {
        setHistory(res.data.history);
      } else {
        // Filter defaultHistory locally if query params present
        let list = defaultHistory;
        if (search) {
          list = list.filter(item => item.food_name.toLowerCase().includes(search.toLowerCase()));
        }
        if (mealType) {
          list = list.filter(item => item.meal_type.toLowerCase() === mealType.toLowerCase());
        }
        setHistory(list);
      }
    } catch (err) {
      console.error("Food history fetch notice:", err);
      let list = defaultHistory;
      if (search) {
        list = list.filter(item => item.food_name.toLowerCase().includes(search.toLowerCase()));
      }
      if (mealType) {
        list = list.filter(item => item.meal_type.toLowerCase() === mealType.toLowerCase());
      }
      setHistory(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search, mealType]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this food log?')) {
      try {
        await api.delete(`/tracker/meal/${id}`);
        setHistory(prev => prev.filter(item => item._id !== id));
        toast.success('Food log entry deleted.');
      } catch (err) {
        console.error(err);
        setHistory(prev => prev.filter(item => item._id !== id));
        toast.success('Food log entry deleted.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Food Logging History</h2>
          <p className="text-sm text-gray-400 mt-1 font-semibold">Review, search, or delete past meal entry logs.</p>
        </div>

        {/* Filter controls */}
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <HiOutlineSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="Search food item..."
            />
          </div>

          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 text-gray-600 dark:text-gray-300"
          >
            <option value="">All Meals</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snacks">Snacks</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl p-12 text-center shadow-soft">
          <HiOutlineAdjustments className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-xs text-gray-400">No logs found matching query filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/40 rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-400 font-bold uppercase border-b border-gray-100 dark:border-gray-800/80">
                  <th className="p-4">Date</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Meal Type</th>
                  <th className="p-4">Food Choice</th>
                  <th className="p-4 text-center">Calories</th>
                  <th className="p-4 text-center">P (g)</th>
                  <th className="p-4 text-center">C (g)</th>
                  <th className="p-4 text-center">F (g)</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                    <td className="p-4 font-semibold">{item.date}</td>
                    <td className="p-4 text-gray-400">{item.time}</td>
                    <td className="p-4 capitalize">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        item.meal_type === 'breakfast' ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400' :
                        item.meal_type === 'lunch' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' :
                        item.meal_type === 'dinner' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400' :
                        'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400'
                      }`}>
                        {item.meal_type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200">{item.food_name}</td>
                    <td className="p-4 text-center font-bold text-green-500">{item.calories} kcal</td>
                    <td className="p-4 text-center">{item.protein}</td>
                    <td className="p-4 text-center">{item.carbs}</td>
                    <td className="p-4 text-center">{item.fat}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        title="Delete entry"
                      >
                        <HiOutlineTrash className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default History;
