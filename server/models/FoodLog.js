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
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      isRecommended: { type: Boolean, default: false },
      source: {
        type: String,
        enum: ['manual', 'recommendation', 'unified_logger'],
        default: 'manual'
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
  },
  totalCalories: { type: Number, default: 0 },
  totalProtein: { type: Number, default: 0 },
  totalCarbs: { type: Number, default: 0 },
  totalFat: { type: Number, default: 0 },
  totalFiber: { type: Number, default: 0 }
});

// Pre-save middleware to calculate totals
FoodLogSchema.pre('save', function(next) {
  this.totalCalories = this.foods.reduce((sum, food) => sum + (food.calories || 0), 0);
  this.totalProtein = this.foods.reduce((sum, food) => sum + (food.protein || 0), 0);
  this.totalCarbs = this.foods.reduce((sum, food) => sum + (food.carbs || 0), 0);
  this.totalFat = this.foods.reduce((sum, food) => sum + (food.fat || 0), 0);
  this.totalFiber = this.foods.reduce((sum, food) => sum + (food.fiber || 0), 0);
  next();
});

module.exports = mongoose.model('FoodLog', FoodLogSchema);
