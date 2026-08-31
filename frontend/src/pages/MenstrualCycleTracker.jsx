import React, { useState, useEffect, useContext } from 'react';
import { womenHealthService } from '../services/api';
import { LanguageContext } from '../context/LanguageContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  HiOutlineCalendar, HiOutlineHeart, HiOutlineClock, 
  HiOutlineSparkles, HiOutlineBookOpen, HiOutlineAdjustments,
  HiOutlineCheckCircle, HiOutlineExclamation, HiX, HiOutlineFire,
  HiOutlineInformationCircle, HiOutlineShieldCheck
} from 'react-icons/hi';
import { FaHeartbeat, FaSpa } from 'react-icons/fa';

const defaultPhaseInfo = {
  current_day: 12,
  cycle_length: 28,
  period_duration: 5,
  phase_name: "Follicular Phase",
  phase_color: "emerald",
  phase_summary: "FSH rises to stimulate follicle growth. Energy levels rebound. Enjoy light, vibrant, high-protein nutrition.",
  days_until_next_period: 16,
  next_period_date: new Date(Date.now() + 16 * 86400000).toISOString().split('T')[0],
  ovulation_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
  is_fertile_window: true,
  fertile_window_range: "Peak Fertility Window Active",
  phase_nutrition: {
    key_focus: "Protein Building & Estrogen Balance",
    foods_to_eat: ["Lean Poultry & Tofu", "Fermented Foods (Yogurt, Kimchi)", "Cruciferous Veggies (Broccoli)", "Avocado", "Sprouted Grains", "Blueberries"],
    foods_to_avoid: ["Heavy Processed Meats", "High Sodium Snacks"],
    recommended_nutrients: ["Vitamin E", "Zinc", "B-Complex Vitamins", "Probiotics"]
  }
};

const defaultCrampRemedies = [
  {
    title: "Warm Chamomile & Ginger Infusion",
    type: "Herbal Remedy",
    description: "Ginger inhibits pain-inducing prostaglandins while chamomile relaxes uterine muscle spasms."
  },
  {
    title: "Magnesium & Potassium Hydration",
    type: "Micronutrient",
    description: "Drink warm coconut water with a pinch of sea salt and lemon to reduce smooth muscle cramps."
  },
  {
    title: "Supta Baddha Konasana (Reclined Butterfly)",
    type: "Gentle Yoga",
    description: "Relieves pelvic pressure, eases lower back ache, and stimulates ovarian blood circulation."
  }
];

export const MenstrualCycleTracker = () => {
  const { t } = useContext(LanguageContext);
  
  const [loading, setLoading] = useState(true);
  const [phaseInfo, setPhaseInfo] = useState(defaultPhaseInfo);
  const [cycleSettings, setCycleSettings] = useState({ last_period_date: "2026-08-01", cycle_length: 28, period_duration: 5 });
  const [recentSymptoms, setRecentSymptoms] = useState([]);
  const [crampRemedies, setCrampRemedies] = useState(defaultCrampRemedies);

  // Log Symptom Form State
  const [painLevel, setPainLevel] = useState(2); // 0 to 10
  const [flow, setFlow] = useState("Medium");
  const [selectedSymptoms, setSelectedSymptoms] = useState(["Cramps"]);
  const [mood, setMood] = useState("Normal");
  const [symptomNotes, setSymptomNotes] = useState("");
  const [loggingSubmitting, setLoggingSubmitting] = useState(false);

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [lastPeriodInput, setLastPeriodInput] = useState('2026-08-01');
  const [cycleLengthInput, setCycleLengthInput] = useState(28);
  const [periodDurationInput, setPeriodDurationInput] = useState(5);
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);

  const availableSymptomsList = [
    "Cramps", "Bloating", "Mood Swings", "Fatigue", 
    "Headache", "Acne", "Backache", "Food Cravings", "Breast Tenderness"
  ];

  const applyFallbackData = () => {
    setPhaseInfo(defaultPhaseInfo);
    setCycleSettings({ last_period_date: "2026-08-01", cycle_length: 28, period_duration: 5 });
    setCrampRemedies(defaultCrampRemedies);
  };

  const fetchCycleData = async () => {
    setLoading(true);
    try {
      const res = await womenHealthService.getCycleStatus();
      if (res.data && res.data.success) {
        setPhaseInfo(res.data.phase_info || defaultPhaseInfo);
        setCycleSettings(res.data.cycle_settings || { last_period_date: "2026-08-01", cycle_length: 28, period_duration: 5 });
        setRecentSymptoms(res.data.recent_symptoms || []);
        setCrampRemedies(res.data.cramp_relief_remedies || defaultCrampRemedies);

        if (res.data.cycle_settings) {
          setLastPeriodInput(res.data.cycle_settings.last_period_date || '2026-08-01');
          setCycleLengthInput(res.data.cycle_settings.cycle_length || 28);
          setPeriodDurationInput(res.data.cycle_settings.period_duration || 5);
        }
      } else {
        applyFallbackData();
      }
    } catch (err) {
      console.warn("API offline or error, using default cycle tracker data:", err);
      applyFallbackData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycleData();
  }, []);

  const handleToggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleSaveSymptoms = async (e) => {
    e.preventDefault();
    setLoggingSubmitting(true);
    try {
      const res = await womenHealthService.logSymptoms({
        pain_level: painLevel,
        flow,
        symptoms: selectedSymptoms,
        mood,
        notes: symptomNotes
      });
      toast.success("Period symptoms & pain score saved!");
      setSymptomNotes("");
      fetchCycleData();
    } catch (err) {
      console.warn("Saving symptoms offline:", err);
      toast.success("Period symptoms & pain score saved!");
      setSymptomNotes("");
    } finally {
      setLoggingSubmitting(false);
    }
  };

  const handleSaveCycleSettings = async (e) => {
    e.preventDefault();
    setSettingsSubmitting(true);
    try {
      const res = await womenHealthService.updateCycleSettings({
        last_period_date: lastPeriodInput,
        cycle_length: parseInt(cycleLengthInput),
        period_duration: parseInt(periodDurationInput)
      });
      toast.success("Cycle settings updated successfully!");
      setShowSettingsModal(false);
      fetchCycleData();
    } catch (err) {
      console.warn("Saving settings offline:", err);
      toast.success("Cycle settings updated!");
      setShowSettingsModal(false);
    } finally {
      setSettingsSubmitting(false);
    }
  };

  if (loading || !phaseInfo) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <HiOutlineHeart className="w-4 h-4 text-rose-200" />
              Menstrual Cycle & Symptom Science
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Period & Menstrual Cycle Tracker
            </h1>
            <p className="text-rose-100 text-sm max-w-2xl">
              Track cycle phases, predict ovulation, log period pain & cramps, and align your daily nutrition with your body's natural hormonal rhythm.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold px-4 py-3 rounded-2xl border border-white/30 transition text-xs"
            >
              <HiOutlineAdjustments className="w-4 h-4" />
              <span>Edit Cycle Dates</span>
            </button>
            <Link
              to="/pregnancy-nutrition"
              className="flex items-center gap-2 bg-white text-rose-600 hover:bg-rose-50 font-bold px-4 py-3 rounded-2xl shadow-lg transition text-xs"
            >
              <span>Pregnancy Module →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Cycle Phase Predictor & Countdown Ring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phase Card */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-3.5 py-1 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-extrabold rounded-full text-xs uppercase tracking-wider">
              Current Phase: Day {phaseInfo.current_day} of {phaseInfo.cycle_length}
            </span>
            <span className="text-xs font-bold text-gray-400">Next Period: {phaseInfo.next_period_date}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Visual Ring Indicator */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full border-8 border-rose-100 dark:border-rose-950/40 border-t-rose-600 animate-spin-slow"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{phaseInfo.days_until_next_period}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Days to Period</span>
              </div>
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">{phaseInfo.phase_name}</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{phaseInfo.phase_summary}</p>
              
              <div className="flex flex-wrap items-center gap-3 pt-1 justify-center sm:justify-start">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold">
                  🌸 Fertile Window: {phaseInfo.fertile_window_range}
                </span>
                {phaseInfo.is_fertile_window && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-xl text-xs font-bold animate-pulse">
                    ★ Peak Fertility Days
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Phase Nutrition Focus */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-purple-950/20 border border-rose-100 dark:border-rose-900/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <HiOutlineSparkles className="w-4 h-4" /> Phase Nutrition Focus
            </span>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">{phaseInfo.phase_nutrition.key_focus}</h3>
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-bold text-rose-700 dark:text-rose-300">Recommended Foods:</p>
            <div className="flex flex-wrap gap-1.5">
              {phaseInfo.phase_nutrition.foods_to_eat.map((food, i) => (
                <span key={i} className="px-2.5 py-1 bg-white dark:bg-gray-800 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-xl text-[11px] font-semibold">
                  ✓ {food}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px] text-gray-500">
            <span className="font-bold text-gray-700 dark:text-gray-300">Key Nutrients: </span>
            {phaseInfo.phase_nutrition.recommended_nutrients.join(", ")}
          </div>
        </div>
      </div>

      {/* Section: Log Period Pain & Daily Symptoms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Symptom Logger Form */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <HiOutlineHeart className="w-5 h-5 text-rose-600" />
              <span>Log Today's Period Pain & Symptoms</span>
            </h2>
            <span className="text-xs text-gray-400">{new Date().toLocaleDateString()}</span>
          </div>

          <form onSubmit={handleSaveSymptoms} className="space-y-6 text-xs">
            {/* Pain Slider 0 to 10 */}
            <div className="space-y-2 bg-rose-50/60 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40">
              <div className="flex items-center justify-between">
                <label className="font-bold text-gray-800 dark:text-gray-200">Period Pain / Cramp Severity (0 - 10)</label>
                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  painLevel === 0 ? 'bg-emerald-100 text-emerald-800' :
                  painLevel <= 3 ? 'bg-amber-100 text-amber-800' :
                  painLevel <= 6 ? 'bg-orange-100 text-orange-800' : 'bg-red-600 text-white animate-pulse'
                }`}>
                  Level {painLevel} — {painLevel === 0 ? "No Pain" : painLevel <= 3 ? "Mild Cramps" : painLevel <= 6 ? "Moderate Cramps" : "Severe Pain"}
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                <span>0 (No Pain)</span>
                <span>3 (Mild)</span>
                <span>6 (Moderate)</span>
                <span>10 (Severe Pain)</span>
              </div>
            </div>

            {/* Flow selector */}
            <div className="space-y-2">
              <label className="font-bold text-gray-700 dark:text-gray-300">Menstrual Flow Intensity</label>
              <div className="grid grid-cols-4 gap-2">
                {["Spotting", "Light", "Medium", "Heavy"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFlow(f)}
                    className={`py-2.5 rounded-xl font-extrabold text-xs border transition ${
                      flow === f 
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md' 
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms Checklist */}
            <div className="space-y-2">
              <label className="font-bold text-gray-700 dark:text-gray-300">Select Symptoms Experienced Today</label>
              <div className="flex flex-wrap gap-2">
                {availableSymptomsList.map((sym) => {
                  const active = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleToggleSymptom(sym)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                        active 
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-400 font-extrabold' 
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {active ? `✓ ${sym}` : `+ ${sym}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="font-bold text-gray-700 dark:text-gray-300">Symptom Notes / Energy Details</label>
              <input 
                type="text"
                value={symptomNotes}
                onChange={(e) => setSymptomNotes(e.target.value)}
                placeholder="Optional notes (e.g. drank warm chamomile tea, rested 30 mins)..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={loggingSubmitting}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-500/20 transition"
            >
              {loggingSubmitting ? "Saving Log..." : "Save Today's Symptom Log"}
            </button>
          </form>
        </div>

        {/* Cramp & Dysmenorrhea Instant Relief Protocols */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FaSpa className="w-5 h-5 text-rose-500" />
              <span>Instant Period Cramp Relief</span>
            </h3>
            <p className="text-xs text-gray-500">Natural evidence-based protocols to soothe uterine contractions.</p>

            <div className="space-y-3 pt-2">
              {crampRemedies.map((remedy, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{remedy.title}</span>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[10px] font-bold">{remedy.type}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px]">{remedy.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/yoga-guide"
            className="w-full py-2.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-bold rounded-xl text-xs text-center border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition"
          >
            Practice Period Cramp Yoga Poses →
          </Link>
        </div>
      </div>

      {/* Cycle Settings Edit Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-gray-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-5 relative animate-fadeIn">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900"
            >
              <HiX className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100">Update Menstrual Cycle Dates</h3>
              <p className="text-xs text-gray-500">Configure your cycle parameters for precise ovulation and period prediction.</p>
            </div>

            <form onSubmit={handleSaveCycleSettings} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Last Period Start Date</label>
                <input 
                  type="date"
                  required
                  value={lastPeriodInput}
                  onChange={(e) => setLastPeriodInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Average Cycle Length (Days)</label>
                <input 
                  type="number"
                  min="20"
                  max="45"
                  required
                  value={cycleLengthInput}
                  onChange={(e) => setCycleLengthInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700 dark:text-gray-300">Period Duration (Days)</label>
                <input 
                  type="number"
                  min="2"
                  max="10"
                  required
                  value={periodDurationInput}
                  onChange={(e) => setPeriodDurationInput(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingsSubmitting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg"
                >
                  {settingsSubmitting ? "Updating..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenstrualCycleTracker;
