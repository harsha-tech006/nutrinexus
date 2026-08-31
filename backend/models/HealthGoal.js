const mongoose = require('mongoose');

const HealthGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  goalType: {
    type: String,
    enum: ['weightLoss', 'weightGain', 'maintainWeight', 'increaseFitness', 'reduceStress'],
    required: true,
  },
  targetWeight: Number,
  targetCalories: Number,
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
  progress: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active',
  },
});

module.exports = mongoose.model('HealthGoal', HealthGoalSchema);