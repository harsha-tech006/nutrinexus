const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const yogaDatabase = {
  beginner: [
    {
      id: 1,
      name: "Tadasana (Mountain Pose)",
      duration: "1 minutes each sides",
      benefits: "Improves posture, strengthens thighs, knees, and ankles",
      instructions: "Stand with feet together, distribute weight evenly, lengthen spine, relax shoulders",
      imageUrl: "https://example.com/tadasana.jpg",
      difficulty: "beginner",
    },
    {
      id: 2,
      name: "Vrikshasana (Tree Pose)",
      duration: "5 minutes each side",
      benefits: "Improves balance, strengthens legs, opens hips",
      instructions: "Place one foot on opposite thigh, hands in prayer position, focus on a point",
      imageUrl: "https://example.com/vrikshasana.jpg",
      difficulty: "beginner",
    },
    {
      id: 3,
      name: "Adho Mukha Svanasana (Downward Dog)",
      duration: "5 minutes",
      benefits: "Strengthens arms and legs, stretches spine",
      instructions: "Start on hands and knees, lift hips up and back, form an inverted V shape",
      imageUrl: "https://example.com/downwarddog.jpg",
      difficulty: "beginner",
    },
    {
      id: 4,
      name: "Balasana (Child's Pose)",
      duration: "3-5 minutes",
      benefits: "Calms mind, relieves stress, stretches lower back",
      instructions: "Kneel on floor, sit back on heels, fold forward, rest forehead on ground",
      imageUrl: "https://example.com/balasana.jpg",
      difficulty: "beginner",
    },
  ],
  intermediate: [
    {
      id: 5,
      name: "Surya Namaskar (Sun Salutation)",
      duration: "10-15 minutes",
      benefits: "Full body workout, improves flexibility and strength",
      instructions: "Series of 12 poses performed in sequence with breath synchronization",
      imageUrl: "https://example.com/suryanamaskar.jpg",
      difficulty: "intermediate",
      poses: [
        "Pranamasana (Prayer Pose)",
        "Hasta Uttanasana (Raised Arms Pose)",
        "Padahastasana (Hand to Foot Pose)",
        "Ashwa Sanchalanasana (Equestrian Pose)",
        "Dandasana (Stick Pose)",
        "Ashtanga Namaskara (Eight Limbed Pose)",
        "Bhujangasana (Cobra Pose)",
        "Adho Mukha Svanasana (Downward Dog)",
        "Ashwa Sanchalanasana (Equestrian Pose)",
        "Padahastasana (Hand to Foot Pose)",
        "Hasta Uttanasana (Raised Arms Pose)",
        "Pranamasana (Prayer Pose)",
      ],
    },
    {
      id: 6,
      name: "Bhujangasana (Cobra Pose)",
      duration: "5 minutes",
      benefits: "Strengthens spine, opens chest and shoulders",
      instructions: "Lie on stomach, press palms into floor, lift chest while keeping lower body grounded",
      imageUrl: "https://example.com/bhujangasana.jpg",
      difficulty: "intermediate",
    },
    {
      id: 7,
      name: "Ardha Chandrasana (Half Moon Pose)",
      duration: "3-5 minutes each side",
      benefits: "Improves balance, strengthens legs and core",
      instructions: "Balance on one leg, extend other leg parallel to floor, reach one hand down",
      imageUrl: "https://example.com/halfmoon.jpg",
      difficulty: "intermediate",
    },
  ],
  advanced: [
    {
      id: 8,
      name: "Sirsasana (Headstand)",
      duration: "5 minutes",
      benefits: "Improves blood circulation, strengthens upper body, calms mind",
      instructions: "Perform only under expert guidance. Start with wall support, build strength gradually",
      imageUrl: "https://example.com/sirsasana.jpg",
      difficulty: "advanced",
      precautions: "Avoid if you have neck injuries, high blood pressure, or during menstruation",
    },
    {
      id: 9,
      name: "Mayurasana (Peacock Pose)",
      duration: "3 minutes",
      benefits: "Strengthens arms and wrists, improves digestion",
      instructions: "Advanced pose requiring significant upper body strength. Balance on palms with elbows pressing into abdomen",
      imageUrl: "https://example.com/mayurasana.jpg",
      difficulty: "advanced",
    },
    {
      id: 10,
      name: "Hanumanasana (Monkey Pose/Splits)",
      duration: "3-5 minutes each side",
      benefits: "Deep hip opener, stretches hamstrings and quadriceps",
      instructions: "Slow progression required. Start with half splits and gradually deepen",
      imageUrl: "https://example.com/hanumanasana.jpg",
      difficulty: "advanced",
    },
  ],
  specific: {
    stress: [
      {
        id: 11,
        name: "Balasana (Child's Pose)",
        duration: "5 minutes",
        benefits: "Calms the mind, relieves stress and anxiety",
        instructions: "Kneel on floor, sit back on heels, fold forward, rest forehead on ground, breathe deeply",
      },
      {
        id: 12,
        name: "Shavasana (Corpse Pose)",
        duration: "10 minutes",
        benefits: "Deep relaxation, reduces stress and fatigue",
        instructions: "Lie on back with arms and legs relaxed, close eyes, focus on breath",
      },
      {
        id: 13,
        name: "Anulom Vilom (Alternate Nostril Breathing)",
        duration: "10 minutes",
        benefits: "Balances nervous system, reduces anxiety",
        instructions: "Sit comfortably, use thumb and ring finger to alternate nostrils while breathing",
      },
    ],
    weightLoss: [
      {
        id: 14,
        name: "Surya Namaskar",
        duration: "15 minutes (12 rounds)",
        benefits: "Burns calories, improves metabolism, full body workout",
        instructions: "Perform 12 rounds of Sun Salutation with proper breathing",
      },
      {
        id: 15,
        name: "Kapalbhati Pranayama",
        duration: "10 minutes",
        benefits: "Improves digestion, burns belly fat, detoxifies body",
        instructions: "Sit comfortably, perform rapid forceful exhalations, passive inhalations",
      },
      {
        id: 16,
        name: "Ustrasana (Camel Pose)",
        duration: "3-5 minutes",
        benefits: "Stretches abdomen, improves digestion, reduces belly fat",
        instructions: "Kneel with knees hip-width, arch back, reach for heels",
      },
    ],
    digestion: [
      {
        id: 17,
        name: "Vajrasana (Thunderbolt Pose)",
        duration: "5-10 minutes after meals",
        benefits: "Improves digestion, relieves gas and acidity",
        instructions: "Kneel with knees together, sit back on heels, keep spine straight",
      },
      {
        id: 18,
        name: "Pavanamuktasana (Wind Relieving Pose)",
        duration: "3-5 minutes each side",
        benefits: "Relieves gas, improves digestion",
        instructions: "Lie on back, bring one knee to chest, hold, alternate legs",
      },
    ],
  },
  sequences: [
    {
      id: "morning",
      name: "Morning Energy Sequence",
      duration: "20 minutes",
      poses: ["Tadasana", "Surya Namaskar x 5", "Bhujangasana", "Adho Mukha Svanasana", "Shavasana"],
      benefits: "Energizes body, improves flexibility, starts day with positive energy",
    },
    {
      id: "evening",
      name: "Evening Relaxation Sequence",
      duration: "15 minutes",
      poses: ["Balasana", "Marjaryasana", "Bitilasana", "Viparita Karani", "Shavasana"],
      benefits: "Releases tension, calms mind, improves sleep quality",
    },
  ],
};

// Get all yoga poses
router.get('/poses', auth, async (req, res) => {
  try {
    const allPoses = [
      ...yogaDatabase.beginner,
      ...yogaDatabase.intermediate,
      ...yogaDatabase.advanced,
    ];
    res.json(allPoses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get yoga poses by level
router.get('/poses/:level', auth, async (req, res) => {
  const level = req.params.level.toLowerCase();
  
  if (yogaDatabase[level]) {
    res.json(yogaDatabase[level]);
  } else {
    res.status(404).json({ message: 'Level not found' });
  }
});

// Get yoga poses for specific purpose
router.get('/purpose/:purpose', auth, async (req, res) => {
  const purpose = req.params.purpose.toLowerCase();
  
  if (yogaDatabase.specific[purpose]) {
    res.json(yogaDatabase.specific[purpose]);
  } else {
    res.status(404).json({ message: 'Purpose not found' });
  }
});

// Get yoga sequences
router.get('/sequences', auth, async (req, res) => {
  res.json(yogaDatabase.sequences);
});

// Get specific sequence by ID
router.get('/sequence/:id', auth, async (req, res) => {
  const sequence = yogaDatabase.sequences.find(s => s.id === req.params.id);
  
  if (sequence) {
    res.json(sequence);
  } else {
    res.status(404).json({ message: 'Sequence not found' });
  }
});

// Get yoga guide for disease
router.get('/disease/:disease', auth, async (req, res) => {
  const diseaseGuides = {
    diabetes: {
      disease: "Diabetes",
      description: "Yoga can help manage blood sugar levels and improve insulin sensitivity.",
      asanas: [
        "Vajrasana - Improves digestion and insulin sensitivity",
        "Bhujangasana - Stimulates pancreas",
        "Dhanurasana - Regulates blood sugar",
        "Surya Namaskar - Overall health improvement",
        "Pranayama - Reduces stress which affects blood sugar",
      ],
      precautions: [
        "Avoid strenuous poses if blood sugar is low",
        "Keep glucose tablets nearby",
        "Monitor blood sugar before and after practice",
        "Avoid inverted poses if you have diabetic retinopathy",
      ],
      frequency: "Practice daily for 30-45 minutes, preferably in the morning",
    },
    pcos: {
      disease: "PCOS/PCOD",
      description: "Yoga helps balance hormones, reduce stress, and improve metabolism.",
      asanas: [
        "Surya Namaskar - Hormonal balance",
        "Kapalbhati - Improves metabolism",
        "Anulom Vilom - Reduces stress",
        "Butterfly Pose - Improves reproductive health",
        "Cobra Pose - Stimulates ovaries",
      ],
      precautions: [
        "Avoid during heavy bleeding",
        "Listen to your body and don't overexert",
        "Focus on regular practice rather than intensity",
      ],
      frequency: "Practice 5-6 times a week for 30-40 minutes",
    },
    hypertension: {
      disease: "Hypertension",
      description: "Yoga helps lower blood pressure through relaxation and breath control.",
      asanas: [
        "Shavasana - Deep relaxation",
        "Anulom Vilom - Calms nervous system",
        "Vajrasana - Improves circulation",
        "Cat-Cow Stretch - Relieves back tension",
        "Standing Forward Bend - Calms mind",
      ],
      precautions: [
        "Avoid inverted poses (headstand, shoulder stand)",
        "Avoid holding breath",
        "Move slowly and mindfully",
        "Monitor blood pressure regularly",
      ],
      frequency: "Daily practice, especially relaxation poses and pranayama",
    },
    backPain: {
      disease: "Back Pain",
      description: "Yoga strengthens back muscles and improves spinal flexibility.",
      asanas: [
        "Cat-Cow Stretch - Mobilizes spine",
        "Child's Pose - Stretches lower back",
        "Cobra Pose - Strengthens back",
        "Downward Dog - Lengthens spine",
        "Bridge Pose - Strengthens back and glutes",
      ],
      precautions: [
        "Avoid forward bends if pain is acute",
        "Don't force any pose",
        "Use props for support",
        "Stop if pain increases",
      ],
      frequency: "Gentle daily practice, avoid overexertion",
    },
  };
  
  const guide = diseaseGuides[req.params.disease.toLowerCase()] || {
    disease: req.params.disease,
    description: "Consult a yoga instructor for personalized guidance based on your condition.",
    asanas: [
      "Start with gentle stretching exercises",
      "Practice deep breathing techniques (Pranayama)",
      "Avoid strenuous poses if you have any medical conditions",
      "Consider working with a certified yoga therapist",
    ],
    precautions: [
      "Always consult your doctor before starting yoga",
      "Listen to your body and don't push beyond limits",
      "Inform your yoga instructor about your condition",
    ],
    frequency: "Start with 15-20 minutes daily, gradually increase",
  };
  
  res.json(guide);
});

// Get yoga tips
router.get('/tips', auth, async (req, res) => {
  const tips = [
    "Practice yoga on an empty stomach or 2-3 hours after meals",
    "Wear comfortable, breathable clothing",
    "Use a non-slip yoga mat",
    "Listen to your body - never force a pose",
    "Breathe deeply and rhythmically throughout practice",
    "Stay hydrated before and after practice",
    "Practice at the same time daily for best results",
    "Warm up properly before attempting advanced poses",
    "Focus on alignment rather than depth",
    "End each session with 5-10 minutes of relaxation (Shavasana)",
  ];
  
  res.json(tips);
});

module.exports = router;