const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory');

// ============================================
// 🔹 GET AI NUTRITION ADVICE
// ============================================
router.post('/advice', auth, async (req, res) => {
  const { query } = req.body;

  // ✅ Validation
  if (!query || query.trim() === '') {
    return res.status(400).json({ success: false, message: 'Query is required' });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userContext = {
      age: user.age,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      diseases: user.diseases || [],
      dailyCalorieGoal: user.dailyCalorieGoal,
    };

    const advice = await aiService.getNutritionAdvice(query, userContext);

    // ✅ Save chat history
    await aiService.saveChatHistory(req.user.id, [
      { role: 'user', content: query },
      { role: 'assistant', content: advice },
    ]);

    return res.json({
      success: true,
      advice,
    });

  } catch (error) {
    console.error('AI Advice Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while generating advice',
    });
  }
});

// ============================================
// 🔹 GET MEAL PLAN
// ============================================
router.post('/meal-plan', auth, async (req, res) => {
  const { mealType } = req.body;

  // ✅ Validation
  if (!mealType) {
    return res.status(400).json({
      success: false,
      message: 'Meal type is required',
    });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const userContext = {
      age: user.age,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      diseases: user.diseases || [],
      dailyCalorieGoal: user.dailyCalorieGoal,
    };

    const mealPlan = await aiService.getMealPlanRecommendation(
      userContext,
      mealType
    );

    return res.json({
      success: true,
      mealPlan,
    });

  } catch (error) {
    console.error('Meal Plan Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while generating meal plan',
    });
  }
});

// ============================================
// 🔹 GET CHAT HISTORY
// ============================================
router.get('/chat-history', auth, async (req, res) => {
  try {
    const history = await aiService.getChatHistory(req.user.id);

    return res.json({
      success: true,
      history: history || [],
    });

  } catch (error) {
    console.error('Chat History Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching chat history',
    });
  }
});

// ============================================
// 🔹 CLEAR CHAT HISTORY
// ============================================
router.delete('/chat-history', auth, async (req, res) => {
  try {
    await ChatHistory.findOneAndDelete({ user: req.user.id });

    return res.json({
      success: true,
      message: 'Chat history cleared successfully',
    });

  } catch (error) {
    console.error('Clear Chat Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while clearing chat history',
    });
  }
});

module.exports = router;