// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getHeaders = (customHeaders = {}) => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Mock data functions for offline development
const getMockFoodData = (query) => {
  const mockFoods = {
    apple: { foods: [{ food_name: "Apple", nf_calories: 95, nf_protein: 0.5, nf_total_carbohydrate: 25, nf_total_fat: 0.3 }] },
    banana: { foods: [{ food_name: "Banana", nf_calories: 105, nf_protein: 1.3, nf_total_carbohydrate: 27, nf_total_fat: 0.4 }] },
    chicken: { foods: [{ food_name: "Grilled Chicken", nf_calories: 165, nf_protein: 31, nf_total_carbohydrate: 0, nf_total_fat: 3.6 }] },
    rice: { foods: [{ food_name: "Brown Rice", nf_calories: 216, nf_protein: 5, nf_total_carbohydrate: 45, nf_total_fat: 1.8 }] }
  };
  return mockFoods[query.toLowerCase()] || { foods: [{ food_name: query, nf_calories: 200, nf_protein: 10, nf_total_carbohydrate: 25, nf_total_fat: 8 }] };
};

//////////////////// AUTH ////////////////////

export const authAPI = {
  register: async (data) =>
    handleResponse(await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    })),

  login: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    });
    const result = await handleResponse(res);
    localStorage.setItem('authToken', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () =>
    handleResponse(await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    })),

  updateProfile: async (data) =>
    handleResponse(await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
    })),

  changePassword: async (data) =>
    handleResponse(await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
    }))
};

//////////////////// USER API ////////////////////

export const userAPI = {
  getStats: async () => {
    try {
      const user = await authAPI.getCurrentUser().catch(() => null);
      return {
        data: {
          totalCalories: 0,
          remainingCalories: 2000,
          calorieGoal: 2000,
          bmi: user?.bmi || 22,
          weight: user?.weight || 70,
          height: user?.height || 170,
          age: user?.age || 25,
          gender: user?.gender || 'female'
        }
      };
    } catch (error) {
      return {
        data: {
          totalCalories: 0,
          remainingCalories: 2000,
          calorieGoal: 2000,
          bmi: 22,
          weight: 70,
          height: 170,
          age: 25,
          gender: 'female'
        }
      };
    }
  },

  getProfile: async () => {
    try {
      return await authAPI.getCurrentUser();
    } catch (error) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        return { data: JSON.parse(savedUser) };
      }
      return { data: { name: 'User', email: 'user@example.com', age: 25, weight: 70, height: 170, gender: 'female' } };
    }
  },

  updateProfile: async (data) => {
    try {
      return await authAPI.updateProfile(data);
    } catch (error) {
      localStorage.setItem('user', JSON.stringify(data));
      return { data };
    }
  },

  getPreferences: async () => {
    return {
      data: {
        dietaryRestrictions: [],
        allergies: [],
        healthGoals: ['weight_management'],
        activityLevel: 'moderate',
        cuisinePreferences: [],
        mealFrequency: 3
      }
    };
  },

  updatePreferences: async (preferences) => {
    return { data: preferences };
  },

  getHealthMetrics: async () => {
    return {
      data: {
        weight: 70,
        height: 170,
        bmi: 24.2,
        bmiCategory: 'Normal weight',
        bodyFat: 22,
        muscleMass: 45,
        waterPercentage: 60
      }
    };
  },

  updateHealthMetrics: async (metrics) => {
    return { data: metrics };
  }
};

//////////////////// NUTRITION API ////////////////////

export const nutritionAPI = {
  searchFood: async (query) => {
    try {
      const response = await fetch(`https://trackapi.nutritionix.com/v2/search/instant?query=${query}`, {
        headers: {
          'x-app-id': process.env.REACT_APP_NUTRITIONIX_APP_ID || '',
          'x-app-key': process.env.REACT_APP_NUTRITIONIX_API_KEY || ''
        }
      });
      return handleResponse(response);
    } catch (error) {
      return getMockFoodData(query);
    }
  },

  getFoodNutrition: async (foodName) => {
    try {
      const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
        method: 'POST',
        headers: {
          'x-app-id': process.env.REACT_APP_NUTRITIONIX_APP_ID || '',
          'x-app-key': process.env.REACT_APP_NUTRITIONIX_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: foodName })
      });
      return handleResponse(response);
    } catch (error) {
      return getMockFoodData(foodName);
    }
  },

  analyzeMeal: async (mealData) => {
    return {
      data: {
        totalCalories: 500,
        totalProtein: 35,
        totalCarbs: 45,
        totalFats: 20,
        analysis: "This meal is well-balanced",
        recommendations: "Add more vegetables"
      }
    };
  },

  getDailySummary: async (date) => {
    return {
      data: {
        date,
        totalCalories: 1850,
        totalProtein: 120,
        totalCarbs: 200,
        totalFats: 65,
        meals: []
      }
    };
  }
};

//////////////////// TRACKER API ////////////////////

export const trackerAPI = {
  getDailyData: async (date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracker/daily?date=${date}`, {
        headers: getHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      const savedEntries = localStorage.getItem(`dailyEntries_${date}`);
      return {
        data: {
          date,
          entries: savedEntries ? JSON.parse(savedEntries) : [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFats: 0
        }
      };
    }
  },

  addFoodEntry: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracker/food-entry`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      const newEntry = { id: Date.now(), ...data, createdAt: new Date().toISOString() };
      const savedEntries = localStorage.getItem(`dailyEntries_${data.date}`);
      const entries = savedEntries ? JSON.parse(savedEntries) : [];
      entries.push(newEntry);
      localStorage.setItem(`dailyEntries_${data.date}`, JSON.stringify(entries));
      return { data: newEntry };
    }
  },

  updateFoodEntry: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracker/food-entry/${id}`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      const savedEntries = localStorage.getItem(`dailyEntries_${data.date}`);
      const entries = savedEntries ? JSON.parse(savedEntries) : [];
      const index = entries.findIndex(e => e.id === parseInt(id));
      if (index !== -1) {
        entries[index] = { ...entries[index], ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem(`dailyEntries_${data.date}`, JSON.stringify(entries));
      }
      return { data: entries[index] };
    }
  },

  deleteFoodEntry: async (id, date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracker/food-entry/${id}`, {
        method: 'DELETE', headers: getHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      const savedEntries = localStorage.getItem(`dailyEntries_${date}`);
      const entries = savedEntries ? JSON.parse(savedEntries) : [];
      const filtered = entries.filter(e => e.id !== parseInt(id));
      localStorage.setItem(`dailyEntries_${date}`, JSON.stringify(filtered));
      return { success: true };
    }
  },

  getWeeklySummary: async (startDate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracker/weekly-summary?startDate=${startDate}`, {
        headers: getHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      return {
        data: {
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          calories: [1800, 1900, 1750, 2000, 1850, 2100, 1700],
          averageCalories: 1870,
          totalCalories: 13100,
          bestDay: "Saturday"
        }
      };
    }
  },

  getMonthlyReport: async (year, month) => {
    return {
      data: {
        year,
        month,
        totalCalories: 56000,
        averageDaily: 1867,
        bestDay: 15,
        totalDays: 30,
        weeklyAverages: [13000, 13200, 12800, 13500]
      }
    };
  }
};

//////////////////// FOOD API (for FoodReminders and ImageFoodDetector) ////////////////////

export const foodAPI = {
  getToday: async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await trackerAPI.getDailyData(today);
    return { data: res.data.entries || [] };
  },

  getHistory: async (start, end) => {
    const res = await trackerAPI.getWeeklySummary(start);
    return { data: res.data || [] };
  },

  addEntry: async (data) => trackerAPI.addFoodEntry(data),
  updateEntry: async (id, data) => trackerAPI.updateFoodEntry(id, data),
  deleteEntry: async (id, date) => trackerAPI.deleteFoodEntry(id, date),

  detectFood: async (imageFile) => {
    // Mock food detection
    return {
      data: {
        foods: [
          { name: "Apple", confidence: 0.95, calories: 95 },
          { name: "Banana", confidence: 0.87, calories: 105 }
        ]
      }
    };
  },

  getSuggestions: async (query) => {
    return {
      data: [
        { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
        { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
        { name: "Orange", calories: 62, protein: 1.2, carbs: 15, fats: 0.2 }
      ]
    };
  }
};

//////////////////// AI API ////////////////////

export const aiAPI = {
  getAdvice: async (query, userContext) => {
    // Mock AI response
    const responses = {
      protein: "Protein is essential for muscle repair. Good sources include chicken, fish, eggs, legumes, and tofu.",
      calories: "Daily calorie needs vary by age, gender, weight, and activity level. Average is 2000-2500 for adults.",
      weight_loss: "For healthy weight loss, aim for a 500 calorie deficit, increase protein and fiber intake, and exercise regularly.",
      breakfast: "Healthy breakfast ideas: oatmeal with berries, Greek yogurt parfait, or avocado toast with eggs."
    };
    
    const lowerQuery = query.toLowerCase();
    let response = "I'm here to help with your nutrition questions! Could you please be more specific?";
    
    for (const [key, value] of Object.entries(responses)) {
      if (lowerQuery.includes(key)) {
        response = value;
        break;
      }
    }
    
    return { data: { advice: response } };
  },

  getMealPlan: async (mealType, userContext) => {
    const mealPlans = {
      breakfast: [
        { name: "Protein Oatmeal", details: ["Oats, protein powder, berries, nuts"], calories: 450 },
        { name: "Green Smoothie Bowl", details: ["Spinach, banana, protein powder, chia seeds"], calories: 400 }
      ],
      lunch: [
        { name: "Grilled Chicken Salad", details: ["Chicken, mixed greens, avocado, olive oil"], calories: 450 },
        { name: "Quinoa Bowl", details: ["Quinoa, chickpeas, roasted veggies, tahini"], calories: 500 }
      ],
      dinner: [
        { name: "Salmon with Veggies", details: ["Salmon, broccoli, sweet potato"], calories: 550 },
        { name: "Turkey Meatballs", details: ["Turkey, whole wheat pasta, marinara"], calories: 580 }
      ],
      snack: [
        { name: "Greek Yogurt", details: ["Greek yogurt, berries, honey"], calories: 250 },
        { name: "Apple with PB", details: ["Apple, peanut butter"], calories: 200 }
      ]
    };
    
    return { data: { mealOptions: mealPlans[mealType] || mealPlans.snack } };
  },

  getChatHistory: async () => {
    const savedHistory = localStorage.getItem('chatHistory');
    return { data: { history: savedHistory ? JSON.parse(savedHistory) : [] } };
  },

  clearChatHistory: async () => {
    localStorage.removeItem('chatHistory');
    return { success: true };
  },

  getNutritionAdvice: async (query, userContext) => {
    return aiAPI.getAdvice(query, userContext);
  },

  analyzeSymptoms: async (symptoms) => {
    return {
      data: {
        analysis: "Based on your symptoms, consider increasing hydration and consulting a doctor.",
        recommendations: ["Drink more water", "Rest adequately", "Consult a healthcare provider"]
      }
    };
  },

  getDiseaseGuide: async (diseaseName) => {
    const guides = {
      diabetes: {
        name: "Diabetes",
        description: "A condition that affects how your body processes blood sugar.",
        recommendedFoods: ["Leafy greens", "Whole grains", "Lean proteins"],
        foodsToAvoid: ["Sugary drinks", "White bread", "Processed snacks"]
      },
      hypertension: {
        name: "Hypertension",
        description: "High blood pressure condition.",
        recommendedFoods: ["Leafy greens", "Berries", "Oats"],
        foodsToAvoid: ["Salt", "Processed foods", "Alcohol"]
      }
    };
    return { data: guides[diseaseName] || guides.diabetes };
  }
};

//////////////////// REMINDER API ////////////////////

export const reminderAPI = {
  getAll: async () => {
    const savedReminders = localStorage.getItem('reminders');
    return { data: savedReminders ? JSON.parse(savedReminders) : [] };
  },

  create: async (data) => {
    const newReminder = { id: Date.now(), ...data, createdAt: new Date().toISOString() };
    const savedReminders = localStorage.getItem('reminders');
    const reminders = savedReminders ? JSON.parse(savedReminders) : [];
    reminders.push(newReminder);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    return { data: newReminder };
  },

  update: async (id, data) => {
    const savedReminders = localStorage.getItem('reminders');
    const reminders = savedReminders ? JSON.parse(savedReminders) : [];
    const index = reminders.findIndex(r => r.id === parseInt(id));
    if (index !== -1) {
      reminders[index] = { ...reminders[index], ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem('reminders', JSON.stringify(reminders));
      return { data: reminders[index] };
    }
    throw new Error('Reminder not found');
  },

  delete: async (id) => {
    const savedReminders = localStorage.getItem('reminders');
    const reminders = savedReminders ? JSON.parse(savedReminders) : [];
    const filtered = reminders.filter(r => r.id !== parseInt(id));
    localStorage.setItem('reminders', JSON.stringify(filtered));
    return { success: true };
  }
};

//////////////////// YOGA API ////////////////////

export const yogaAPI = {
  getPoses: async (category = 'all') => {
    const poses = [
      { id: 1, name: "Mountain Pose", sanskrit: "Tadasana", category: "standing", difficulty: "beginner", duration: 60 },
      { id: 2, name: "Downward Dog", sanskrit: "Adho Mukha Svanasana", category: "standing", difficulty: "beginner", duration: 90 },
      { id: 3, name: "Child's Pose", sanskrit: "Balasana", category: "restorative", difficulty: "beginner", duration: 120 },
      { id: 4, name: "Tree Pose", sanskrit: "Vrikshasana", category: "standing", difficulty: "intermediate", duration: 60 },
      { id: 5, name: "Warrior II", sanskrit: "Virabhadrasana II", category: "standing", difficulty: "intermediate", duration: 60 },
      { id: 6, name: "Crow Pose", sanskrit: "Bakasana", category: "arm-balancing", difficulty: "advanced", duration: 45 }
    ];
    
    let filtered = poses;
    if (category !== 'all') {
      filtered = poses.filter(p => p.category === category);
    }
    return { data: filtered };
  },

  getPoseById: async (id) => {
    const poses = await yogaAPI.getPoses();
    return { data: poses.data.find(p => p.id === parseInt(id)) };
  },

  getRoutine: async (goal, duration) => {
    return {
      data: {
        name: `${goal} Yoga Routine`,
        duration: duration,
        poses: [
          { name: "Mountain Pose", duration: 60 },
          { name: "Downward Dog", duration: 90 },
          { name: "Warrior II", duration: 60 },
          { name: "Child's Pose", duration: 120 }
        ]
      }
    };
  }
};

//////////////////// HEALTH API (for DiseaseGuide) ////////////////////

export const healthAPI = {
  getDiseaseGuide: async (disease) => {
    const guides = {
      diabetes: {
        name: "Diabetes",
        icon: "🩸",
        color: "blue",
        description: "Diabetes is a chronic condition that affects how your body turns food into energy.",
        recommendedFoods: ["Leafy Greens", "Whole Grains", "Lean Proteins", "Berries", "Nuts"],
        foodsToAvoid: ["Sugary Beverages", "White Bread", "Processed Snacks", "Fried Foods"],
        recommendedMedicines: ["Metformin", "Insulin", "Sulfonylureas"],
        lifestyleTips: ["Monitor blood sugar", "Regular exercise", "Stay hydrated", "Manage stress"],
        exerciseRecommendations: ["Brisk walking", "Swimming", "Cycling", "Yoga"],
        yogaAsanas: ["Surya Namaskar", "Dhanurasana", "Vajrasana"]
      },
      hypertension: {
        name: "Hypertension",
        icon: "❤️",
        color: "red",
        description: "High blood pressure condition that can lead to heart disease.",
        recommendedFoods: ["Leafy Greens", "Berries", "Oats", "Bananas", "Fatty Fish"],
        foodsToAvoid: ["Salt", "Processed Foods", "Alcohol", "Caffeine"],
        recommendedMedicines: ["ACE Inhibitors", "Diuretics", "Beta-blockers"],
        lifestyleTips: ["Reduce sodium", "Exercise regularly", "Limit alcohol", "Manage stress"],
        exerciseRecommendations: ["Walking", "Swimming", "Light jogging", "Stretching"],
        yogaAsanas: ["Shavasana", "Pranayama", "Anulom Vilom"]
      },
      pcos: {
        name: "PCOS/PCOD",
        icon: "🌸",
        color: "pink",
        description: "Hormonal disorder common among women of reproductive age.",
        recommendedFoods: ["High-Fiber Veggies", "Lean Proteins", "Healthy Fats", "Whole Grains"],
        foodsToAvoid: ["Processed Foods", "Sugary Snacks", "White Bread", "Fried Foods"],
        recommendedMedicines: ["Birth Control Pills", "Metformin", "Clomiphene"],
        lifestyleTips: ["Maintain healthy BMI", "Regular exercise", "Manage stress", "Track cycle"],
        exerciseRecommendations: ["Cardio", "Strength training", "HIIT", "Walking"],
        yogaAsanas: ["Bhujangasana", "Dhanurasana", "Naukasana"]
      },
      bodyPain: {
        name: "Body Pain",
        icon: "💪",
        color: "orange",
        description: "Chronic body pain from various causes including inflammation.",
        recommendedFoods: ["Turmeric", "Ginger", "Fatty Fish", "Berries", "Leafy Greens"],
        foodsToAvoid: ["Processed Foods", "Sugar", "Fried Foods", "Alcohol"],
        recommendedMedicines: ["Acetaminophen", "Ibuprofen", "Naproxen"],
        lifestyleTips: ["Stay active", "Heat/cold therapy", "Good posture", "Stay hydrated"],
        exerciseRecommendations: ["Gentle stretching", "Walking", "Swimming", "Tai Chi"],
        yogaAsanas: ["Cat-Cow", "Child's Pose", "Downward Dog", "Bridge Pose"]
      }
    };
    
    return { data: guides[disease] || guides.diabetes };
  }
};

//////////////////// REPORT API ////////////////////

export const reportAPI = {
  getMonthlyReport: async (year, month) => {
    return trackerAPI.getMonthlyReport(year, month);
  },
  
  downloadReport: async (year, month, format = 'pdf') => {
    const report = await trackerAPI.getMonthlyReport(year, month);
    return { data: { url: '#', format } };
  },
  
  getNutritionTrends: async (days = 30) => {
    return {
      data: {
        labels: Array.from({ length: days }, (_, i) => `Day ${i + 1}`),
        calories: Array.from({ length: days }, () => Math.floor(1800 + Math.random() * 400)),
        protein: Array.from({ length: days }, () => Math.floor(80 + Math.random() * 40)),
        carbs: Array.from({ length: days }, () => Math.floor(150 + Math.random() * 50)),
        fats: Array.from({ length: days }, () => Math.floor(40 + Math.random() * 30))
      }
    };
  }
};

//////////////////// UTILITY FUNCTIONS ////////////////////

export const calculateDailyCalories = (userData) => {
  const { age, gender, weight, height, activityLevel } = userData;
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));
};

export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Default export for convenience
export default {
  authAPI,
  userAPI,
  nutritionAPI,
  trackerAPI,
  foodAPI,
  aiAPI,
  reminderAPI,
  yogaAPI,
  healthAPI,
  reportAPI,
  calculateDailyCalories,
  getBMICategory,
  calculateBMI
};