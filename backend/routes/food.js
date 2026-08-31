const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FoodEntry = require('../models/FoodEntry');
const FoodReminder = require('../models/FoodReminder');

// ============================================
// 🍽️ ADD FOOD ENTRY
// ============================================
router.post('/entry', auth, async (req, res) => {
  try {
    const newEntry = new FoodEntry({
      user: req.user.id,
      ...req.body,
    });

    const savedEntry = await newEntry.save();

    res.json({
      success: true,
      data: savedEntry,
    });

  } catch (err) {
    console.error('Add Food Entry Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// 📅 GET TODAY FOOD
// ============================================
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const entries = await FoodEntry.find({
      user: req.user.id,
      date: today,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: entries,
    });

  } catch (err) {
    console.error('Get Today Food Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// 📊 FOOD HISTORY
// ============================================
router.get('/history', auth, async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const entries = await FoodEntry.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: entries,
    });

  } catch (err) {
    console.error('Food History Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// ✏️ UPDATE FOOD ENTRY
// ============================================
router.put('/entry/:id', auth, async (req, res) => {
  try {
    let entry = await FoodEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    entry = await FoodEntry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      data: entry,
    });

  } catch (err) {
    console.error('Update Entry Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// ❌ DELETE FOOD ENTRY
// ============================================
router.delete('/entry/:id', auth, async (req, res) => {
  try {
    const entry = await FoodEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await entry.deleteOne();

    res.json({
      success: true,
      message: 'Entry deleted',
    });

  } catch (err) {
    console.error('Delete Entry Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// 🔔 CREATE FOOD REMINDER
// ============================================
router.post('/reminder', auth, async (req, res) => {
  const { mealType, time, recommendedFoods } = req.body;

  try {
    const reminder = new FoodReminder({
      user: req.user.id,
      mealType,
      time,
      recommendedFoods,
      isActive: true,
    });

    const savedReminder = await reminder.save();

    res.json({
      success: true,
      data: savedReminder,
    });

  } catch (err) {
    console.error('Create Reminder Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// 📋 GET FOOD REMINDERS
// ============================================
router.get('/reminders', auth, async (req, res) => {
  try {
    const reminders = await FoodReminder.find({
      user: req.user.id,
    }).sort({ time: 1 });

    res.json({
      success: true,
      data: reminders,
    });

  } catch (err) {
    console.error('Get Reminders Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// 🔄 UPDATE FOOD REMINDER
// ============================================
router.put('/reminder/:id', auth, async (req, res) => {
  const { mealType, time, recommendedFoods, isActive } = req.body;

  try {
    let reminder = await FoodReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    reminder.mealType = mealType || reminder.mealType;
    reminder.time = time || reminder.time;
    reminder.recommendedFoods = recommendedFoods || reminder.recommendedFoods;

    if (typeof isActive !== 'undefined') {
      reminder.isActive = isActive;
    }

    const updatedReminder = await reminder.save();

    res.json({
      success: true,
      data: updatedReminder,
    });

  } catch (err) {
    console.error('Update Reminder Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// 🗑️ DELETE FOOD REMINDER
// ============================================
router.delete('/reminder/:id', auth, async (req, res) => {
  try {
    const reminder = await FoodReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await reminder.deleteOne();

    res.json({
      success: true,
      message: 'Food reminder deleted',
    });

  } catch (err) {
    console.error('Delete Reminder Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;