const mongoose = require('mongoose');

const UserInputSchema = new mongoose.Schema({
  email: { type: String, required: true },
  input: { type: Object, required: true },
  recommendations: { 
    type: Object, 
    default: {},
    breakfast: {
      recommended: [{ food: String, quantity: String, calories: Number, protein: Number, carbs: Number, fat: Number }],
      not_recommended: [String]
    },
    lunch: {
      recommended: [{ food: String, quantity: String, calories: Number, protein: Number, carbs: Number, fat: Number }],
      not_recommended: [String]
    },
    dinner: {
      recommended: [{ food: String, quantity: String, calories: Number, protein: Number, carbs: Number, fat: Number }],
      not_recommended: [String]
    }
  },
  recommendationsText: { type: String, required: true }, // Keep for backward compatibility
  lastRecommendationUpdate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserInput', UserInputSchema); 