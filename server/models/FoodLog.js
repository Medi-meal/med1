const mongoose = require('mongoose');

const FoodLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  foods: [
    {
      food: {
        type: String,
        required: true
      },
      quantity: String,
      mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        default: 'breakfast'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FoodLog', FoodLogSchema);
