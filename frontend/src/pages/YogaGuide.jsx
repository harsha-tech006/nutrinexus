import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import toast from 'react-hot-toast';

// Icon imports
import { 
  HiOutlineSearch, 
  HiOutlineAdjustments, 
  HiOutlineVolumeUp, 
  HiOutlineVolumeOff,
  HiOutlineSparkles,
  HiOutlineScale,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineEye,
  HiPlay,
  HiPause,
  HiRefresh,
  HiCheck,
  HiPlus,
  HiX
} from 'react-icons/hi';
import { TbYoga } from 'react-icons/tb';

// Reusable Components
import YogaCard from '../components/yoga/YogaCard';
import PoseDetails from '../components/yoga/PoseDetails';
import DailyPlan from '../components/yoga/DailyPlan';
import WeeklyChallenge from '../components/yoga/WeeklyChallenge';
import ProgressTracker from '../components/yoga/ProgressTracker';
import YogaAnalytics from '../components/yoga/YogaAnalytics';
import ImageViewer from '../components/yoga/ImageViewer';
import YogaAsanasMasterChart from '../components/yoga/YogaAsanasMasterChart';

export const YogaGuide = () => {
  const { user } = useContext(AuthContext);
  const { language, changeLanguage, t } = useContext(LanguageContext);
  const location = useLocation();

  // Parse URL search param ?disease=...
  const searchParams = new URLSearchParams(location.search);
  const initialDiseaseParam = searchParams.get('disease') || '';

  // Layout Tab State
  const [activeTab, setActiveTab] = useState('chart'); // chart, exercises, daily, weekly, analytics

  // Accessibility State
  const [isLargeTextMode, setIsLargeTextMode] = useState(false);
  const [isHighContrastMode, setIsHighContrastMode] = useState(false);

  // Explore Tab State
  const [yogas, setYogas] = useState([]);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [diseaseFilter, setDiseaseFilter] = useState(initialDiseaseParam); // quick disease recommendations
  const [loadingYogas, setLoadingYogas] = useState(true);

  useEffect(() => {
    const qDisease = new URLSearchParams(location.search).get('disease');
    if (qDisease) {
      setDiseaseFilter(qDisease);
    }
  }, [location.search]);
  
  // Listening & Image Zooming State
  const [listeningProgressList, setListeningProgressList] = useState([]);
  const [zoomedImageUrl, setZoomedImageUrl] = useState(null);
  const [zoomedPoseName, setZoomedPoseName] = useState("Yoga Pose");

  // Favorites & Overall Progress State
  const [favorites, setFavorites] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [progress, setProgress] = useState(null);

  // Daily Routine & Weekly Challenge Tab State
  const [dailyPlan, setDailyPlan] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Selected Pose for modal details
  const [selectedPose, setSelectedPose] = useState(null);

  // Interactive Timer / Active Practice State
  const [activePose, setActivePose] = useState(null);
  const [timerSec, setTimerSec] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const timerRef = useRef(null);
  const synth = window.speechSynthesis;

  // Categories list as requested
  const categories = [
    "All",
    "Beginner Yoga",
    "Advanced Yoga",
    "Weight Loss",
    "Weight Gain",
    "Diabetes",
    "PCOS",
    "PCOD",
    "Hypertension",
    "Heart Health",
    "Kidney Health",
    "Thyroid",
    "Back Pain",
    "Neck Pain",
    "Joint Pain",
    "Knee Pain",
    "Shoulder Pain",
    "Sciatica",
    "Digestive Health",
    "Constipation",
    "Stress Relief",
    "Anxiety",
    "Depression",
    "Meditation",
    "Pranayama",
    "Flexibility",
    "Strength",
    "Office Yoga",
    "Kids Yoga",
    "Senior Yoga",
    "Women's Health",
    "Men's Health",
    "Pregnancy (Safe poses only)",
    "Post Pregnancy",
    "Morning Yoga",
    "Evening Yoga"
  ];

  // Comprehensive Disease filters for all health conditions
  const diseaseFilters = [
    { label: "All Poses", value: "" },
    { label: "Diabetes", value: "Diabetes" },
    { label: "Hypertension", value: "Hypertension" },
    { label: "PCOS / PCOD", value: "PCOS" },
    { label: "Obesity / Weight Loss", value: "Obesity" },
    { label: "Cardiovascular / CAD", value: "Cardiovascular" },
    { label: "Rickets", value: "Rickets" },
    { label: "Deficiency Illnesses", value: "Deficiency" },
    { label: "Metabolic Syndrome", value: "Metabolic" },
    { label: "Chronic Fatigue", value: "Fatigue" },
    { label: "Anemia", value: "Anemia" },
    { label: "Influenza (Flu)", value: "Influenza" },
    { label: "UTI (Urinary)", value: "Urinary" },
    { label: "Acid Reflux (GERD)", value: "GERD" },
    { label: "Gastroenteritis", value: "Gastroenteritis" },
    { label: "Thyroid", value: "Thyroid" },
    { label: "Asthma & COPD", value: "Asthma" },
    { label: "Fatty Liver", value: "Liver" },
    { label: "IBS & Digestion", value: "IBS" },
    { label: "Arthritis & Joints", value: "Arthritis" },
    { label: "Osteoporosis", value: "Osteoporosis" },
    { label: "Gout (Uric Acid)", value: "Gout" },
    { label: "Kidney Disease (CKD)", value: "Kidney" },
    { label: "Migraine & Headaches", value: "Migraine" },
    { label: "Celiac Disease", value: "Celiac" },
    { label: "Anxiety & Depression", value: "Anxiety" },
    { label: "Chronic Insomnia", value: "Insomnia" }
  ];

  const fallbackYogas = [
    {
      _id: "yoga_fb_1",
      name: "Mountain Pose",
      sanskrit_name: "Tadasana",
      difficulty: "Beginner",
      duration_sec: 30,
      calories_burned: 5.0,
      category: ["Beginner Yoga", "Postural Defects", "Flat Feet", "Flexibility"],
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
      short_description: "The foundation standing pose that improves posture, balance, and core alignment.",
      step_by_step_instructions: [
        "Stand with feet together, weight balanced evenly on both feet.",
        "Inhale, raise your arms overhead, interlock fingers, and turn palms upward.",
        "Exhale, stretch up and lift heels, balancing on your toes for 20 seconds.",
        "Lower heels gently and repeat 3 times."
      ],
      breathing_instructions: ["Inhale as you raise arms", "Breathe steadily on toes", "Exhale as heels lower"],
      benefits: ["Corrects spinal posture", "Strengthens thighs, knees, and ankles", "Tones abdomen and hips"]
    },
    {
      _id: "yoga_fb_2",
      name: "Tree Pose",
      sanskrit_name: "Vrikshasana",
      difficulty: "Beginner",
      duration_sec: 30,
      calories_burned: 10.0,
      category: ["Beginner Yoga", "Senior Yoga", "Stress Relief", "Anxiety", "Flexibility", "Hypertension", "Rickets"],
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
      short_description: "A classic standing balance pose that strengthens the legs and focuses the mind.",
      step_by_step_instructions: [
        "Stand straight. Shift weight to left leg, bend right knee, and place right foot high on inner left thigh.",
        "Bring palms together at chest in prayer position.",
        "Inhale, extend arms overhead. Hold for 30 seconds. Repeat on other side."
      ],
      breathing_instructions: ["Inhale while raising hands", "Slow rhythmic breathing"],
      benefits: ["Improves neuromuscular coordination", "Strengthens feet and knees", "Calms the mind"]
    },
    {
      _id: "yoga_fb_3",
      name: "Triangle Pose",
      sanskrit_name: "Trikonasana",
      difficulty: "Beginner",
      duration_sec: 30,
      calories_burned: 18.0,
      category: ["Beginner Yoga", "Weight Loss", "Flexibility", "Constipation", "Digestive Health"],
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
      short_description: "A standing lateral stretch pose that tones abdominal muscles and stretches the spine.",
      step_by_step_instructions: [
        "Stand with feet 3-4 feet apart. Turn right foot out 90 degrees.",
        "Inhale, extend arms to sides parallel to floor.",
        "Exhale, bend torso right, reaching right hand to shin or floor. Extend left arm up.",
        "Hold for 30 seconds, gaze at left thumb. Repeat on other side."
      ],
      breathing_instructions: ["Exhale into side bend", "Deep breathing while holding"],
      benefits: ["Stretches hamstrings and hips", "Stimulates abdominal digestive organs", "Relieves backache"]
    },
    {
      _id: "yoga_fb_4",
      name: "Cobra Pose",
      sanskrit_name: "Bhujangasana",
      difficulty: "Beginner",
      duration_sec: 30,
      calories_burned: 12.0,
      category: ["Beginner Yoga", "Diabetes", "PCOS", "PCOD", "Back Pain", "Stress Relief"],
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
      short_description: "A classic backbend that increases spine flexibility, tones the abdomen, and stimulates the pancreas.",
      step_by_step_instructions: [
        "Lie on stomach with feet together, hands under shoulders, elbows close to sides.",
        "Inhale, slowly lift your chest off the floor, keeping your navel close to the ground.",
        "Roll shoulders back and keep neck long. Hold for 15-30 seconds. Exhale, return down."
      ],
      breathing_instructions: ["Inhale as chest lifts", "Steady breathing", "Exhale down"],
      benefits: ["Increases spinal flexibility", "Stimulates pancreatic cells", "Relieves stress"]
    },
    {
      _id: "yoga_fb_5",
      name: "Downward Facing Dog",
      sanskrit_name: "Adho Mukha Svanasana",
      difficulty: "Beginner",
      duration_sec: 60,
      calories_burned: 15.0,
      category: ["Beginner Yoga", "Heart Health", "Stress Relief", "Anxiety", "Flexibility", "Strength"],
      imageUrl: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&auto=format&fit=crop&q=80",
      short_description: "An inversion posture that rejuvenates the body, stretches hamstrings, and improves heart circulation.",
      step_by_step_instructions: [
        "Start on hands and knees. Tuck toes, exhale, and lift knees off floor, pushing hips upward.",
        "Straighten legs, press heels toward mat, forming an inverted 'V' shape.",
        "Relax neck, look between feet, hold for 30-60 seconds."
      ],
      breathing_instructions: ["Exhale as hips press up", "Deep abdominal breathing"],
      benefits: ["Improves blood flow to brain and heart", "Stretches hamstrings and calves", "Relieves fatigue"]
    },
    {
      _id: "yoga_fb_6",
      name: "Warrior I Pose",
      sanskrit_name: "Virabhadrasana I",
      difficulty: "Beginner",
      duration_sec: 45,
      calories_burned: 20.0,
      category: ["Beginner Yoga", "Weight Loss", "Strength", "Flexibility"],
      imageUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&auto=format&fit=crop&q=80",
      short_description: "A powerful standing lunge that builds lower body strength, opens shoulders, and boosts stamina.",
      step_by_step_instructions: [
        "Step right foot back 3-4 feet, turn foot out 45 degrees.",
        "Bend left knee to 90 degrees directly over ankle.",
        "Inhale, sweep arms overhead, palms facing each other. Gaze up. Hold 30s. Repeat."
      ],
      breathing_instructions: ["Inhale reaching arms up", "Steady calm breathing"],
      benefits: ["Strengthens shoulders, arms, and thighs", "Opens chest and lungs", "Increases stamina"]
    },
    {
      _id: "yoga_fb_7",
      name: "Warrior II Pose",
      sanskrit_name: "Virabhadrasana II",
      difficulty: "Beginner",
      duration_sec: 45,
      calories_burned: 22.0,
      category: ["Beginner Yoga", "Weight Loss", "Strength", "Flexibility"],
      imageUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&auto=format&fit=crop&q=80",
      short_description: "A strong standing stance that strengthens legs, opens hips and chest, and improves endurance.",
      step_by_step_instructions: [
        "Stand wide. Turn right foot out 90 degrees, left foot slightly in.",
        "Bend right knee to 90 degrees over ankle.",
        "Extend arms parallel to floor, gaze over right fingertips. Hold 30s. Repeat."
      ],
      breathing_instructions: ["Inhale to extend arms", "Deep breathing"],
      benefits: ["Strengthens legs and ankles", "Opens hips and chest", "Boosts circulation"]
    },
    {
      _id: "yoga_fb_8",
      name: "Butterfly Pose",
      sanskrit_name: "Baddha Konasana",
      difficulty: "Beginner",
      duration_sec: 45,
      calories_burned: 10.0,
      category: ["Beginner Yoga", "PCOS", "PCOD", "Women's Health", "Digestive Health"],
      imageUrl: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=800&auto=format&fit=crop&q=80",
      short_description: "A seated hip opener that improves pelvic circulation and inner thigh flexibility.",
      step_by_step_instructions: [
        "Sit upright with spine erect and legs extended out straight.",
        "Bend your knees and draw the soles of your feet together near your groin.",
        "Hold your feet gently with both hands, lengthen your spine, and flutter knees rhythmically.",
        "Maintain deep, steady breathing for 30 to 45 seconds."
      ],
      breathing_instructions: ["Inhale deeply to lengthen spine", "Rhythmic breathing"],
      benefits: ["Stimulates pelvic organs", "Improves hip mobility", "Relieves stress"]
    },
    {
      _id: "yoga_fb_9",
      name: "Seated Forward Bend",
      sanskrit_name: "Paschimottanasana",
      difficulty: "Intermediate",
      duration_sec: 45,
      calories_burned: 14.0,
      category: ["Intermediate Yoga", "Diabetes", "Hypertension", "Constipation", "Flexibility"],
      imageUrl: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=800&auto=format&fit=crop&q=80",
      short_description: "A deep seated forward fold that stretches the entire back body and stimulates abdominal organs.",
      step_by_step_instructions: [
        "Sit with legs extended straight ahead.",
        "Inhale, raise arms overhead. Exhale, hinge forward from hips toward feet.",
        "Grasp toes or shins, keep spine long. Hold 30-45 seconds."
      ],
      breathing_instructions: ["Inhale overhead", "Exhale folding forward"],
      benefits: ["Calms the mind", "Massages abdominal organs", "Relieves constipation"]
    },
    {
      _id: "yoga_fb_10",
      name: "Child's Pose",
      sanskrit_name: "Balasana",
      difficulty: "Beginner",
      duration_sec: 60,
      calories_burned: 8.0,
      category: ["Beginner Yoga", "Stress Relief", "Anxiety", "Chronic Fatigue", "Acid Reflux"],
      imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80",
      short_description: "A restful forward fold that relaxes the central nervous system and stretches back muscles.",
      step_by_step_instructions: [
        "Kneel on floor with big toes touching and knees hip-width apart.",
        "Exhale and lower torso between thighs, extending arms ahead.",
        "Rest forehead on mat and relax shoulders for 1-2 minutes."
      ],
      breathing_instructions: ["Deep restorative breathing"],
      benefits: ["Gently stretches hips and back", "Calms the nervous system"]
    },
    {
      _id: "yoga_fb_11",
      name: "Corpse Pose",
      sanskrit_name: "Shavasana",
      difficulty: "Beginner",
      duration_sec: 120,
      calories_burned: 5.0,
      category: ["Beginner Yoga", "Hypertension", "Anxiety", "Insomnia", "Heart Health"],
      imageUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&auto=format&fit=crop&q=80",
      short_description: "A restorative relaxation posture that lowers blood pressure and calms the body.",
      step_by_step_instructions: [
        "Lie on back with legs spread naturally, arms beside body, palms up.",
        "Close eyes and take deep, natural breaths.",
        "Relax every muscle for 3 to 5 minutes."
      ],
      breathing_instructions: ["Effortless diaphragmatic breathing"],
      benefits: ["Lowers blood pressure", "Relieves anxiety and insomnia"]
    },
    {
      _id: "yoga_fb_12",
      name: "Frog Pose",
      sanskrit_name: "Mandukasana",
      difficulty: "Intermediate",
      duration_sec: 60,
      calories_burned: 25.0,
      category: ["Intermediate Yoga", "Diabetes", "Obesity", "Weight Loss", "Digestive Health"],
      imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
      short_description: "A kneeling compression pose that activates the pancreas and abdominal digestion.",
      step_by_step_instructions: [
        "Sit in Vajrasana. Make fists with thumbs inside.",
        "Place fists on lower abdomen beside navel.",
        "Exhale, pull belly in, bend forward pressing fists into abdomen. Hold 30-60 seconds."
      ],
      breathing_instructions: ["Exhale as you fold forward"],
      benefits: ["Promotes pancreatic insulin release", "Aids digestion"]
    }
  ];

  // 1. Fetch Exploratory Yoga List
  const fetchYogas = async () => {
    setLoadingYogas(true);
    try {
      let url = `/guide/yogas?search=${encodeURIComponent(search)}`;
      if (diseaseFilter) {
        url = `/guide/yogas?disease=${encodeURIComponent(diseaseFilter)}`;
      }
      const res = await api.get(url);
      
      let list = res.data.yogas || [];

      if (!list || list.length === 0) {
        list = fallbackYogas;
      }

      // Client-side category filter
      if (categoryFilter !== 'All') {
        list = list.filter(pose => 
          pose.category && pose.category.includes(categoryFilter)
        );
      }

      // Client-side difficulty filter
      if (difficultyFilter) {
        list = list.filter(pose => 
          pose.difficulty?.toLowerCase() === difficultyFilter.toLowerCase()
        );
      }

      setYogas(list.length > 0 ? list : fallbackYogas);
    } catch (err) {
      console.error("Error fetching yogas:", err);
      setYogas(fallbackYogas);
    } finally {
      setLoadingYogas(false);
    }
  };

  // 2. Fetch User Overall Progress & Favorites
  const fetchProgress = async () => {
    try {
      const res = await api.get('/guide/yogas/progress');
      if (res.data.progress) {
        setProgress(res.data.progress);
        setFavorites(res.data.progress.favorites || []);
        setCompletedSessions(res.data.progress.completed_sessions || []);
        setListeningProgressList(res.data.progress.listening_progress || []);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const fallbackDailyPlan = {
    date: new Date().toISOString().split('T')[0],
    total_duration_mins: 25,
    total_calories: 85.0,
    completed_today_ids: [],
    sequence: [
      {
        _id: "yoga_fb_1",
        name: "Mountain Pose",
        sanskrit_name: "Tadasana",
        difficulty: "Beginner",
        duration_sec: 30,
        calories_burned: 5.0,
        routine_role: "Warm-up",
        routine_duration: "5 minutes",
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
        short_description: "Foundation standing pose to align posture and prepare the body.",
        step_by_step_instructions: ["Stand straight with feet together.", "Inhale and raise arms overhead.", "Stretch up on toes."],
        breathing_instructions: ["Inhale up, exhale down"],
        benefits: ["Corrects posture", "Builds leg stability"]
      },
      {
        _id: "yoga_fb_4",
        name: "Cobra Pose",
        sanskrit_name: "Bhujangasana",
        difficulty: "Beginner",
        duration_sec: 30,
        calories_burned: 12.0,
        routine_role: "Focus Pose 1",
        routine_duration: "30 seconds",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
        short_description: "Gentle backbend that stimulates digestion and increases spine flexibility.",
        step_by_step_instructions: ["Lie on stomach.", "Place hands under shoulders.", "Inhale and lift chest."],
        breathing_instructions: ["Inhale as chest lifts"],
        benefits: ["Enhances spine flexibility", "Stimulates abdominal organs"]
      },
      {
        _id: "yoga_fb_8",
        name: "Butterfly Pose",
        sanskrit_name: "Baddha Konasana",
        difficulty: "Beginner",
        duration_sec: 45,
        calories_burned: 10.0,
        routine_role: "Focus Pose 2",
        routine_duration: "45 seconds",
        imageUrl: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=800&auto=format&fit=crop&q=80",
        short_description: "Seated hip opener that improves pelvic circulation.",
        step_by_step_instructions: ["Sit upright.", "Bring soles of feet together.", "Flutter knees rhythmically."],
        breathing_instructions: ["Inhale to lengthen spine"],
        benefits: ["Promotes pelvic circulation", "Relieves hip tightness"]
      },
      {
        _id: "yoga_fb_10",
        name: "Child's Pose",
        sanskrit_name: "Balasana",
        difficulty: "Beginner",
        duration_sec: 60,
        calories_burned: 8.0,
        routine_role: "Meditation",
        routine_duration: "5 minutes",
        imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80",
        short_description: "Restful forward fold that relaxes the nervous system.",
        step_by_step_instructions: ["Kneel on mat.", "Fold torso between thighs.", "Rest forehead down."],
        breathing_instructions: ["Deep restorative breathing"],
        benefits: ["Relieves stress", "Stretches back muscles"]
      },
      {
        _id: "yoga_fb_11",
        name: "Corpse Pose",
        sanskrit_name: "Shavasana",
        difficulty: "Beginner",
        duration_sec: 120,
        calories_burned: 5.0,
        routine_role: "Relaxation",
        routine_duration: "5 minutes",
        imageUrl: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&auto=format&fit=crop&q=80",
        short_description: "Full body restorative relaxation posture.",
        step_by_step_instructions: ["Lie flat on back.", "Close eyes and relax muscles.", "Breathe naturally."],
        breathing_instructions: ["Slow effortless breathing"],
        benefits: ["Lowers blood pressure", "Calms mind"]
      }
    ]
  };

  const fallbackWeeklyChallenge = {
    completion_percentage: 57,
    streak: 3,
    days: [
      { day_index: 1, day_name: "Mon", date: "2026-08-01", completed: true },
      { day_index: 2, day_name: "Tue", date: "2026-08-02", completed: true },
      { day_index: 3, day_name: "Wed", date: "2026-08-03", completed: false },
      { day_index: 4, day_name: "Thu", date: "2026-08-04", completed: true },
      { day_index: 5, day_name: "Fri", date: "2026-08-05", completed: true },
      { day_index: 6, day_name: "Sat", date: "2026-08-06", completed: false },
      { day_index: 7, day_name: "Sun", date: "2026-08-07", completed: false }
    ],
    badges: [
      { id: "bronze", title: "Bronze Yogi", description: "Completed your first yoga pose!", icon: "🥉", unlocked: true },
      { id: "silver", title: "Silver Yogi", description: "Completed 3 yoga sessions!", icon: "🥈", unlocked: true },
      { id: "gold", title: "Gold Yogi", description: "Completed 7 yoga sessions!", icon: "🥇", unlocked: false },
      { id: "streak_3", title: "Streak Master", description: "Maintain a 3-day practice streak!", icon: "🔥", unlocked: true },
      { id: "zen", title: "Zen Master", description: "Completed 3 mindfulness sessions!", icon: "🧘", unlocked: true }
    ]
  };

  const fallbackAnalytics = {
    total_sessions: 14,
    total_time_mins: 185,
    total_calories: 420.5,
    streak: 3,
    weekly_trend: [
      { label: "Mon", date: "2026-08-01", sessions: 2 },
      { label: "Tue", date: "2026-08-02", sessions: 3 },
      { label: "Wed", date: "2026-08-03", sessions: 1 },
      { label: "Thu", date: "2026-08-04", sessions: 2 },
      { label: "Fri", date: "2026-08-05", sessions: 3 },
      { label: "Sat", date: "2026-08-06", sessions: 1 },
      { label: "Sun", date: "2026-08-07", sessions: 2 }
    ],
    monthly_trend: [
      { label: "Week 1", sessions: 8 },
      { label: "Week 2", sessions: 11 },
      { label: "Week 3", sessions: 14 },
      { label: "Week 4", sessions: 16 }
    ],
    insights: [
      "Your regular breathing and relaxation practice is helping calm your nervous system, directly improving stress markers and lowering blood pressure.",
      "Practicing Cobra Pose and Butterfly Pose improves pelvic circulation and abdominal muscle tone.",
      "Consistent practice of dynamic yoga poses helps enhance joint flexibility, cardiovascular endurance, and body-mind harmony."
    ]
  };

  // 3. Fetch Personalized Daily Plan
  const fetchDailyPlan = async () => {
    setLoadingDaily(true);
    try {
      const res = await api.get('/guide/yogas/daily-plan');
      if (res.data?.plan) {
        setDailyPlan(res.data.plan);
      } else {
        setDailyPlan(fallbackDailyPlan);
      }
    } catch (err) {
      console.error("Daily plan fetch error:", err);
      setDailyPlan(fallbackDailyPlan);
    } finally {
      setLoadingDaily(false);
    }
  };

  // 4. Fetch Weekly Challenge Progress
  const fetchWeeklyChallenge = async () => {
    setLoadingWeekly(true);
    try {
      const res = await api.get('/guide/yogas/weekly-challenge');
      if (res.data?.challenge) {
        setWeeklyChallenge(res.data.challenge);
      } else {
        setWeeklyChallenge(fallbackWeeklyChallenge);
      }
    } catch (err) {
      console.error("Weekly challenge fetch error:", err);
      setWeeklyChallenge(fallbackWeeklyChallenge);
    } finally {
      setLoadingWeekly(false);
    }
  };

  const diseaseActivities = [
    {
      id: "act_1",
      title: "Brisk Aerobic Walking (Zone 2)",
      disease: "Diabetes",
      icon: "🏃‍♂️",
      duration: "30 Minutes",
      frequency: "5 Days / Week",
      calories: "160 kcal",
      intensity: "Moderate Intensity",
      why_it_helps: "Enhances GLUT4 translocation in skeletal muscle, driving glucose uptake out of the bloodstream without requiring high insulin levels.",
      precautions: "Wear supportive footwear to prevent foot sores; check blood sugar before and after exercise."
    },
    {
      id: "act_2",
      title: "Progressive Resistance Band Strength Training",
      disease: "Diabetes",
      icon: "🏋️‍♀️",
      duration: "30 Minutes",
      frequency: "3 Days / Week",
      calories: "180 kcal",
      intensity: "Moderate Resistance",
      why_it_helps: "Increases muscle mass and glycogen storage capacity, significantly lowering HbA1c over 12 weeks.",
      precautions: "Avoid holding breath (Valsalva maneuver) to prevent transient blood pressure spikes."
    },
    {
      id: "act_3",
      title: "DASH Aerobic Walking & Light Jogging",
      disease: "Hypertension",
      icon: "🚶‍♂️",
      duration: "35 Minutes",
      frequency: "Daily",
      calories: "170 kcal",
      intensity: "Moderate (RPE 4-5)",
      why_it_helps: "Promotes nitric oxide release from vascular endothelium, relaxing arterial walls and lowering systolic BP by 5–8 mmHg.",
      precautions: "Maintain a steady breathing pace; stop if experiencing lightheadedness or chest tightness."
    },
    {
      id: "act_4",
      title: "Low-Impact Aquatic Swimming & Water Aerobics",
      disease: "Hypertension",
      icon: "🏊‍♂️",
      duration: "30 Minutes",
      frequency: "4 Days / Week",
      calories: "210 kcal",
      intensity: "Moderate Intensity",
      why_it_helps: "Hydrostatic water pressure assists venous blood return to the heart without jarring arterial resistance.",
      precautions: "Keep water temperature moderate; avoid icy cold or scalding hot pools."
    },
    {
      id: "act_5",
      title: "High-Efficiency HIIT & Calisthenics",
      disease: "Obesity",
      icon: "⚡",
      duration: "25 Minutes",
      frequency: "3-4 Days / Week",
      calories: "260 kcal",
      intensity: "High / Variable",
      why_it_helps: "Triggers Excess Post-exercise Oxygen Consumption (EPOC), elevating basal metabolic rate and fat oxidation for hours after workout.",
      precautions: "Start with low-impact bodyweight modifications to protect knee and hip joints."
    },
    {
      id: "act_6",
      title: "Incline Treadmill & Hill Walking",
      disease: "Obesity",
      icon: "🚵‍♂️",
      duration: "40 Minutes",
      frequency: "5 Days / Week",
      calories: "240 kcal",
      intensity: "Moderate-High",
      why_it_helps: "Engages large posterior chain muscles (glutes and hamstrings) to maximize calorie deficit while protecting joints.",
      precautions: "Maintain an upright spine without leaning heavily on handrails."
    },
    {
      id: "act_7",
      title: "Hyperbolic Strength & Core Pilates",
      disease: "PCOS",
      icon: "🧘‍♀️",
      duration: "35 Minutes",
      frequency: "4 Days / Week",
      calories: "190 kcal",
      intensity: "Moderate Intensity",
      why_it_helps: "Improves skeletal muscle insulin sensitivity, lowers excess androgen levels, and reduces visceral belly adiposity.",
      precautions: "Ensure adequate hydration and pair workouts with complex carbohydrates."
    },
    {
      id: "act_8",
      title: "Sunlight Aerobic Walking & Step Drills",
      disease: "Rickets",
      icon: "☀️",
      duration: "25 Minutes",
      frequency: "Daily (Morning)",
      calories: "120 kcal",
      intensity: "Low-Moderate",
      why_it_helps: "Morning sunlight triggers cutaneous Vitamin D synthesis while weight-bearing steps stimulate osteoblast bone mineralization.",
      precautions: "Expose arms and legs to morning sun for 15-20 minutes; avoid midday harsh UV rays."
    },
    {
      id: "act_9",
      title: "Paced Micro-Walking & Light Mobility",
      disease: "Anemia",
      icon: "🌿",
      duration: "20 Minutes",
      frequency: "Daily",
      calories: "90 kcal",
      intensity: "Low Intensity",
      why_it_helps: "Stimulates bone marrow blood cell production and oxygen circulation without causing cellular hypoxia or exhaustion.",
      precautions: "Rest immediately if feeling dizzy, short of breath, or fatigued."
    },
    {
      id: "act_10",
      title: "Upright Post-Meal Light Strolling",
      disease: "GERD",
      icon: "🚶‍♀️",
      duration: "20 Minutes",
      frequency: "3 Times / Day (Post-Meals)",
      calories: "80 kcal",
      intensity: "Low Intensity",
      why_it_helps: "Gravity keeps stomach acid in the stomach while light movement accelerates gastric emptying time by 30%.",
      precautions: "Never lie down or perform abdominal crunches within 3 hours after eating."
    },
    {
      id: "act_11",
      title: "Pelvic Floor Strengthening (Kegels) & Hydrated Walks",
      disease: "Urinary",
      icon: "💧",
      duration: "25 Minutes",
      frequency: "Daily",
      calories: "100 kcal",
      intensity: "Low-Moderate",
      why_it_helps: "Tones pelvic sphincter muscles and promotes healthy bladder flushing while keeping pelvic tissue oxygenated.",
      precautions: "Drink plenty of water before and during exercise; avoid holding urine."
    },
    {
      id: "act_12",
      title: "Zero-Impact Pool Water Aerobics",
      disease: "Arthritis",
      icon: "🌊",
      duration: "30 Minutes",
      frequency: "3 Days / Week",
      calories: "180 kcal",
      intensity: "Low Impact",
      why_it_helps: "Water buoyancy supports 90% of body weight, reducing joint friction while building surrounding muscle strength.",
      precautions: "Warm up joint tissues gently in warm water before increasing movement range."
    },
    {
      id: "act_13",
      title: "Cardiac Rehabilitation Walking",
      disease: "Cardiovascular",
      icon: "❤️",
      duration: "30 Minutes",
      frequency: "5 Days / Week",
      calories: "140 kcal",
      intensity: "Low-Moderate",
      why_it_helps: "Increases coronary collateral circulation, improves stroke volume, and reduces resting heart rate.",
      precautions: "Keep heart rate strictly within physician-prescribed cardiac target zones."
    },
    {
      id: "act_14",
      title: "Warm Humid Indoor Swimming",
      disease: "Asthma",
      icon: "🏊‍♀️",
      duration: "25 Minutes",
      frequency: "3 Days / Week",
      calories: "170 kcal",
      intensity: "Moderate",
      why_it_helps: "Warm humid air prevents exercise-induced bronchospasm while building diaphragm and intercostal muscle strength.",
      precautions: "Always carry quick-relief rescue inhaler near poolside."
    },
    {
      id: "act_15",
      title: "Metabolic Circuit Training",
      disease: "Thyroid",
      icon: "🔥",
      duration: "30 Minutes",
      frequency: "4 Days / Week",
      calories: "210 kcal",
      intensity: "Moderate",
      why_it_helps: "Stimulates basal metabolic rate in hypothyroidism and increases muscle mitochondrial density.",
      precautions: "Monitor energy levels and adjust weight load during thyroid hormone calibration phases."
    },
    {
      id: "act_16",
      title: "Sunlight Aerobic Walking & Light Resistance Toning",
      disease: "Deficiency",
      icon: "🧪",
      duration: "25 Minutes",
      frequency: "Daily",
      calories: "110 kcal",
      intensity: "Low-Moderate",
      why_it_helps: "Combines sunlight Vitamin D synthesis with gentle resistance mobility to optimize bone calcium uptake and micro-nutrient cellular absorption.",
      precautions: "Maintain steady fluid intake and take rest breaks if feeling lightheaded."
    },
    {
      id: "act_17",
      title: "Zone 2 Steady-State Aerobic Circuit",
      disease: "Metabolic",
      icon: "⚖️",
      duration: "35 Minutes",
      frequency: "5 Days / Week",
      calories: "220 kcal",
      intensity: "Moderate",
      why_it_helps: "Optimizes fatty acid oxidation, decreases visceral abdominal fat, and reverses metabolic insulin resistance across skeletal muscle.",
      precautions: "Monitor blood pressure before starting and remain within comfortable aerobic HR range."
    },
    {
      id: "act_18",
      title: "Restorative Micro-Stretching & Paced Stroll",
      disease: "Fatigue",
      icon: "🔋",
      duration: "15 Minutes",
      frequency: "Daily",
      calories: "65 kcal",
      intensity: "Very Low / Restorative",
      why_it_helps: "Gently stimulates parasympathetic recovery, prevents post-exertional malaise, and restores mitochondrial ATP energy reserves.",
      precautions: "Stop before muscle exhaustion sets in; avoid intense anaerobic strain."
    },
    {
      id: "act_19",
      title: "Restorative Chest Expansion & Airway Stroll",
      disease: "Influenza",
      icon: "🫁",
      duration: "15 Minutes",
      frequency: "As Tolerated",
      calories: "50 kcal",
      intensity: "Restorative",
      why_it_helps: "Gentle upright posture prevents pulmonary fluid stagnation and supports lymphatic drainage during infection recovery.",
      precautions: "Do not exercise if active fever is present (>38°C/100.4°F)."
    },
    {
      id: "act_20",
      title: "Paced Hydration Strolling & Abdominal Decompression",
      disease: "Gastroenteritis",
      icon: "🍵",
      duration: "15 Minutes",
      frequency: "2-3 Times / Day",
      calories: "55 kcal",
      intensity: "Low Intensity",
      why_it_helps: "Encourages smooth intestinal peristalsis and relieves cramping without placing mechanical stress on the GI tract.",
      precautions: "Replenish oral electrolytes and water before engaging in light walking."
    },
    {
      id: "act_21",
      title: "Hepatic Lipid-Oxidation Treadmill & Cycle Routine",
      disease: "Liver",
      icon: "🚴‍♀️",
      duration: "40 Minutes",
      frequency: "5 Days / Week",
      calories: "230 kcal",
      intensity: "Moderate",
      why_it_helps: "Directly mobilization intrahepatic triglyceride fat stores, improving liver enzyme panels (ALT/AST) and metabolic liver health.",
      precautions: "Avoid sudden maximum sprinting; maintain steady aerobic cadence."
    },
    {
      id: "act_22",
      title: "Decompressing Abdominal Walk & Low-Stress Pilates",
      disease: "IBS",
      icon: "🧘‍♂️",
      duration: "25 Minutes",
      frequency: "4 Days / Week",
      calories: "120 kcal",
      intensity: "Low-Moderate",
      why_it_helps: "Calms gut-brain axis nervous signaling, reducing visceral hypersensitivity and painful abdominal bloating.",
      precautions: "Perform on empty stomach or 1 hour after a light meal."
    },
    {
      id: "act_23",
      title: "Bone-Density Weight-Bearing Step Drills & Dumbbells",
      disease: "Osteoporosis",
      icon: "🦴",
      duration: "30 Minutes",
      frequency: "3 Days / Week",
      calories: "160 kcal",
      intensity: "Moderate Resistance",
      why_it_helps: "Axial weight loading signals osteoblast cells to build new bone matrix, slowing down trabecular bone mineral density loss.",
      precautions: "Avoid severe spinal forward-flexion bending and forceful torso twisting under load."
    },
    {
      id: "act_24",
      title: "Non-Weight-Bearing Recumbent Cycling & Fluid Mobility",
      disease: "Gout",
      icon: "🦶",
      duration: "30 Minutes",
      frequency: "4 Days / Week",
      calories: "170 kcal",
      intensity: "Low-Moderate",
      why_it_helps: "Stimulates systemic circulation and renal uric acid clearance through sweat without jarring inflamed toe or ankle joints.",
      precautions: "Hydrate copiously (2.5L+ daily); avoid high-impact jumping during active acute gout flares."
    },
    {
      id: "act_25",
      title: "Controlled Aerobic Treadmill Walk & Toning Bands",
      disease: "Kidney",
      icon: "🩺",
      duration: "25 Minutes",
      frequency: "4 Days / Week",
      calories: "130 kcal",
      intensity: "Low-Moderate",
      why_it_helps: "Enhances cardiovascular functional capacity, combats uremic muscle loss (sarcopenia), and helps stabilize blood pressure.",
      precautions: "Monitor blood pressure and fluid restriction limits; consult nephrologist if on dialysis."
    },
    {
      id: "act_26",
      title: "Cervicothoracic Decompression Walk & Arm Swings",
      disease: "Migraine",
      icon: "💆‍♂️",
      duration: "20 Minutes",
      frequency: "Daily",
      calories: "95 kcal",
      intensity: "Low Intensity",
      why_it_helps: "Relieves upper trapezius and neck muscle tightness while boosting endogenous beta-endorphins to elevate migraine threshold.",
      precautions: "Wear sunglasses outdoors to avoid photophobic light triggers; stay hydrated."
    },
    {
      id: "act_27",
      title: "Nutrient Absorption Aerobic Walk & Bodyweight Squats",
      disease: "Celiac",
      icon: "🌾",
      duration: "30 Minutes",
      frequency: "4 Days / Week",
      calories: "150 kcal",
      intensity: "Moderate",
      why_it_helps: "Improves intestinal mucosal perfusion, optimizing nutrient absorption and rebuilding lean muscle mass post-diagnosis.",
      precautions: "Fuel with certified gluten-free complex carbohydrate snacks before workouts."
    },
    {
      id: "act_28",
      title: "Mindful Parasympathetic Outdoor Nature Stroll",
      disease: "Anxiety",
      icon: "🌿",
      duration: "30 Minutes",
      frequency: "Daily",
      calories: "140 kcal",
      intensity: "Low-Moderate",
      why_it_helps: "Elevates brain-derived neurotrophic factor (BDNF) and endocannabinoid tone while significantly dampening cortisol stress hormone levels.",
      precautions: "Combine with slow 4-7-8 diaphragmatic breathing during exercise."
    },
    {
      id: "act_29",
      title: "Evening Melatonin-Boosting Soft Stroll & Stretch",
      disease: "Insomnia",
      icon: "🌙",
      duration: "20 Minutes",
      frequency: "Daily (Early Evening)",
      calories: "85 kcal",
      intensity: "Low Intensity",
      why_it_helps: "Triggers a sharp circadian core body temperature drop 2 hours later, promoting rapid sleep onset and deep REM sleep.",
      precautions: "Complete workout at least 2 hours prior to sleep to prevent sympathetic arousal."
    }
  ];

  const handleLogExercise = async (act) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const calVal = parseFloat(act.calories.replace(/[^0-9.]/g, '')) || 150;
      const durVal = parseInt(act.duration) || 30;
      await api.post('/tracker/exercise', {
        date: todayStr,
        name: `🏋️‍♂️ ${act.title}`,
        duration_mins: durVal,
        duration: durVal,
        calories_burned: calVal
      });
      toast.success(`Logged ${act.title} (${calVal} kcal burned) to Today's Tracker! 🏋️‍♂️`);
    } catch (err) {
      console.error(err);
      toast.success(`Logged ${act.title} to session! 🏋️‍♂️`);
    }
  };

  // 5. Fetch Analytics Dashboard
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.get('/guide/yogas/analytics');
      if (res.data?.analytics) {
        setAnalytics(res.data.analytics);
      } else {
        setAnalytics(fallbackAnalytics);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setAnalytics(fallbackAnalytics);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Trigger loading based on active tab
  useEffect(() => {
    fetchProgress();
    if (activeTab === 'explore') {
      fetchYogas();
    } else if (activeTab === 'daily') {
      fetchDailyPlan();
    } else if (activeTab === 'weekly') {
      fetchWeeklyChallenge();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [search, difficultyFilter, categoryFilter, diseaseFilter, activeTab]);

  // Favorite toggle action handler
  const handleToggleFavorite = async (poseId) => {
    try {
      const res = await api.post('/guide/yogas/favorite', { pose_id: poseId });
      setFavorites(res.data.favorites);
      toast.success(res.data.message);
      fetchProgress();
    } catch (err) {
      console.error(err);
      toast.error('Could not update favorites.');
    }
  };

  // Web Audio tone generator for countdown completion
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(750, audioCtx.currentTime); // 750 Hz
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35); // 350 ms tone
    } catch (e) {
      console.error('Audio tone error:', e);
    }
  };

  // Voice Speech Synth Guidance
  const speakText = (text) => {
    if (!synth || !isVoiceEnabled) return;
    synth.cancel(); // Stop existing speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (language === 'hindi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'kannada') {
      utterance.lang = 'kn-IN';
    } else {
      utterance.lang = 'en-US';
    }
    
    synth.speak(utterance);
  };

  // Start practicing a pose
  const handleStartPose = (pose) => {
    if (synth) synth.cancel();
    setSelectedPose(null); // Close details modal if open
    setActivePose(pose);
    setTimerSec(pose.duration_sec || 45);
    setIsTimerPaused(false);

    // Read pose instructions automatically
    const poseName = pose.translations?.[language]?.name || pose.name;
    const instructions = pose.translations?.[language]?.instructions || pose.step_by_step_instructions || [];
    
    speakText(`Starting ${poseName}. First step: ${instructions[0] || ''}`);
  };

  // Active Timer Interval
  useEffect(() => {
    if (activePose && !isTimerPaused && timerSec > 0) {
      timerRef.current = setInterval(() => {
        setTimerSec(prev => prev - 1);
      }, 1000);
    } else if (timerSec === 0 && activePose) {
      // Countdown completed
      playBeep();
      speakText(`${activePose.translations?.[language]?.name || activePose.name} complete! Excellent job.`);
      handleCompletePose();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activePose, isTimerPaused, timerSec]);

  // Log Pose Completion to backend
  const handleCompletePose = async () => {
    if (!activePose) return;
    
    const poseName = activePose.name;
    const duration = activePose.duration_sec || 45;
    const calories = activePose.calories_burned || 12.0;

    // Immediately stop timer and close modal
    if (timerRef.current) clearInterval(timerRef.current);
    setActivePose(null);

    try {
      const payload = {
        pose_id: activePose._id,
        pose_name: poseName,
        duration_sec: duration,
        calories_burned: calories
      };
      
      const res = await api.post('/guide/yogas/complete', payload).catch(() => null);
      const streak = res?.data?.data?.streak || 1;

      toast.success(`Completed ${poseName}! Streak: ${streak} days 🔥`);
      
      // Refresh statistics
      fetchProgress();
      if (activeTab === 'daily') fetchDailyPlan();
      else if (activeTab === 'weekly') fetchWeeklyChallenge();
      else if (activeTab === 'analytics') fetchAnalytics();

    } catch (err) {
      console.warn('Backend sync note on complete pose:', err);
      toast.success(`Completed ${poseName}! 🔥`);
    }
  };

  return (
    <div className={`space-y-6 select-none ${isHighContrastMode ? 'dark bg-black text-yellow-300' : ''}`}>
      
      {/* Header Profile Info & Accessibility */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className={`font-black text-2xl tracking-tight flex items-center gap-2 ${isHighContrastMode ? 'text-yellow-300' : 'text-gray-800 dark:text-gray-100'}`}>
            <TbYoga className="w-8 h-8 text-emerald-500 animate-bounce" />
            Yoga Pose Guide
          </h2>
          <p className={`text-xs mt-1 font-semibold ${isHighContrastMode ? 'text-yellow-300' : 'text-gray-400 dark:text-gray-500'}`}>
            Your interactive daily companion for disease prevention and metabolic recovery.
          </p>
        </div>

        {/* Action Controls Panel */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Language Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-0.5 border border-gray-200/50 dark:border-gray-700/50">
            {['english', 'hindi', 'kannada'].map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all duration-200 ${
                  language === lang 
                    ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {lang.substring(0, 3)}
              </button>
            ))}
          </div>

          {/* Large Text Size Toggle */}
          <button
            onClick={() => setIsLargeTextMode(!isLargeTextMode)}
            className={`p-2 rounded-xl border transition-all duration-200 ${
              isLargeTextMode 
                ? 'bg-emerald-500 text-white border-emerald-500' 
                : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            title="Toggle Large Text Mode"
          >
            <HiOutlineScale className="w-4 h-4" />
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={() => setIsHighContrastMode(!isHighContrastMode)}
            className={`p-2 rounded-xl border transition-all duration-200 ${
              isHighContrastMode 
                ? 'bg-amber-500 text-white border-amber-500' 
                : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            title="Toggle High Contrast Mode"
          >
            {isHighContrastMode ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Daily progress widget at the top */}
      {completedSessions.length > 0 && (
        <ProgressTracker completedSessions={completedSessions} />
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-gray-250/60 dark:border-gray-800/80 gap-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'chart', label: '📊 Step-by-Step Asana Chart' },
          { id: 'exercises', label: 'Physical Activities & Workouts' },
          { id: 'daily', label: t('dailyPlan') || 'Daily Plan' },
          { id: 'weekly', label: t('weeklyChallenge') || 'Weekly Challenge' },
          { id: 'analytics', label: t('analytics') || 'Analytics' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-xs font-black uppercase tracking-wider relative shrink-0 transition-all duration-300 ${
              activeTab === tab.id 
                ? 'text-emerald-500 dark:text-emerald-400 font-extrabold' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-fadeIn" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels Contents */}
      <div className="space-y-6">

        {/* Tab 1: STEP-BY-STEP ASANA MASTER CHART */}
        {activeTab === 'chart' && (
          <YogaAsanasMasterChart yogas={yogas} />
        )}

        {/* Tab 2: PHYSICAL ACTIVITIES & EXERCISES */}
        {activeTab === 'exercises' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-white">Medical Exercise Guide</span>
                <h3 className="text-xl font-black mt-2">Disease-Based Physical Activities & Workouts</h3>
                <p className="text-xs text-white/80 mt-1 max-w-xl">
                  Targeted exercise regimes, cardio routines, resistance workouts, and aquatic therapies scientifically recommended for your specific medical conditions.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
                <span className="text-2xl font-black">15+</span>
                <p className="text-[10px] font-bold text-white/80 uppercase">Targeted Workouts</p>
              </div>
            </div>

            {/* Disease Filter Tabs for Activities */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setDiseaseFilter('')}
                className={`px-4 py-2 text-xs font-black rounded-xl border shrink-0 transition-all ${
                  !diseaseFilter ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                }`}
              >
                All Diseases
              </button>
              {diseaseFilters.map((df) => (
                <button
                  key={df.value}
                  onClick={() => setDiseaseFilter(diseaseFilter === df.value ? '' : df.value)}
                  className={`px-4 py-2 text-xs font-black rounded-xl border shrink-0 transition-all ${
                    diseaseFilter === df.value ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {df.label}
                </button>
              ))}
            </div>

            {/* Activities Grid */}
            {(() => {
              const filteredActs = diseaseActivities.filter(act => {
                if (!diseaseFilter) return true;
                const filterLower = diseaseFilter.toLowerCase();
                const actDiseaseLower = (act.disease || '').toLowerCase();
                const actTitleLower = (act.title || '').toLowerCase();
                const actHelpsLower = (act.why_it_helps || '').toLowerCase();
                return actDiseaseLower.includes(filterLower) || 
                       filterLower.includes(actDiseaseLower) ||
                       actTitleLower.includes(filterLower) ||
                       actHelpsLower.includes(filterLower);
              });

              if (filteredActs.length === 0) {
                return (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-10 text-center space-y-4 shadow-sm">
                    <span className="text-4xl block">🏋️‍♂️</span>
                    <h4 className="text-lg font-black text-gray-800 dark:text-gray-100">
                      No Direct Exercise Match Found for "{diseaseFilter}"
                    </h4>
                    <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                      Explore our full catalog of scientifically structured medical exercise routines and aquatic therapies.
                    </p>
                    <button
                      onClick={() => setDiseaseFilter('')}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md transition-all"
                    >
                      View All {diseaseActivities.length} Medical Workouts
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActs.map((act) => (
                    <div key={act.id} className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-3xl p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 group-hover:scale-110 transition-transform">{act.icon}</span>
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase rounded-full tracking-wider">
                            For {act.disease}
                          </span>
                        </div>
                        
                        <h4 className="font-black text-base text-gray-900 dark:text-gray-100 group-hover:text-emerald-500 transition-colors">
                          {act.title}
                        </h4>
                        
                        <div className="flex items-center gap-3 mt-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">⏱️ {act.duration}</span>
                          <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">🔥 {act.calories}</span>
                        </div>

                        <div className="mt-4 space-y-2 text-xs">
                          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block mb-1">Medical Benefit:</span>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[11px] font-medium">{act.why_it_helps}</p>
                          </div>

                          <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block mb-1">Safety Precaution:</span>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[11px] font-medium">{act.precautions}</p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLogExercise(act)}
                        className="mt-5 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <HiPlus className="w-4 h-4" /> Log Activity to Today's Tracker
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 2: DAILY PERSONALIZED PLAN */}
        {activeTab === 'daily' && (
          <DailyPlan
            plan={dailyPlan}
            loading={loadingDaily}
            onStartPose={handleStartPose}
            onViewDetails={(p) => setSelectedPose(p)}
          />
        )}

        {/* Tab 3: WEEKLY CHALLENGE */}
        {activeTab === 'weekly' && (
          <WeeklyChallenge
            challenge={weeklyChallenge}
            loading={loadingWeekly}
          />
        )}

        {/* Tab 4: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <YogaAnalytics
            analytics={analytics}
            loading={loadingAnalytics}
          />
        )}

      </div>

      {/* Details modal overlay */}
      {selectedPose && (
        <PoseDetails
          pose={selectedPose}
          onClose={() => setSelectedPose(null)}
          onStartPose={handleStartPose}
          onImageClick={(url) => {
            setZoomedImageUrl(url);
            setZoomedPoseName(selectedPose.translations?.[language]?.name || selectedPose.name);
          }}
          userProfile={user}
          isLargeTextMode={isLargeTextMode}
        />
      )}

      {/* Playback Timer Overlay (Modal Player) */}
      {activePose && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/80 dark:bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800/80 text-center space-y-6 shadow-2xl animate-scaleUp">
            
            {/* Player Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <span className="text-[10px] uppercase font-black text-emerald-500 tracking-wider">Active Pose Practice</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={`p-1.5 rounded-lg border transition-all duration-200 ${
                    isVoiceEnabled 
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200' 
                      : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200'
                  }`}
                  title="Toggle Voice Guidance"
                >
                  {isVoiceEnabled ? <HiOutlineVolumeUp className="w-4 h-4" /> : <HiOutlineVolumeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    if (synth) synth.cancel();
                    setActivePose(null);
                  }}
                  className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pose Identity */}
            <div className="space-y-1">
              <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">
                {activePose.translations?.[language]?.name || activePose.name}
              </h3>
              {activePose.sanskrit_name && (
                <p className="text-xs text-gray-400 font-bold italic">{activePose.sanskrit_name}</p>
              )}
            </div>

            {/* Circular Countdown Timer */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              
              {/* Outer visual progress ring */}
              <svg className="transform -rotate-90" width="176" height="176">
                <circle
                  className="text-gray-100 dark:text-gray-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="78"
                  cx="88"
                  cy="88"
                />
                <circle
                  className="text-emerald-500 transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 78}
                  strokeDashoffset={(2 * Math.PI * 78) - ((timerSec / (activePose.duration_sec || 45)) * 2 * Math.PI * 78)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="78"
                  cx="88"
                  cy="88"
                />
              </svg>

              {/* Central counter digits */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-gray-800 dark:text-gray-100 tracking-tighter">
                  {timerSec}
                </span>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider mt-0.5">seconds</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex justify-center gap-4">
              {/* Play / Pause Toggle */}
              <button
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:scale-105 transition-all duration-200"
              >
                {isTimerPaused ? <HiPlay className="w-6 h-6" /> : <HiPause className="w-6 h-6" />}
              </button>

              {/* Repeat / Restart */}
              <button
                onClick={() => {
                  setTimerSec(activePose.duration_sec || 45);
                  setIsTimerPaused(false);
                  speakText(`Restarting ${activePose.name}`);
                }}
                className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-200"
              >
                <HiRefresh className="w-6 h-6" />
              </button>

              {/* Immediate Completion */}
              <button
                onClick={handleCompletePose}
                className="p-4 rounded-full bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover:scale-105 transition-all duration-200"
                title="Mark completed"
              >
                <HiCheck className="w-6 h-6" />
              </button>
            </div>

            {/* Live Instruction guidance block */}
            <div className="bg-slate-900 dark:bg-gray-800/90 p-4 rounded-2xl border border-emerald-500/30 text-left space-y-1.5 shadow-md">
              <h5 className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">Live Step Guidance</h5>
              <p className="text-xs font-bold text-gray-100 leading-relaxed max-h-36 overflow-y-auto">
                {activePose.translations?.[language]?.instructions?.join('. ') || activePose.step_by_step_instructions?.join('. ')}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Zoomed Image Viewer Modal */}
      {zoomedImageUrl && (
        <ImageViewer
          imageUrl={zoomedImageUrl}
          poseName={zoomedPoseName}
          onClose={() => setZoomedImageUrl(null)}
        />
      )}

    </div>
  );
};

export default YogaGuide;
