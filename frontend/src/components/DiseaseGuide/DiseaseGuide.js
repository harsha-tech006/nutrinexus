import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { 
  FaApple, FaBan, FaPills, FaHeartbeat, 
  FaRunning, FaArrowLeft, FaCheckCircle,
  FaExclamationTriangle, FaInfoCircle, FaCarrot,
  FaWater, FaMoon, FaSmile, FaSpa
} from 'react-icons/fa';

const DiseaseGuide = () => {
  const { disease } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch guide data when disease changes
  useEffect(() => {
    if (disease) {
      fetchGuide();
    } else {
      setLoading(false);
      toast.error('No disease specified');
    }
  }, [disease]);

  // Fetch disease guide from API or mock data
  const fetchGuide = async () => {
    setLoading(true);
    try {
      // Try to import healthAPI dynamically
      let data;
      try {
        const { healthAPI } = await import('../../utils/api');
        if (healthAPI && healthAPI.getDiseaseGuide) {
          const response = await healthAPI.getDiseaseGuide(disease);
          data = response.data;
        } else {
          data = getMockDiseaseGuide(disease);
        }
      } catch (error) {
        console.error('API not available, using mock data:', error);
        data = getMockDiseaseGuide(disease);
      }
      
      if (data) {
        setGuide(data);
      } else {
        toast.error('Guide not found for this condition');
        setGuide(getMockDiseaseGuide('diabetes'));
      }
    } catch (error) {
      console.error('Error fetching disease guide:', error);
      toast.error('Error fetching disease guide. Using available data.');
      const mockData = getMockDiseaseGuide(disease);
      if (mockData) {
        setGuide(mockData);
      } else {
        setGuide(getMockDiseaseGuide('diabetes'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock data for different diseases
  const getMockDiseaseGuide = (diseaseType) => {
    const guides = {
      diabetes: {
        name: 'Diabetes',
        icon: '🩸',
        color: 'blue',
        description: 'Diabetes is a chronic condition that affects how your body turns food into energy. Most of the food you eat is broken down into sugar (glucose) and released into your bloodstream. When your blood sugar goes up, it signals your pancreas to release insulin. Insulin acts like a key to let blood sugar into your body\'s cells for use as energy.',
        recommendedFoods: [
          'Leafy Greens (Spinach, Kale)',
          'Whole Grains (Brown Rice, Quinoa)',
          'Lean Proteins (Chicken, Fish, Tofu)',
          'Berries (Strawberries, Blueberries)',
          'Nuts and Seeds (Almonds, Chia Seeds)',
          'Greek Yogurt',
          'Legumes (Lentils, Chickpeas)',
          'Cinnamon'
        ],
        foodsToAvoid: [
          'Sugary Beverages (Soda, Sweet Tea)',
          'White Bread and Pasta',
          'Processed Snacks (Chips, Cookies)',
          'Fried Foods',
          'High-Sugar Fruits (Watermelon, Grapes)',
          'Sweetened Cereals',
          'Pastries and Cakes',
          'White Rice'
        ],
        recommendedMedicines: [
          'Metformin - First-line medication for type 2 diabetes',
          'Sulfonylureas - Help body produce more insulin',
          'DPP-4 inhibitors - Help reduce blood sugar levels',
          'GLP-1 receptor agonists - Slow digestion and lower blood sugar',
          'Insulin therapy - For type 1 and advanced type 2 diabetes'
        ],
        lifestyleTips: [
          'Monitor blood sugar levels regularly',
          'Eat meals at consistent times',
          'Stay hydrated with water',
          'Maintain a healthy weight',
          'Get regular eye and foot checkups',
          'Manage stress through meditation',
          'Get 7-8 hours of quality sleep',
          'Quit smoking if applicable'
        ],
        exerciseRecommendations: [
          'Brisk walking - 30 minutes daily',
          'Swimming - Low impact cardio',
          'Cycling - Great for leg strength',
          'Strength training - 2-3 times per week',
          'Yoga - Improves insulin sensitivity',
          'Tai Chi - Gentle movements for balance'
        ],
        yogaAsanas: [
          'Surya Namaskar (Sun Salutation)',
          'Dhanurasana (Bow Pose)',
          'Ardha Matsyendrasana (Half Spinal Twist)',
          'Vajrasana (Diamond Pose)',
          'Paschimottanasana (Seated Forward Bend)',
          'Bhujangasana (Cobra Pose)',
          'Shavasana (Corpse Pose)'
        ],
        dailyMealPlan: {
          breakfast: 'Oatmeal with berries and nuts + Green tea',
          lunch: 'Grilled chicken salad with quinoa + Lemon water',
          dinner: 'Baked salmon with steamed broccoli + Brown rice',
          snacks: 'Greek yogurt or handful of almonds'
        },
        warningSigns: [
          'Frequent urination',
          'Excessive thirst',
          'Unexplained weight loss',
          'Extreme fatigue',
          'Blurred vision',
          'Slow-healing sores'
        ]
      },
      pcos: {
        name: 'PCOS/PCOD',
        icon: '🌸',
        color: 'pink',
        description: 'Polycystic Ovary Syndrome (PCOS) is a hormonal disorder common among women of reproductive age. Women with PCOS may have irregular menstrual periods, excess androgen levels, and polycystic ovaries. Early diagnosis and treatment can help manage symptoms and reduce the risk of long-term complications.',
        recommendedFoods: [
          'High-Fiber Vegetables (Broccoli, Cauliflower)',
          'Lean Proteins (Chicken, Fish, Eggs)',
          'Healthy Fats (Avocado, Olive Oil)',
          'Whole Grains (Oats, Quinoa, Brown Rice)',
          'Legumes (Lentils, Chickpeas)',
          'Berries and Citrus Fruits',
          'Nuts and Seeds (Flaxseeds, Walnuts)',
          'Green Tea'
        ],
        foodsToAvoid: [
          'Processed Foods',
          'Sugary Snacks and Desserts',
          'White Bread and Pasta',
          'Fried Foods',
          'Dairy Products (for some women)',
          'Soy Products',
          'Artificial Sweeteners',
          'Red Meat'
        ],
        recommendedMedicines: [
          'Birth Control Pills - Regulate menstrual cycles',
          'Metformin - Improves insulin resistance',
          'Clomiphene - Induces ovulation',
          'Spironolactone - Reduces excess hair growth',
          'Letrozole - Stimulates ovulation'
        ],
        lifestyleTips: [
          'Maintain a healthy BMI',
          'Exercise regularly (at least 150 min/week)',
          'Manage stress levels',
          'Get adequate sleep',
          'Track your menstrual cycle',
          'Limit caffeine intake',
          'Stay hydrated',
          'Consider supplements (Inositol, Vitamin D)'
        ],
        exerciseRecommendations: [
          'Cardio workouts - 30 minutes daily',
          'Strength training - Build muscle mass',
          'High-Intensity Interval Training (HIIT)',
          'Walking - Low impact option',
          'Swimming - Full body workout',
          'Dance workouts - Fun cardio'
        ],
        yogaAsanas: [
          'Bhujangasana (Cobra Pose)',
          'Dhanurasana (Bow Pose)',
          'Naukasana (Boat Pose)',
          'Malasana (Garland Pose)',
          'Supta Baddha Konasana (Reclining Bound Angle)',
          'Setu Bandhasana (Bridge Pose)',
          'Balasana (Child\'s Pose)'
        ],
        dailyMealPlan: {
          breakfast: 'Scrambled eggs with spinach + Green tea',
          lunch: 'Quinoa bowl with chickpeas and vegetables',
          dinner: 'Grilled fish with roasted vegetables',
          snacks: 'Apple slices with almond butter'
        },
        warningSigns: [
          'Irregular periods',
          'Excess facial/body hair',
          'Severe acne',
          'Weight gain',
          'Thinning hair',
          'Dark skin patches'
        ]
      },
      hypertension: {
        name: 'Hypertension',
        icon: '❤️',
        color: 'red',
        description: 'Hypertension, or high blood pressure, is a common condition where the force of blood against your artery walls is consistently too high. Over time, this can damage your blood vessels and lead to heart disease, stroke, and other health problems. It\'s often called the "silent killer" because it typically has no symptoms.',
        recommendedFoods: [
          'Leafy Greens (Spinach, Kale)',
          'Berries (Blueberries, Strawberries)',
          'Beets',
          'Oats',
          'Bananas (High in Potassium)',
          'Fatty Fish (Salmon, Mackerel)',
          'Garlic',
          'Olive Oil'
        ],
        foodsToAvoid: [
          'Salty Foods (Chips, Pretzels)',
          'Processed Meats (Bacon, Sausage)',
          'Canned Soups and Vegetables',
          'Pickled Foods',
          'Fast Food',
          'Alcohol',
          'Caffeinated Drinks',
          'Soy Sauce'
        ],
        recommendedMedicines: [
          'ACE Inhibitors - Relax blood vessels',
          'Diuretics - Remove excess sodium',
          'Beta-blockers - Reduce heart rate',
          'Calcium channel blockers - Relax blood vessels',
          'ARBs - Block certain blood vessel chemicals'
        ],
        lifestyleTips: [
          'Reduce sodium intake (less than 1500mg/day)',
          'Monitor blood pressure at home',
          'Manage stress through relaxation techniques',
          'Maintain a healthy weight',
          'Limit alcohol consumption',
          'Quit smoking',
          'Get 7-8 hours of sleep',
          'Practice deep breathing exercises'
        ],
        exerciseRecommendations: [
          'Brisk walking - 30-40 minutes daily',
          'Swimming - Gentle on joints',
          'Cycling - Good cardiovascular workout',
          'Light jogging - If cleared by doctor',
          'Strength training - Moderate weights',
          'Stretching exercises'
        ],
        yogaAsanas: [
          'Shavasana (Corpse Pose)',
          'Vajrasana (Diamond Pose)',
          'Balasana (Child\'s Pose)',
          'Pranayama (Breathing exercises)',
          'Anulom Vilom (Alternate nostril breathing)',
          'Bhramari (Humming bee breath)',
          'Sukhasana (Easy pose with meditation)'
        ],
        dailyMealPlan: {
          breakfast: 'Oatmeal with bananas + Herbal tea',
          lunch: 'Grilled salmon salad with olive oil dressing',
          dinner: 'Baked chicken with roasted vegetables',
          snacks: 'Fresh berries or an orange'
        },
        warningSigns: [
          'Severe headaches',
          'Shortness of breath',
          'Nosebleeds',
          'Chest pain',
          'Vision problems',
          'Blood in urine'
        ]
      },
      bodypain: {
        name: 'Body Pain',
        icon: '💪',
        color: 'orange',
        description: 'Chronic body pain can result from various causes including inflammation, muscle tension, poor posture, stress, or underlying medical conditions. Proper nutrition, exercise, and lifestyle changes can help manage and reduce pain levels significantly.',
        recommendedFoods: [
          'Turmeric (Natural anti-inflammatory)',
          'Ginger',
          'Fatty Fish (Omega-3s)',
          'Berries (Antioxidants)',
          'Leafy Greens',
          'Nuts and Seeds',
          'Olive Oil',
          'Cherries'
        ],
        foodsToAvoid: [
          'Processed Foods',
          'Sugar and Artificial Sweeteners',
          'Fried Foods',
          'Refined Carbohydrates',
          'Alcohol',
          'Dairy Products (if sensitive)',
          'Red Meat',
          'Gluten (if sensitive)'
        ],
        recommendedMedicines: [
          'Acetaminophen - For mild to moderate pain',
          'Ibuprofen - Reduces inflammation',
          'Naproxen - Long-acting pain relief',
          'Topical creams (Voltaren, Capsaicin)',
          'Muscle relaxants - For muscle spasms'
        ],
        lifestyleTips: [
          'Stay active with gentle exercises',
          'Apply heat or cold therapy',
          'Practice good posture',
          'Get regular massages',
          'Use ergonomic furniture',
          'Take regular breaks from sitting',
          'Stay hydrated',
          'Get adequate sleep'
        ],
        exerciseRecommendations: [
          'Gentle stretching',
          'Walking',
          'Swimming or water aerobics',
          'Tai Chi',
          'Pilates',
          'Yoga for flexibility'
        ],
        yogaAsanas: [
          'Marjaryasana (Cat-Cow Stretch)',
          'Balasana (Child\'s Pose)',
          'Adho Mukha Svanasana (Downward Dog)',
          'Setu Bandhasana (Bridge Pose)',
          'Supta Matsyendrasana (Supine Spinal Twist)',
          'Shavasana (Corpse Pose)',
          'Bitilasana (Cow Pose)'
        ],
        dailyMealPlan: {
          breakfast: 'Turmeric smoothie with ginger and berries',
          lunch: 'Quinoa salad with salmon and greens',
          dinner: 'Vegetable curry with brown rice',
          snacks: 'Handful of walnuts or cherries'
        },
        warningSigns: [
          'Pain that doesn\'t improve with rest',
          'Severe or sudden pain',
          'Pain with fever',
          'Loss of bladder/bowel control',
          'Numbness or tingling',
          'Unexplained weight loss'
        ]
      }
    };

    // Normalize the disease type (lowercase, remove spaces)
    const normalizedDisease = diseaseType?.toLowerCase().replace(/\s+/g, '');
    return guides[normalizedDisease] || guides.diabetes;
  };

  // Get header color class based on disease color
  const getHeaderColorClass = (color) => {
    const colorClasses = {
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
      pink: 'bg-gradient-to-r from-pink-500 to-pink-600',
      red: 'bg-gradient-to-r from-red-500 to-red-600',
      orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
      green: 'bg-gradient-to-r from-green-500 to-green-600'
    };
    return colorClasses[color] || colorClasses.blue;
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Render loading state
  const renderLoading = () => {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading disease guide...</div>
        </div>
      </div>
    );
  };

  // Render error state
  const renderError = () => {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-md mx-auto">
          <FaExclamationTriangle className="text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Guide Not Found</h2>
          <p className="mb-4">The requested disease guide could not be found.</p>
          <button
            onClick={handleBack}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  };

  // Render main content
  const renderContent = () => {
    const diseaseInfo = {
      name: guide.name,
      color: guide.color,
      icon: guide.icon
    };

    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>

        {/* Header */}
        <div className={`${getHeaderColorClass(diseaseInfo.color)} rounded-2xl shadow-lg p-6 mb-8 text-white`}>
          <div className="flex items-center">
            <span className="text-6xl mr-4">{diseaseInfo.icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{diseaseInfo.name} Guide</h1>
              <p className="opacity-90 mt-1">Comprehensive guide to manage {diseaseInfo.name}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => handleTabChange('overview')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <FaInfoCircle className="inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => handleTabChange('nutrition')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'nutrition'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <FaCarrot className="inline mr-2" />
            Nutrition
          </button>
          <button
            onClick={() => handleTabChange('lifestyle')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'lifestyle'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <FaHeartbeat className="inline mr-2" />
            Lifestyle
          </button>
          <button
            onClick={() => handleTabChange('exercise')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'exercise'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <FaRunning className="inline mr-2" />
            Exercise
          </button>
          <button
            onClick={() => handleTabChange('yoga')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'yoga'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <FaSpa className="inline mr-2" />
            Yoga
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && renderOverviewTab()}

          {/* Nutrition Tab */}
          {activeTab === 'nutrition' && renderNutritionTab()}

          {/* Lifestyle Tab */}
          {activeTab === 'lifestyle' && renderLifestyleTab()}

          {/* Exercise Tab */}
          {activeTab === 'exercise' && renderExerciseTab()}

          {/* Yoga Tab */}
          {activeTab === 'yoga' && renderYogaTab()}
        </div>

        {/* Disclaimer */}
        {renderDisclaimer()}
      </div>
    );
  };

  // Render Overview Tab
  const renderOverviewTab = () => {
    return (
      <>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FaInfoCircle className="text-blue-500 mr-2" />
            About {guide.name}
          </h2>
          <p className="text-gray-700 leading-relaxed">{guide.description}</p>
        </div>

        {guide.warningSigns && guide.warningSigns.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center text-yellow-800">
              <FaExclamationTriangle className="mr-2" />
              Warning Signs to Watch
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guide.warningSigns.map((sign, index) => (
                <div key={index} className="flex items-start">
                  <FaExclamationTriangle className="text-yellow-600 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-yellow-800">{sign}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {guide.dailyMealPlan && (
          <div className="bg-green-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center text-green-800">
              <FaApple className="mr-2" />
              Sample Daily Meal Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <p className="font-semibold text-green-700">Breakfast:</p>
                <p className="text-gray-700">{guide.dailyMealPlan.breakfast}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="font-semibold text-green-700">Lunch:</p>
                <p className="text-gray-700">{guide.dailyMealPlan.lunch}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="font-semibold text-green-700">Dinner:</p>
                <p className="text-gray-700">{guide.dailyMealPlan.dinner}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="font-semibold text-green-700">Snacks:</p>
                <p className="text-gray-700">{guide.dailyMealPlan.snacks}</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Render Nutrition Tab
  const renderNutritionTab = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaApple className="text-green-500 mr-2" />
            Recommended Foods
          </h2>
          <div className="flex flex-wrap gap-2">
            {guide.recommendedFoods?.map((food, index) => (
              <span key={index} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm flex items-center">
                <FaCheckCircle className="mr-1 text-green-600" size={12} />
                {food}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaBan className="text-red-500 mr-2" />
            Foods to Avoid
          </h2>
          <div className="flex flex-wrap gap-2">
            {guide.foodsToAvoid?.map((food, index) => (
              <span key={index} className="px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm flex items-center">
                <FaExclamationTriangle className="mr-1 text-red-600" size={12} />
                {food}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaPills className="text-blue-500 mr-2" />
            Recommended Medicines
          </h2>
          <ul className="space-y-2">
            {guide.recommendedMedicines?.map((medicine, index) => (
              <li key={index} className="text-gray-700 flex items-start">
                <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={14} />
                {medicine}
              </li>
            ))}
          </ul>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-start">
            <FaExclamationTriangle className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">⚠️ Always consult your doctor before taking any medication</p>
          </div>
        </div>
      </div>
    );
  };

  // Render Lifestyle Tab
  const renderLifestyleTab = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaHeartbeat className="text-red-500 mr-2" />
            Lifestyle Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {guide.lifestyleTips?.map((tip, index) => (
              <div key={index} className="flex items-start p-2 bg-gray-50 rounded-lg">
                <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaWater className="text-blue-500 mr-2" />
            Hydration Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">💧</div>
              <p className="font-semibold">Drink 8-10 glasses</p>
              <p className="text-sm text-gray-600">of water daily</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">🚫</div>
              <p className="font-semibold">Limit caffeine</p>
              <p className="text-sm text-gray-600">and sugary drinks</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">🍵</div>
              <p className="font-semibold">Herbal teas</p>
              <p className="text-sm text-gray-600">are great alternatives</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaMoon className="text-indigo-500 mr-2" />
            Sleep Recommendations
          </h2>
          <div className="flex flex-wrap items-center justify-around gap-4">
            <div className="flex items-center">
              <span className="text-4xl mr-3">😴</span>
              <div>
                <p className="font-semibold">7-9 hours</p>
                <p className="text-sm text-gray-600">of quality sleep per night</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-4xl mr-3">⏰</span>
              <div>
                <p className="font-semibold">Consistent schedule</p>
                <p className="text-sm text-gray-600">Same bedtime and wake time</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-4xl mr-3">📱</span>
              <div>
                <p className="font-semibold">No screens</p>
                <p className="text-sm text-gray-600">1 hour before bed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Exercise Tab
  const renderExerciseTab = () => {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaRunning className="text-orange-500 mr-2" />
          Exercise Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guide.exerciseRecommendations?.map((exercise, index) => (
            <div key={index} className="flex items-center p-3 bg-orange-50 rounded-lg">
              <FaCheckCircle className="text-orange-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{exercise}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Tip: Start slowly and gradually increase intensity. Always consult your doctor before starting a new exercise routine.
          </p>
        </div>
      </div>
    );
  };

  // Render Yoga Tab
  const renderYogaTab = () => {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaSpa className="text-purple-500 mr-2" />
          Recommended Yoga Asanas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {guide.yogaAsanas?.map((asana, index) => (
            <div key={index} className="flex items-center p-3 bg-purple-50 rounded-lg">
              <FaSpa className="text-purple-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{asana}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Practice yoga under guidance if you're a beginner. Stop immediately if you feel pain.
          </p>
        </div>
      </div>
    );
  };

  // Render Disclaimer
  const renderDisclaimer = () => {
    return (
      <div className="mt-8 p-4 bg-gray-100 rounded-xl">
        <div className="flex items-start">
          <FaInfoCircle className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-semibold">Medical Disclaimer:</p>
            <p>The information provided in this guide is for educational purposes only and should not be considered as medical advice. Always consult with a qualified healthcare professional before making any changes to your diet, exercise routine, or medication regimen.</p>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  if (loading) {
    return renderLoading();
  }

  if (!guide) {
    return renderError();
  }

  return renderContent();
};

export default DiseaseGuide;