const mongoose = require('mongoose');

const DiseaseGuideSchema = new mongoose.Schema({
  disease: {
    type: String,
    required: true,
    unique: true,
  },
  recommendedFoods: [String],
  foodsToAvoid: [String],
  recommendedMedicines: [String],
  lifestyleTips: [String],
  exerciseRecommendations: [String],
  yogaAsanas: [String],
  description: String,
});

module.exports = mongoose.model('DiseaseGuide', DiseaseGuideSchema);