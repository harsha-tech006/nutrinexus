const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DiseaseGuide = require('../models/DiseaseGuide');
const HealthGoal = require('../models/HealthGoal');

// ============================================
// 🏥 GET DISEASE GUIDE
// ============================================
router.get('/guide/:disease', auth, async (req, res) => {
  try {
    const diseaseName = req.params.disease.toLowerCase();

    let guide = await DiseaseGuide.findOne({ disease: diseaseName });

    // 🔥 DEFAULT GUIDES
    if (!guide) {
      const defaultGuides = {
        diabetes: {
          recommendedFoods: ['Leafy greens', 'Whole grains', 'Lean protein', 'Berries', 'Nuts'],
          foodsToAvoid: ['Sugar', 'White bread', 'Fried foods', 'Sweetened beverages'],
          recommendedMedicines: ['Metformin', 'Insulin (as prescribed)'],
          lifestyleTips: ['Regular exercise', 'Monitor blood sugar', 'Stay hydrated'],
          yogaAsanas: ['Vajrasana', 'Bhujangasana', 'Dhanurasana'],
        },
        pcos: {
          recommendedFoods: ['High fiber foods', 'Lean protein', 'Anti-inflammatory foods', 'Leafy greens'],
          foodsToAvoid: ['Processed foods', 'Sugar', 'Excess dairy'],
          recommendedMedicines: ['Metformin', 'Hormonal therapy (doctor prescribed)'],
          lifestyleTips: ['Exercise regularly', 'Reduce stress', 'Sleep well'],
          yogaAsanas: ['Surya Namaskar', 'Kapalbhati', 'Anulom Vilom'],
        },
        hypertension: {
          recommendedFoods: ['Bananas', 'Leafy greens', 'Beets', 'Oats', 'Berries'],
          foodsToAvoid: ['Salt', 'Processed foods', 'Alcohol', 'Excess caffeine'],
          recommendedMedicines: ['ACE inhibitors', 'Beta-blockers'],
          lifestyleTips: ['Low salt diet', 'Exercise', 'Stress control'],
          yogaAsanas: ['Shavasana', 'Anulom Vilom', 'Vajrasana'],
        },
      };

      const fallbackGuide = {
        recommendedFoods: ['Consult a doctor'],
        foodsToAvoid: ['Consult a doctor'],
        recommendedMedicines: ['Consult a doctor'],
        lifestyleTips: ['Maintain a healthy lifestyle'],
        yogaAsanas: ['Consult a yoga instructor'],
      };

      const guideData = defaultGuides[diseaseName] || fallbackGuide;

      guide = new DiseaseGuide({
        disease: diseaseName,
        ...guideData,
      });

      await guide.save();
    }

    res.json({
      success: true,
      data: guide,
    });

  } catch (err) {
    console.error('Disease Guide Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// 🎯 CREATE HEALTH GOAL
// ============================================
router.post('/goal', auth, async (req, res) => {
  const { goalType, targetWeight, targetCalories, endDate } = req.body;

  try {
    const goal = new HealthGoal({
      user: req.user.id,
      goalType,
      targetWeight,
      targetCalories,
      endDate,
      status: 'active',
      progress: 0,
    });

    const savedGoal = await goal.save();

    res.json({
      success: true,
      data: savedGoal,
    });

  } catch (err) {
    console.error('Create Goal Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// 📊 GET USER GOALS
// ============================================
router.get('/goals', auth, async (req, res) => {
  try {
    const goals = await HealthGoal.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: goals,
    });

  } catch (err) {
    console.error('Get Goals Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// ✏️ UPDATE GOAL
// ============================================
router.put('/goal/:id', auth, async (req, res) => {
  const { progress, status } = req.body;

  try {
    let goal = await HealthGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (typeof progress !== 'undefined') {
      goal.progress = progress;
    }

    if (status) {
      goal.status = status;
    }

    const updatedGoal = await goal.save();

    res.json({
      success: true,
      data: updatedGoal,
    });

  } catch (err) {
    console.error('Update Goal Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// ❌ DELETE GOAL (ADDED - IMPORTANT)
// ============================================
router.delete('/goal/:id', auth, async (req, res) => {
  try {
    const goal = await HealthGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Goal deleted successfully',
    });

  } catch (err) {
    console.error('Delete Goal Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;