import React, { useState, useEffect, useRef } from 'react';
import { 
  HiOutlinePrinter, HiOutlineSearch, HiOutlineSparkles, 
  HiOutlineClock, HiOutlineHeart, HiOutlineCheckCircle, 
  HiOutlineExclamation, HiOutlineFilter, HiOutlineInformationCircle,
  HiOutlineBookOpen, HiChevronLeft, HiChevronRight,
  HiPlay, HiPause, HiVolumeUp, HiVolumeOff, HiRefresh,
  HiOutlineViewList, HiOutlineViewGrid
} from 'react-icons/hi';
import { TbYoga } from 'react-icons/tb';

export const YogaAsanasMasterChart = ({ yogas = [] }) => {
  const [chartSearch, setChartSearch] = useState('');
  const [chartCategory, setChartCategory] = useState('All');
  
  // View mode: 'one-by-one' (One-by-One Stepper) vs 'all-grid' (All-in-One Grid)
  const [viewMode, setViewMode] = useState('one-by-one');
  
  // Selected pose index for Master One-by-One Stepper view
  const [selectedPoseIdx, setSelectedPoseIdx] = useState(0);
  
  // Per-pose active step map for card-level one-by-one stepping { [asanaId]: stepIndex }
  const [poseStepIndices, setPoseStepIndices] = useState({});
  
  // Per-pose display mode map { [asanaId]: 'stepper' | 'all' }
  const [poseViewModes, setPoseViewModes] = useState({});

  // Audio / Slideshow state for active step in Master Stepper
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const slideshowTimerRef = useRef(null);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  // Master Asanas catalog with built-in detailed step-by-step instructions
  const defaultAsanasCatalog = [
    {
      id: "chart-1",
      name: "Surya Namaskar",
      sanskrit: "Sun Salutation",
      category: ["Weight Loss", "Beginner Yoga"],
      difficulty: "Intermediate",
      duration: "3 - 5 Rounds (12 Poses)",
      breathing: "Rhythmic Synchronized Inhalation & Exhalation",
      benefits: ["Full-body calorie burn & weight loss", "Boosts cardiovascular stamina", "Improves spinal flexibility & joint posture"],
      diseases: ["Obesity / Weight Loss", "Diabetes", "Chronic Fatigue", "Metabolic Syndrome"],
      steps: [
        "Stand at front edge of mat in Pranamasana (Prayer Pose) with feet together and palms at chest.",
        "Inhale, raise arms up and arch back slightly in Hastauttanasana.",
        "Exhale, bend forward from hips touching palms to floor in Padahastasana.",
        "Inhale, step right leg back into Ashwa Sanchalanasana (Equestrian Pose) looking up.",
        "Exhale to Plank pose (Dandasana), lower into Ashtanga Namaskar, Cobra pose, then Downward Dog."
      ],
      caution: "Avoid rapid movement if suffering from severe cardiac issues or high blood pressure.",
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-2",
      name: "Tadasana",
      sanskrit: "Mountain Pose",
      category: ["Beginner Yoga"],
      difficulty: "Beginner",
      duration: "30 - 60 Seconds",
      breathing: "Deep Steady Diaphragmatic Inhalation",
      benefits: ["Corrects postural alignment", "Strengthens thighs, knees, and ankles", "Calms nervous system"],
      diseases: ["Hypertension", "Anxiety & Depression", "Postural Fatigue", "Rickets"],
      steps: [
        "Stand tall with feet together or hip-width apart, distributing weight evenly on both feet.",
        "Engage your thigh muscles, lift kneecaps, and tuck pelvis in neutral alignment.",
        "Interlock fingers and roll shoulders back, extending arms upward toward the ceiling.",
        "Lift onto toes for full elongation (optional) and hold steady focus for 5 deep breaths."
      ],
      caution: "Avoid standing on toes if experiencing acute dizziness or insomnia.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-3",
      name: "Vrikshasana",
      sanskrit: "Tree Pose",
      category: ["Beginner Yoga"],
      difficulty: "Beginner",
      duration: "45 Seconds per leg",
      breathing: "Inhale when extending, steady breathing while holding",
      benefits: ["Improves neuromuscular balance & concentration", "Tones leg muscles", "Strengthens hip abductors"],
      diseases: ["Anxiety & Depression", "Thyroid", "Joint Stiffness", "PCOS / PCOD"],
      steps: [
        "Stand in Tadasana, shift body weight to left foot.",
        "Bend right knee and place sole of right foot firmly against inner left thigh (avoid knee joint).",
        "Join palms in Anjali Mudra at chest center or raise hands above head.",
        "Fix gaze (Drishti) at an eye-level point; hold for 45s then switch legs."
      ],
      caution: "Place foot lower on inner calf if balance is unsteady.",
      image: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-4",
      name: "Bhujangasana",
      sanskrit: "Cobra Pose",
      category: ["Back Pain", "Beginner Yoga"],
      difficulty: "Beginner",
      duration: "30 - 45 Seconds",
      breathing: "Inhale on cobra lift, Exhale while releasing down",
      benefits: ["Relieves lower back stiffness & sciatica", "Expands chest & lungs for deep respiration", "Tones abdominal viscera"],
      diseases: ["Back Pain / Lumbar", "Asthma & COPD", "Digestive Health", "Thyroid", "PCOS / PCOD", "Diabetes"],
      steps: [
        "Lie flat on stomach with forehead on mat and tops of feet flat on floor.",
        "Place palms on floor under shoulders, elbows close to ribs.",
        "Inhale slowly, press palms down, and gently lift chest up to navel level.",
        "Keep shoulders relaxed away from ears; hold for 30 seconds before exhaling down."
      ],
      caution: "Avoid during 2nd/3rd trimester pregnancy or recent abdominal surgery.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-5",
      name: "Paschimottanasana",
      sanskrit: "Seated Forward Bend",
      category: ["Diabetes", "Intermediate"],
      difficulty: "Intermediate",
      duration: "60 Seconds",
      breathing: "Inhale raise spine, Exhale hinge forward from hips",
      benefits: ["Stimulates pancreatic insulin production", "Stretches hamstrings and spine", "Soothes adrenal stress"],
      diseases: ["Diabetes", "PCOS / PCOD", "Hypertension", "Chronic Insomnia", "Digestive Health"],
      steps: [
        "Sit straight with legs extended in front and feet flexed.",
        "Inhale, raise arms overhead lengthen upper spine.",
        "Exhale, hinge forward from hip joints keeping spine long to grasp shins, ankles, or feet.",
        "Rest forehead toward knees without straining; hold with deep belly breathing."
      ],
      caution: "Do not round back forcefully if suffering from lumbar disc slip.",
      image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-6",
      name: "Balasana",
      sanskrit: "Child's Pose",
      category: ["Beginner Yoga"],
      difficulty: "Beginner",
      duration: "1 - 3 Minutes",
      breathing: "Slow abdominal relaxing breath",
      benefits: ["Instantly relieves pelvic and menstrual cramps", "Calms parasympathetic system", "Gently stretches hips & back"],
      diseases: ["PCOS / Period Cramps", "PCOS / PCOD", "Anxiety & Stress", "Migraine", "Fatigue"],
      steps: [
        "Kneel on mat, sit back on heels with big toes touching and knees hip-width apart.",
        "Exhale, lower torso between thighs and extend forehead flat to mat.",
        "Stretch arms forward with palms down or relax arms along torso.",
        "Breathe deeply into lower back, holding for 1 to 3 minutes of restful release."
      ],
      caution: "Place bolster under torso if knee joint is stiff.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-7",
      name: "Setu Bandhasana",
      sanskrit: "Bridge Pose",
      category: ["PCOS", "Intermediate"],
      difficulty: "Intermediate",
      duration: "45 Seconds",
      breathing: "Inhale lift hips up, Exhale lower down",
      benefits: ["Stimulates thyroid & pituitary endocrine glands", "Strengthens glutes and lumbar spine", "Opens chest"],
      diseases: ["PCOS / PCOD", "Thyroid", "Hypertension", "Osteoporosis", "Back Pain"],
      steps: [
        "Lie on back with knees bent, feet flat on mat hip-width apart, arms by sides.",
        "Exhale, press feet and arms into floor, lifting hips up toward ceiling.",
        "Interlace fingers under lower back and roll shoulders beneath torso.",
        "Keep thighs parallel; hold for 45s engaging glutes, then lower slowly vertebrae by vertebrae."
      ],
      caution: "Avoid pulling chin to chest if experiencing neck injury.",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-8",
      name: "Dhanurasana",
      sanskrit: "Bow Pose",
      category: ["Diabetes", "Intermediate"],
      difficulty: "Intermediate",
      duration: "30 Seconds",
      breathing: "Inhale lift into bow, Steady breath while holding",
      benefits: ["Massage abdominal organs (liver, pancreas, kidneys)", "Strengthens entire posterior chain", "Improves posture"],
      diseases: ["Diabetes", "Obesity", "GERD & Digestion", "Fatty Liver", "PCOS / PCOD"],
      steps: [
        "Lie flat on abdomen with forehead down and feet hip-width apart.",
        "Bend knees upward and reach back to grasp outside of ankles.",
        "Inhale deeply, pull ankles back while lifting thighs and chest off the floor into bow arch.",
        "Keep gaze forward; balance on lower abdomen for 30s before releasing."
      ],
      caution: "Avoid in cases of hernia, high blood pressure, or stomach ulcer.",
      image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-9",
      name: "Baddha Konasana",
      sanskrit: "Butterfly Pose",
      category: ["PCOS", "Beginner Yoga"],
      difficulty: "Beginner",
      duration: "45 - 60 Seconds",
      breathing: "Inhale deeply to lengthen spine, rhythmic breathing",
      benefits: ["Increases pelvic circulation & regulates ovarian blood flow", "Relieves menstrual cramps & hip stiffness", "Tones groin and thighs"],
      diseases: ["PCOS / PCOD", "Women's Health", "IBS & Digestion", "UTI (Urinary)"],
      steps: [
        "Sit tall with spine erect and legs extended straight.",
        "Bend knees and draw soles of feet together close to groin.",
        "Grasp feet gently with hands, lengthen spine, and flutter knees rhythmically up and down.",
        "Maintain deep pelvic breathing for 45 to 60 seconds."
      ],
      caution: "Place cushions under outer thighs if knees strain.",
      image: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-10",
      name: "Supta Baddha Konasana",
      sanskrit: "Reclined Butterfly Pose",
      category: ["PCOS", "Beginner Yoga"],
      difficulty: "Beginner",
      duration: "2 - 5 Minutes",
      breathing: "Restorative deep abdominal breathing",
      benefits: ["Soothes nervous system & lowers cortisol", "Relieves ovarian tension & pelvic pain", "Improves sleep quality"],
      diseases: ["PCOS / PCOD", "Anxiety & Depression", "Chronic Insomnia", "Women's Health"],
      steps: [
        "Lie flat on back on mat with arms at sides.",
        "Bend knees and bring soles of feet together, letting knees drop open sideways.",
        "Place one hand on abdomen and one hand on chest center.",
        "Breathe deeply into pelvis for 2 to 5 minutes of total restorative calm."
      ],
      caution: "Support knees with pillows if groin feels stretched.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-11",
      name: "Ardha Matsyendrasana",
      sanskrit: "Half Lord of the Fishes Twist",
      category: ["Diabetes", "Intermediate"],
      difficulty: "Intermediate",
      duration: "30 Seconds per side",
      breathing: "Inhale lengthen spine, Exhale twist torso",
      benefits: ["Massages pancreas, liver & kidneys for insulin regulation", "Detoxifies digestive tract", "Relieves spinal stiffness"],
      diseases: ["Diabetes", "PCOS / PCOD", "Fatty Liver", "IBS & Digestion", "Back Pain"],
      steps: [
        "Sit straight with legs extended.",
        "Bend right knee and place right foot on outside of left thigh.",
        "Inhale, extend left arm up; exhale twist torso right, hugging knee or pressing left elbow against knee.",
        "Gaze over right shoulder; hold for 30s then switch sides."
      ],
      caution: "Avoid aggressive spinal twisting during acute spinal injury.",
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-12",
      name: "Viparita Karani",
      sanskrit: "Legs-Up-The-Wall Pose",
      category: ["Beginner Yoga"],
      difficulty: "Beginner",
      duration: "3 - 5 Minutes",
      breathing: "Slow diaphragmatic relaxing breath",
      benefits: ["Promotes venous lymphatic drainage", "Lowers blood pressure & heart rate", "Relieves pelvic congestion"],
      diseases: ["Anxiety & Depression", "Chronic Insomnia", "Hypertension", "PCOS / PCOD", "Chronic Fatigue"],
      steps: [
        "Sit close to wall, swing legs up wall while rolling back flat on mat.",
        "Rest hips close to wall with legs resting vertically straight up.",
        "Extend arms out to sides with palms facing upward.",
        "Rest peacefully for 3 to 5 minutes focusing on deep breath."
      ],
      caution: "Avoid during heavy menstrual flow.",
      image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-13",
      name: "Sarvangasana",
      sanskrit: "Shoulder Stand",
      category: ["Thyroid", "Intermediate"],
      difficulty: "Intermediate",
      duration: "30 - 60 Seconds",
      breathing: "Steady chin-lock breathing",
      benefits: ["Directly stimulates thyroid gland hormone secretion", "Enhances brain blood circulation", "Boosts immune metabolism"],
      diseases: ["Thyroid", "Metabolic Syndrome", "Anemia", "Hypertension"],
      steps: [
        "Lie flat on back, inhale and lift legs and hips overhead.",
        "Support lower back with palms, elbows pressed firmly into mat.",
        "Extend legs vertically toward ceiling creating straight line posture.",
        "Hold for 30 to 60 seconds with steady focus before lowering slowly."
      ],
      caution: "Avoid if suffering from severe neck injury or glaucoma.",
      image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-14",
      name: "Ustrasana",
      sanskrit: "Camel Pose",
      category: ["Back Pain", "Intermediate"],
      difficulty: "Intermediate",
      duration: "30 Seconds",
      breathing: "Deep expanded chest inhalation",
      benefits: ["Opens thoracic cage & increases lung vital capacity", "Stimulates thyroid & abdominal organs", "Corrects rounded shoulders"],
      diseases: ["Back Pain / Lumbar", "Thyroid", "Asthma & COPD", "PCOS / PCOD"],
      steps: [
        "Kneel on mat with knees hip-width apart and hands on hips.",
        "Inhale, arch spine backward, reaching hands down to grasp heels.",
        "Push pelvis forward and open chest toward ceiling.",
        "Hold for 30 seconds breathing into chest before gently releasing."
      ],
      caution: "Do not strain neck excessively if prone to vertigo.",
      image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-15",
      name: "Mandukasana",
      sanskrit: "Frog Pose",
      category: ["Diabetes", "Intermediate"],
      difficulty: "Intermediate",
      duration: "45 Seconds",
      breathing: "Exhale on fold, steady breathing",
      benefits: ["Activates beta-cells of pancreas for natural insulin", "Burns abdominal visceral fat", "Relieves indigestion"],
      diseases: ["Diabetes", "Obesity / Weight Loss", "IBS & Digestion", "Fatty Liver"],
      steps: [
        "Sit in Vajrasana. Make fists with thumbs inside and place beside navel.",
        "Exhale, pull abdomen in and bend forward pressing fists into stomach.",
        "Keep head and chest lifted slightly while pressing abdomen.",
        "Hold for 45 seconds with calm focus."
      ],
      caution: "Avoid in severe peptic ulcer or cardiac weakness.",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-16",
      name: "Trikonasana",
      sanskrit: "Triangle Pose",
      category: ["Weight Loss", "Beginner Yoga"],
      difficulty: "Beginner",
      duration: "30 Seconds per side",
      breathing: "Exhale into lateral bend, steady breath",
      benefits: ["Stretches spine, hips, and hamstrings", "Tones waist & abdominal muscles", "Improves balance"],
      diseases: ["Obesity / Weight Loss", "Back Pain", "GERD & Digestion", "Osteoporosis"],
      steps: [
        "Stand wide with feet 3-4 feet apart. Turn right foot out 90 degrees.",
        "Inhale arms out parallel to floor. Exhale bend lateral to right touching right leg/floor.",
        "Extend left arm vertically, gaze up at left thumb.",
        "Hold 30s then repeat on left side."
      ],
      caution: "Keep torso aligned in flat plane without leaning forward.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-17",
      name: "Shavasana",
      sanskrit: "Corpse Pose",
      category: ["Beginner Yoga"],
      difficulty: "Beginner",
      duration: "3 - 5 Minutes",
      breathing: "Effortless diaphragmatic breath",
      benefits: ["Completely resets parasympathetic nervous system", "Lowers elevated blood pressure", "Relieves fatigue & headache"],
      diseases: ["Hypertension", "Anxiety & Depression", "Chronic Insomnia", "Chronic Fatigue", "Migraine"],
      steps: [
        "Lie flat on back with legs naturally apart and arms beside body, palms up.",
        "Close eyes and release conscious muscle contraction starting from feet to head.",
        "Breathe naturally and stay still for 3 to 5 minutes."
      ],
      caution: "Place small pillow under knees if lower back arches painfully.",
      image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-18",
      name: "Anjaneyasana",
      sanskrit: "Low Lunge Pose",
      category: ["Beginner Yoga"],
      difficulty: "Beginner",
      duration: "30 Seconds per leg",
      breathing: "Inhale reaching arms up",
      benefits: ["Stretches deep hip flexors (psoas) & quadriceps", "Relieves lower back tightness", "Improves pelvic alignment"],
      diseases: ["PCOS / PCOD", "Back Pain", "Kidney Disease (CKD)", "Joint Stiffness"],
      steps: [
        "From standing, step right foot back and lower right knee to mat.",
        "Bend left knee to 90 degrees directly over left ankle.",
        "Inhale, sweep arms overhead and sink hips forward gently.",
        "Hold for 30 seconds then switch legs."
      ],
      caution: "Use folded towel under knee for joint cushioning.",
      image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-19",
      name: "Malasana",
      sanskrit: "Garland / Deep Squat Pose",
      category: ["Beginner Yoga"],
      difficulty: "Beginner",
      duration: "45 - 60 Seconds",
      breathing: "Deep grounded abdominal breath",
      benefits: ["Stimulates colon & intestinal transit", "Strengthens pelvic floor & ankles", "Opens tight hips"],
      diseases: ["PCOS / PCOD", "IBS & Digestion", "Constipation", "Joint Stiffness", "Kidney Disease (CKD)"],
      steps: [
        "Squat with feet slightly wider than hip-width apart, toes turned outward.",
        "Bring palms together at chest in prayer position.",
        "Press elbows gently outward against inner knees to open hips.",
        "Keep chest open and spine long; hold for 45 to 60 seconds."
      ],
      caution: "Sit on yoga block if heel contact is uncomfortable.",
      image: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=500&q=80"
    },
    {
      id: "chart-20",
      name: "Pavanmuktasana",
      sanskrit: "Wind-Relieving Pose",
      category: ["Beginner Yoga"],
      difficulty: "Beginner",
      duration: "45 Seconds",
      breathing: "Exhale pulling knees to chest",
      benefits: ["Relieves trapped intestinal gas & constipation", "Massages abdominal viscera", "Relieves lower back pressure"],
      diseases: ["IBS & Digestion", "GERD & Digestion", "PCOS / PCOD", "Back Pain / Lumbar"],
      steps: [
        "Lie on back with legs straight.",
        "Exhale, bend right knee to chest, interlock fingers around knee and pull in close.",
        "Lift head touching nose to knee if comfortable.",
        "Hold 30s, repeat with left leg, then both legs together."
      ],
      caution: "Avoid lifting head if experiencing neck sprain.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80"
    }
  ];

  // Merge backend yogas if present with enriched steps
  const asanasList = (yogas && yogas.length > 0) ? yogas.map((y, idx) => ({
    id: y._id || y.id || `y-${idx}`,
    name: y.name || y.title,
    sanskrit: y.sanskrit_name || y.sanskritName || "Yoga Asana",
    category: y.category || "General Health",
    difficulty: y.difficulty || "Beginner",
    duration: y.duration || "45 Seconds",
    breathing: y.breathing_technique || y.breathing || "Rhythmic Breathing",
    benefits: Array.isArray(y.benefits) ? y.benefits : [y.description || "Promotes overall vitality"],
    diseases: Array.isArray(y.disease_matches) ? y.disease_matches : (Array.isArray(y.tags) ? y.tags : ["General Wellness"]),
    steps: (Array.isArray(y.steps) && y.steps.length > 0 ? y.steps : (
      Array.isArray(y.step_by_step_instructions) && y.step_by_step_instructions.length > 0
        ? y.step_by_step_instructions
        : [
            "Establish baseline alignment in neutral starting posture.",
            "Inhale deeply, engaging target muscle group.",
            "Hold peak pose for recommended duration while maintaining steady breath.",
            "Exhale slowly and return to starting posture."
          ]
    )).map(st => typeof st === 'string' ? st.replace(/^Step \d+:\s*/i, '') : st),
    caution: y.contraindications || y.caution || "Listen to your body and avoid forcing poses beyond comfortable range.",
    image: y.image_url || y.imageUrl || y.image || defaultAsanasCatalog[idx % defaultAsanasCatalog.length].image
  })) : defaultAsanasCatalog;

  // Filter List
  const filteredAsanas = asanasList.filter(item => {
    const sLower = chartSearch.toLowerCase();
    const matchSearch = !chartSearch || (
      item.name.toLowerCase().includes(sLower) ||
      item.sanskrit.toLowerCase().includes(sLower) ||
      (typeof item.category === 'string' && item.category.toLowerCase().includes(sLower)) ||
      (Array.isArray(item.category) && item.category.some(c => c.toLowerCase().includes(sLower))) ||
      item.diseases.some(d => d.toLowerCase().includes(sLower)) ||
      item.benefits.some(b => b.toLowerCase().includes(sLower))
    );
    
    const catLower = chartCategory.toLowerCase();
    const matchCat = chartCategory === 'All' || 
      (typeof item.category === 'string' && item.category.toLowerCase().includes(catLower)) ||
      (Array.isArray(item.category) && item.category.some(c => c.toLowerCase().includes(catLower))) ||
      item.difficulty.toLowerCase() === catLower ||
      item.diseases.some(d => d.toLowerCase().includes(catLower));

    return matchSearch && matchCat;
  });

  // Ensure valid selected pose index
  const safeSelectedIdx = selectedPoseIdx >= filteredAsanas.length ? 0 : selectedPoseIdx;
  const currentMasterPose = filteredAsanas[safeSelectedIdx] || filteredAsanas[0];

  // Current step index for master selected pose
  const masterPoseStepIdx = poseStepIndices[currentMasterPose?.id] || 0;
  const totalMasterSteps = currentMasterPose?.steps?.length || 1;
  const currentStepText = currentMasterPose?.steps?.[masterPoseStepIdx] || currentMasterPose?.steps?.[0] || "";

  // Speak current step aloud
  const speakStepText = (text, stepNum) => {
    if (!synth || !isVoiceEnabled) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(`Step ${stepNum}: ${text}`);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    synth.speak(utterance);
  };

  // Trigger speech when step changes in one-by-one mode
  useEffect(() => {
    if (viewMode === 'one-by-one' && currentStepText && isVoiceEnabled) {
      speakStepText(currentStepText, masterPoseStepIdx + 1);
    }
  }, [masterPoseStepIdx, currentMasterPose?.id, viewMode]);

  // Slideshow timer effect
  useEffect(() => {
    if (isPlayingSlideshow) {
      slideshowTimerRef.current = setInterval(() => {
        setPoseStepIndices(prev => {
          const currentIdx = prev[currentMasterPose?.id] || 0;
          const maxSteps = currentMasterPose?.steps?.length || 1;
          if (currentIdx < maxSteps - 1) {
            return { ...prev, [currentMasterPose?.id]: currentIdx + 1 };
          } else {
            setIsPlayingSlideshow(false);
            return prev;
          }
        });
      }, 7000);
    } else {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    }
    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [isPlayingSlideshow, currentMasterPose?.id, currentMasterPose?.steps?.length]);

  const handlePrintChart = () => {
    window.print();
  };

  const handleNextMasterStep = () => {
    if (masterPoseStepIdx < totalMasterSteps - 1) {
      setPoseStepIndices(prev => ({
        ...prev,
        [currentMasterPose.id]: masterPoseStepIdx + 1
      }));
    }
  };

  const handlePrevMasterStep = () => {
    if (masterPoseStepIdx > 0) {
      setPoseStepIndices(prev => ({
        ...prev,
        [currentMasterPose.id]: masterPoseStepIdx - 1
      }));
    }
  };

  const handleSetMasterStep = (idx) => {
    setPoseStepIndices(prev => ({
      ...prev,
      [currentMasterPose.id]: idx
    }));
  };

  // Card-level step navigation helper
  const getCardStepIdx = (asanaId) => poseStepIndices[asanaId] || 0;

  const handleCardStepChange = (asanaId, newIdx, totalSteps) => {
    if (newIdx >= 0 && newIdx < totalSteps) {
      setPoseStepIndices(prev => ({ ...prev, [asanaId]: newIdx }));
    }
  };

  const toggleCardViewMode = (asanaId) => {
    setPoseViewModes(prev => ({
      ...prev,
      [asanaId]: prev[asanaId] === 'all' ? 'stepper' : 'all'
    }));
  };

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden print:bg-none print:text-black print:p-0 print:shadow-none">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider print:hidden">
              <TbYoga className="w-4 h-4 text-emerald-200" />
              Complete Step-by-Step Asana Visual Reference
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight print:text-2xl print:text-black">
              Yoga Asanas Master Chart (Step-by-Step Guide)
            </h1>
            <p className="text-emerald-100 print:text-gray-700 text-xs sm:text-sm max-w-2xl">
              Learn procedures **one step at a time** with interactive step-by-step guidance, audio voiceover, breathing hints, and printable visual reference.
            </p>
          </div>

          {/* Action & View Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 print:hidden">
            {/* View Mode Toggle Switch */}
            <div className="bg-emerald-950/40 p-1.5 rounded-2xl flex items-center gap-1 border border-white/20 backdrop-blur-md">
              <button
                onClick={() => setViewMode('one-by-one')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  viewMode === 'one-by-one'
                    ? 'bg-white text-emerald-800 shadow-md scale-102'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <HiOutlineViewList className="w-4 h-4" />
                <span>One-by-One Procedure View</span>
              </button>

              <button
                onClick={() => setViewMode('all-grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  viewMode === 'all-grid'
                    ? 'bg-white text-emerald-800 shadow-md scale-102'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <HiOutlineViewGrid className="w-4 h-4" />
                <span>All-in-One Master Grid</span>
              </button>
            </div>

            <button
              onClick={handlePrintChart}
              className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-4 py-2.5 rounded-2xl shadow-lg transition text-xs"
            >
              <HiOutlinePrinter className="w-4 h-4 text-emerald-600" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              value={chartSearch}
              onChange={(e) => setChartSearch(e.target.value)}
              placeholder="Search pose by name, disease (Diabetes, PCOS, Back Pain), or benefit..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {["All", "Beginner Yoga", "Intermediate", "PCOS", "Diabetes", "Back Pain", "Weight Loss", "Thyroid", "Hypertension", "Digestive", "Insomnia", "Anxiety"].map((cat) => (
              <button
                key={cat}
                onClick={() => setChartCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                  chartCategory === cat 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold pt-1 border-t border-gray-100 dark:border-gray-800">
          <p>
            Showing <span className="text-emerald-600 font-extrabold">{filteredAsanas.length}</span> Step-by-Step Asana Guides
          </p>
          <p className="hidden sm:block text-emerald-600 dark:text-emerald-400 font-bold">
            {viewMode === 'one-by-one' ? '✨ Interactive One-by-One Procedure Mode Active' : '📋 Master Chart Grid Mode Active'}
          </p>
        </div>
      </div>

      {/* MODE 1: DEDICATED ONE-BY-ONE PROCEDURE STEPPER STAGE */}
      {viewMode === 'one-by-one' && filteredAsanas.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Horizontal Pose Selection Strip */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-extrabold uppercase text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-1.5">
                <TbYoga className="w-4 h-4 text-emerald-500" /> Select Yoga Pose to Practice Procedure:
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {safeSelectedIdx + 1} of {filteredAsanas.length} Poses
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {filteredAsanas.map((asana, idx) => {
                const isSelected = idx === safeSelectedIdx;
                return (
                  <button
                    key={asana.id}
                    onClick={() => {
                      setSelectedPoseIdx(idx);
                      setIsPlayingSlideshow(false);
                    }}
                    className={`flex items-center gap-3 p-2.5 pr-4 rounded-2xl shrink-0 border transition-all text-left ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-102'
                        : 'bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400'
                    }`}
                  >
                    <img 
                      src={asana.image} 
                      alt={asana.name} 
                      className="w-10 h-10 rounded-xl object-cover border border-white/30"
                    />
                    <div>
                      <h4 className="text-xs font-black line-clamp-1">{asana.name}</h4>
                      <p className={`text-[10px] italic ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>
                        {asana.sanskrit}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Pose Interactive One-by-One Stage */}
          {currentMasterPose && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
              
              {/* Header Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-lg flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                    #{safeSelectedIdx + 1}
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
                      {currentMasterPose.name}
                    </h2>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 italic">
                      {currentMasterPose.sanskrit} • Category: {Array.isArray(currentMasterPose.category) ? currentMasterPose.category.join(", ") : currentMasterPose.category}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full font-bold text-xs">
                    ⚡ {currentMasterPose.difficulty}
                  </span>
                  <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-semibold text-xs flex items-center gap-1">
                    <HiOutlineClock className="w-4 h-4 text-emerald-500" /> {currentMasterPose.duration}
                  </span>

                  {/* Slideshow & Voice Controls */}
                  <button
                    onClick={() => setIsPlayingSlideshow(!isPlayingSlideshow)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                      isPlayingSlideshow
                        ? 'bg-amber-500 text-white border-amber-600 shadow'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {isPlayingSlideshow ? <HiPause className="w-4 h-4" /> : <HiPlay className="w-4 h-4" />}
                    <span>{isPlayingSlideshow ? 'Pause Slideshow' : 'Auto Play (7s/step)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (isVoiceEnabled && synth) synth.cancel();
                      setIsVoiceEnabled(!isVoiceEnabled);
                    }}
                    className={`p-2 rounded-full border transition ${
                      isVoiceEnabled
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300'
                    }`}
                    title="Toggle Voice Guidance"
                  >
                    {isVoiceEnabled ? <HiVolumeUp className="w-4 h-4" /> : <HiVolumeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Procedure Stepper Main Display */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                
                {/* Left: Pose Image & Quick Specs */}
                <div className="md:col-span-5 space-y-4 flex flex-col">
                  <div className="h-64 rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md relative group">
                    <img 
                      src={currentMasterPose.image} 
                      alt={currentMasterPose.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                      <span className="text-white text-xs font-bold bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-full">
                        🫁 Breathing: {currentMasterPose.breathing}
                      </span>
                    </div>
                  </div>

                  {/* Key Benefits box */}
                  <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2 flex-1">
                    <h4 className="text-xs font-extrabold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                      <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" /> Key Benefits:
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                      {currentMasterPose.benefits.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right: Dedicated Interactive One-by-One Procedure Stepper */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-6 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/40">
                  
                  {/* Step Navigation Tabs/Buttons at top */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-300 tracking-wider flex items-center gap-1.5">
                        <HiOutlineBookOpen className="w-4 h-4 text-emerald-600" />
                        Step-by-Step Procedure Steps:
                      </span>
                      <span className="text-xs font-extrabold bg-emerald-600 text-white px-3 py-1 rounded-full">
                        Step {masterPoseStepIdx + 1} of {totalMasterSteps}
                      </span>
                    </div>

                    {/* Step Quick Jump Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {currentMasterPose.steps.map((_, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => {
                            handleSetMasterStep(sIdx);
                            setIsPlayingSlideshow(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            sIdx === masterPoseStepIdx
                              ? 'bg-emerald-600 text-white shadow-md scale-105 ring-2 ring-emerald-400'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          Step {sIdx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Procedure Step Spotlight Card */}
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-md space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                        {masterPoseStepIdx + 1}
                      </span>
                      <button
                        onClick={() => speakStepText(currentStepText, masterPoseStepIdx + 1)}
                        className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800"
                      >
                        <HiVolumeUp className="w-4 h-4" /> Listen to Step
                      </button>
                    </div>

                    <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 leading-relaxed">
                      {currentStepText}
                    </p>

                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                      <HiOutlineSparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Focus on steady breathing while executing this step. Keep your spine aligned.</span>
                    </div>
                  </div>

                  {/* Prev / Next Navigation Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handlePrevMasterStep}
                      disabled={masterPoseStepIdx === 0}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition ${
                        masterPoseStepIdx === 0
                          ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 shadow-sm'
                      }`}
                    >
                      <HiChevronLeft className="w-5 h-5" />
                      <span>Previous Step</span>
                    </button>

                    {/* Step dots */}
                    <div className="flex items-center gap-1.5">
                      {currentMasterPose.steps.map((_, dotIdx) => (
                        <div 
                          key={dotIdx}
                          className={`h-2.5 rounded-full transition-all ${
                            dotIdx === masterPoseStepIdx 
                              ? 'w-7 bg-emerald-600' 
                              : 'w-2.5 bg-gray-300 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNextMasterStep}
                      disabled={masterPoseStepIdx === totalMasterSteps - 1}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition ${
                        masterPoseStepIdx === totalMasterSteps - 1
                          ? 'bg-emerald-200 dark:bg-emerald-950/50 text-emerald-400 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                      }`}
                    >
                      <span>Next Step</span>
                      <HiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: MASTER STEP-BY-STEP ASANAS GRID (With Per-Card Stepper Option) */}
      {(viewMode === 'all-grid' || filteredAsanas.length === 0) && (
        <div className="space-y-6">
          {filteredAsanas.map((asana, index) => {
            const cardStepIdx = getCardStepIdx(asana.id);
            const isCardStepper = poseViewModes[asana.id] !== 'all'; // default to stepper for one-by-one procedures
            const totalSteps = asana.steps.length;
            const currentCardStep = asana.steps[cardStepIdx] || asana.steps[0];

            return (
              <div 
                key={asana.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 print:border-gray-400 print:shadow-none print:break-inside-avoid space-y-4"
              >
                {/* Top Bar: Title, Badges & View Switch */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-sm flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">{asana.name}</h3>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 italic">{asana.sanskrit}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full font-bold">
                      ⚡ {asana.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-semibold flex items-center gap-1">
                      <HiOutlineClock className="w-3.5 h-3.5" /> {asana.duration}
                    </span>

                    {/* Card-level View Mode Switcher: One-by-One vs All Steps */}
                    <button
                      onClick={() => toggleCardViewMode(asana.id)}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition flex items-center gap-1 print:hidden"
                    >
                      {isCardStepper ? '📜 List All Steps' : '🔢 One-by-One Stepper'}
                    </button>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Image Thumbnail (Col 3) */}
                  <div className="md:col-span-3 space-y-2">
                    <div className="h-44 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-inner">
                      <img 
                        src={asana.image} 
                        alt={asana.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-[11px] text-gray-500">
                      <span className="font-bold text-gray-700 dark:text-gray-300">🫁 Breathing: </span>
                      {asana.breathing}
                    </div>
                  </div>

                  {/* Step-by-Step Instructions (Col 6) */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <HiOutlineBookOpen className="w-4 h-4 text-emerald-600" />
                        Step-by-Step Procedure:
                      </h4>
                      {isCardStepper && (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          Step {cardStepIdx + 1} of {totalSteps}
                        </span>
                      )}
                    </div>

                    {/* CARD STEPPER MODE: ONE-BY-ONE PROCEDURE */}
                    {isCardStepper ? (
                      <div className="space-y-3 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            {cardStepIdx + 1}
                          </span>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-relaxed pt-0.5">
                            {currentCardStep}
                          </p>
                        </div>

                        {/* Card Stepper Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-emerald-100 dark:border-emerald-900/30">
                          <button
                            onClick={() => handleCardStepChange(asana.id, cardStepIdx - 1, totalSteps)}
                            disabled={cardStepIdx === 0}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                              cardStepIdx === 0 
                                ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                                : 'text-emerald-700 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                            }`}
                          >
                            <HiChevronLeft className="w-4 h-4" /> Prev Step
                          </button>

                          {/* Dots */}
                          <div className="flex items-center gap-1">
                            {asana.steps.map((_, dIdx) => (
                              <button
                                key={dIdx}
                                onClick={() => handleCardStepChange(asana.id, dIdx, totalSteps)}
                                className={`h-2 rounded-full transition-all ${
                                  dIdx === cardStepIdx 
                                    ? 'w-5 bg-emerald-600' 
                                    : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-emerald-400'
                                }`}
                              />
                            ))}
                          </div>

                          <button
                            onClick={() => handleCardStepChange(asana.id, cardStepIdx + 1, totalSteps)}
                            disabled={cardStepIdx === totalSteps - 1}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                              cardStepIdx === totalSteps - 1 
                                ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                                : 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                            }`}
                          >
                            Next Step <HiChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* FULL LIST MODE: ALL STEPS DISPLAYED */
                      <div className="space-y-2">
                        {asana.steps.map((st, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2 bg-emerald-50/40 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30 text-xs">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {st}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Benefits & Precautions (Col 3) */}
                  <div className="md:col-span-3 space-y-3 text-xs">
                    {/* Health Benefits */}
                    <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                      <p className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Key Health Benefits
                      </p>
                      <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-[11px]">
                        {asana.benefits.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-1">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Disease Matches */}
                    {asana.diseases && asana.diseases.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase text-gray-400">Disease Guide Match:</p>
                        <div className="flex flex-wrap gap-1">
                          {asana.diseases.map((d, dIdx) => (
                            <span key={dIdx} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 rounded-md text-[10px] font-bold">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Caution / Contraindications */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
                      <p className="font-bold flex items-center gap-1">
                        <HiOutlineExclamation className="w-3.5 h-3.5 text-amber-600" /> Caution / Avoid if:
                      </p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">{asana.caution}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default YogaAsanasMasterChart;

