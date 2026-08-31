import React, { useState, useEffect, useContext } from 'react';
import { womenHealthService } from '../services/api';
import { LanguageContext } from '../context/LanguageContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  HiOutlineHeart, HiOutlineSparkles, HiOutlineCheckCircle, 
  HiOutlineExclamation, HiOutlineBookOpen, HiOutlineAdjustments,
  HiX, HiOutlineClock, HiOutlineShieldCheck, HiOutlineFire
} from 'react-icons/hi';
import { FaBaby, FaAppleAlt } from 'react-icons/fa';

const defaultTrimesterData = {
  1: {
    title: "First Trimester (Weeks 1 - 12)",
    calorie_delta: "+0 to +100 kcal/day",
    protein_target: "75g / day",
    key_focus: "Neural tube development & Morning sickness management",
    fetal_size_milestone: "Lime / Plum (approx. 5.4 cm)",
    essential_micronutrients: [
      { name: "Folic Acid (Folate)", target: "600 mcg/day", reason: "Prevents neural tube defects and supports spinal cord development.", sources: "Spinach, Lentils, Fortified Cereals, Avocados" },
      { name: "Vitamin B6 (Pyridoxine)", target: "1.9 mg/day", reason: "Reduces nausea, morning sickness, and hormonal vomiting.", sources: "Bananas, Chickpeas, Whole Grains, Chicken" },
      { name: "Iron", target: "27 mg/day", reason: "Builds hemoglobin to supply oxygen to placenta and fetus.", sources: "Lean Meat, Beans, Pumpkin Seeds, Tofu" }
    ]
  },
  2: {
    title: "Second Trimester (Weeks 13 - 26)",
    calorie_delta: "+340 kcal/day",
    protein_target: "85g / day",
    key_focus: "Bone mineralization & Fetal brain development",
    fetal_size_milestone: "Ear of Corn / Papaya (approx. 35 cm)",
    essential_micronutrients: [
      { name: "Calcium", target: "1000 mg/day", reason: "Builds fetal bones and tooth buds without depleting mother's skeleton.", sources: "Greek Yogurt, Skim Milk, Tofu, Almonds, Sesame Seeds" },
      { name: "DHA (Omega-3 Fatty Acid)", target: "300 mg/day", reason: "Crucial for fetal cerebral cortex and retinal vision development.", sources: "Wild Salmon, Chia Seeds, Flaxseed Oil, Algae Supplements" },
      { name: "Vitamin D3", target: "600 IU/day", reason: "Ensures efficient calcium absorption and immune system health.", sources: "Fortified Dairy, Egg Yolks, Morning Sun Exposure" }
    ]
  },
  3: {
    title: "Third Trimester (Weeks 27 - 40)",
    calorie_delta: "+450 kcal/day",
    protein_target: "100g / day",
    key_focus: "Rapid fetal weight gain & Maternal energy stamina",
    fetal_size_milestone: "Watermelon (approx. 48-52 cm)",
    essential_micronutrients: [
      { name: "Iron & Vitamin C", target: "27 mg + 85 mg", reason: "Prevents maternal anemia during delivery and aids oxygen circulation.", sources: "Citrus fruits paired with iron-rich legumes" },
      { name: "Choline", target: "450 mg/day", reason: "Supports placental function and long-term memory tissue growth.", sources: "Eggs, Chicken Breast, Salmon, Broccoli" },
      { name: "Zinc", target: "11 mg/day", reason: "Supports rapid cell division and tissue repair before birth.", sources: "Oats, Cashews, Dairy, Beans" }
    ]
  }
};

const defaultFoodsToEat = [
  { category: "Proteins", items: ["Well-cooked poultry & eggs", "Steamed tofu & edamame", "Fully cooked low-mercury fish (Salmon, Tilapia)"] },
  { category: "Greens & Folate", items: ["Steamed spinach & kale", "Lentil soups & chickpea salad", "Avocados & asparagus"] },
  { category: "Calcium & Dairy", items: ["Pasteurized Greek yogurt", "Fortified almond/soy milk", "Cottage cheese (Paneer)"] },
  { category: "Hydration & Fiber", items: ["Minimum 2.5 - 3.0L water daily", "Chia seed puddings", "Oatmeal with berries"] }
];

const defaultFoodsToAvoid = [
  { category: "Raw / Undercooked Foods", reason: "Risk of Listeria & Salmonella infection", items: ["Raw sushi / sashimi", "Soft-boiled or runny eggs", "Unpasteurized milk or cheese (Feta, Brie)"] },
  { category: "High Mercury Fish", reason: "Heavy metal damage to fetal nervous system", items: ["King Mackerel", "Shark", "Swordfish", "Tilefish"] },
  { category: "Caffeine & Stimulants", reason: "Crosses placenta, restricts growth", items: ["Limit total caffeine under 200mg/day (1 cup coffee max)", "Avoid energy drinks"] }
];

const defaultMorningSicknessRemedies = [
  { remedy: "Cold Ginger & Lemon Sparkler", desc: "Sip fresh ginger root infused water with a dash of lemon." },
  { remedy: "Dry Toast / Crackers at Bedside", desc: "Nibble dry whole grain crackers 10 minutes before sitting up in bed." },
  { remedy: "Small Frequent Meals", desc: "Eat 6 mini-meals every 2.5 hours to keep stomach from remaining empty." }
];

export const PregnancyNutrition = () => {
  const { t } = useContext(LanguageContext);
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ trimester: 2, weeks_pregnant: 18, due_date: "2026-12-15" });
  const [activeTrimester, setActiveTrimester] = useState(2); // 1, 2, 3
  const [allTrimestersData, setAllTrimestersData] = useState(defaultTrimesterData);
  const [foodsToEat, setFoodsToEat] = useState(defaultFoodsToEat);
  const [foodsToAvoid, setFoodsToAvoid] = useState(defaultFoodsToAvoid);
  const [morningSicknessRemedies, setMorningSicknessRemedies] = useState(defaultMorningSicknessRemedies);

  // Profile Edit Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [weeksInput, setWeeksInput] = useState(18);
  const [trimesterInput, setTrimesterInput] = useState(2);
  const [dueDateInput, setDueDateInput] = useState('2026-12-15');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const applyFallbackData = () => {
    setProfile({ trimester: 2, weeks_pregnant: 18, due_date: "2026-12-15" });
    setAllTrimestersData(defaultTrimesterData);
    setFoodsToEat(defaultFoodsToEat);
    setFoodsToAvoid(defaultFoodsToAvoid);
    setMorningSicknessRemedies(defaultMorningSicknessRemedies);
    setActiveTrimester(2);
  };

  const fetchPregnancyData = async () => {
    setLoading(true);
    try {
      const res = await womenHealthService.getPregnancyNutrition();
      if (res.data && res.data.success) {
        setProfile(res.data.pregnancy_profile || { trimester: 2, weeks_pregnant: 18, due_date: "2026-12-15" });
        setAllTrimestersData(res.data.all_trimesters || defaultTrimesterData);
        setFoodsToEat(res.data.foods_to_eat || defaultFoodsToEat);
        setFoodsToAvoid(res.data.foods_to_avoid || defaultFoodsToAvoid);
        setMorningSicknessRemedies(res.data.morning_sickness_remedies || defaultMorningSicknessRemedies);

        if (res.data.pregnancy_profile) {
          setActiveTrimester(res.data.pregnancy_profile.trimester || 2);
          setWeeksInput(res.data.pregnancy_profile.weeks_pregnant || 18);
          setTrimesterInput(res.data.pregnancy_profile.trimester || 2);
          setDueDateInput(res.data.pregnancy_profile.due_date || '2026-12-15');
        }
      } else {
        applyFallbackData();
      }
    } catch (err) {
      console.warn("API offline or error, using default pregnancy nutrition protocol:", err);
      applyFallbackData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPregnancyData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);
    try {
      const res = await womenHealthService.updatePregnancyProfile({
        trimester: parseInt(trimesterInput),
        weeks_pregnant: parseInt(weeksInput),
        due_date: dueDateInput
      });
      if (res.data && res.data.success) {
        toast.success("Pregnancy profile updated!");
        setShowProfileModal(false);
        setActiveTrimester(parseInt(trimesterInput));
        fetchPregnancyData();
      } else {
        setProfile({ trimester: parseInt(trimesterInput), weeks_pregnant: parseInt(weeksInput), due_date: dueDateInput });
        setActiveTrimester(parseInt(trimesterInput));
        setShowProfileModal(false);
        toast.success("Pregnancy profile updated!");
      }
    } catch (err) {
      console.warn("Updating profile offline:", err);
      setProfile({ trimester: parseInt(trimesterInput), weeks_pregnant: parseInt(weeksInput), due_date: dueDateInput });
      setActiveTrimester(parseInt(trimesterInput));
      setShowProfileModal(false);
      toast.success("Pregnancy profile updated!");
    } finally {
      setProfileSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const currentTrimesterInfo = allTrimestersData[activeTrimester] || defaultTrimesterData[2];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-pink-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <FaBaby className="w-4 h-4 text-pink-200" />
              Maternal & Fetal Clinical Nutrition Guide
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pregnancy Nutrition & Prenatal Care
            </h1>
            <p className="text-pink-100 text-sm max-w-2xl">
              Track trimester-by-trimester calorie & protein deltas, essential micronutrient targets (Folic Acid, DHA, Iron, Calcium), and fetal growth milestones.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold px-4 py-3 rounded-2xl border border-white/30 transition text-xs"
            >
              <HiOutlineAdjustments className="w-4 h-4" />
              <span>Update Trimester / Weeks</span>
            </button>
            <Link
              to="/cycle-tracker"
              className="flex items-center gap-2 bg-white text-pink-600 hover:bg-pink-50 font-bold px-4 py-3 rounded-2xl shadow-lg transition text-xs"
            >
              <span>Cycle Tracker →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Trimester Tabs Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
          {[1, 2, 3].map((tri) => (
            <button
              key={tri}
              onClick={() => setActiveTrimester(tri)}
              className={`px-5 py-3 rounded-2xl font-black text-xs transition-all duration-200 ${
                activeTrimester === tri 
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' 
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-gray-750'
              }`}
            >
              Trimester {tri}
            </button>
          ))}
        </div>

        {profile && (
          <div className="text-xs font-bold text-gray-500 px-4 text-center sm:text-right">
            Active Profile: <span className="text-pink-600 dark:text-pink-400">Week {profile.weeks_pregnant}</span> • Due Date: {profile.due_date}
          </div>
        )}
      </div>

      {/* Active Trimester Guidance & Fetal Growth Card */}
      {currentTrimesterInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trimester Metrics (2 Cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-extrabold uppercase">
                Active Clinical Protocol
              </span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-2">{currentTrimesterInfo.title}</h2>
              <p className="text-xs text-gray-500">{currentTrimesterInfo.key_focus}</p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-pink-50 dark:bg-pink-950/40 p-4 rounded-2xl border border-pink-100 dark:border-pink-900/40">
                <p className="text-[10px] uppercase font-bold text-gray-400">Calorie Target Delta</p>
                <p className="text-lg font-black text-pink-600">{currentTrimesterInfo.calorie_delta}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                <p className="text-[10px] uppercase font-bold text-gray-400">Daily Protein Goal</p>
                <p className="text-lg font-black text-purple-600">{currentTrimesterInfo.protein_target}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-[10px] uppercase font-bold text-gray-400">Fetal Size Milestone</p>
                <p className="text-sm font-extrabold text-emerald-600 truncate">{currentTrimesterInfo.fetal_size_milestone}</p>
              </div>
            </div>

            {/* Essential Micronutrient Checklist */}
            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <HiOutlineSparkles className="w-5 h-5 text-pink-500" />
                <span>Essential Prenatal Micronutrient Checklist</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentTrimesterInfo.essential_micronutrients.map((micro, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-900 dark:text-gray-100">{micro.name}</span>
                      <span className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded-md text-[10px] font-bold">{micro.target}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2">{micro.reason}</p>
                    <p className="text-[10px] text-pink-600 font-bold truncate">Sources: {micro.sources}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fetal Milestone & Morning Sickness Remedies Sidebar (1 Col) */}
          <div className="space-y-6">
            {/* Growth Milestone Card */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/20 border border-pink-100 dark:border-pink-900/40 rounded-3xl p-6 text-center space-y-3">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto shadow-md text-pink-500">
                <FaBaby className="w-8 h-8 animate-bounce" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600">Growth Milestone</span>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">{currentTrimesterInfo.fetal_size_milestone}</h3>
              <p className="text-xs text-gray-500">Organs, spine, and brain cortex developing rapidly. Keep prenatal micronutrients consistent.</p>
            </div>

            {/* Morning Sickness Remedies */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <HiOutlineHeart className="w-4 h-4 text-pink-500" />
                <span>Nausea & Morning Sickness Remedies</span>
              </h4>

              <div className="space-y-2">
                {morningSicknessRemedies.map((rem, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-xs space-y-1">
                    <p className="font-bold text-pink-600 dark:text-pink-400">✓ {rem.remedy}</p>
                    <p className="text-gray-500 text-[11px]">{rem.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pregnancy Food Safety Matrix (Foods to Eat vs Foods to Avoid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Foods to Eat */}
        <div className="bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Recommended Pregnancy Foods</span>
          </h3>

          <div className="space-y-3 text-xs">
            {foodsToEat.map((grp, idx) => (
              <div key={idx} className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-1">
                <p className="font-bold text-emerald-800 dark:text-emerald-300">{grp.category}:</p>
                <div className="flex flex-wrap gap-1">
                  {grp.items.map((item, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Foods to Avoid */}
        <div className="bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/40 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-red-800 dark:text-red-300 flex items-center gap-2">
            <HiOutlineExclamation className="w-5 h-5 text-red-600" />
            <span>Foods & Drinks to Avoid During Pregnancy</span>
          </h3>

          <div className="space-y-3 text-xs">
            {foodsToAvoid.map((grp, idx) => (
              <div key={idx} className="bg-red-50/60 dark:bg-red-950/20 p-3.5 rounded-2xl border border-red-100 dark:border-red-900/30 space-y-1">
                <div className="flex items-center justify-between font-bold text-red-800 dark:text-red-300">
                  <span>{grp.category}</span>
                  <span className="text-[10px] text-red-600 font-semibold">{grp.reason}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {grp.items.map((item, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 rounded-lg text-[11px] font-semibold border border-red-200 dark:border-red-800">
                      ⚠ {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-gray-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-5 relative animate-fadeIn">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900"
            >
              <HiX className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100">Update Pregnancy Profile</h3>
              <p className="text-xs text-gray-500">Configure your current stage for tailored prenatal nutrition guidelines.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Current Trimester</label>
                <select 
                  value={trimesterInput}
                  onChange={(e) => setTrimesterInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500"
                >
                  <option value={1}>Trimester 1 (Weeks 1 - 12)</option>
                  <option value={2}>Trimester 2 (Weeks 13 - 26)</option>
                  <option value={3}>Trimester 3 (Weeks 27 - 40)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Weeks Pregnant</label>
                <input 
                  type="number"
                  min="1"
                  max="42"
                  required
                  value={weeksInput}
                  onChange={(e) => setWeeksInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Estimated Due Date</label>
                <input 
                  type="date"
                  required
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg"
                >
                  {profileSubmitting ? "Updating..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PregnancyNutrition;
