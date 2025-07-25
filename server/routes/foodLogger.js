const express = require('express');
const router = express.Router();
const FoodLog = require('../models/FoodLog');

// Get food logs for a user
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const foodLogs = await FoodLog.find({ userId: email }).sort({ date: -1 });
    res.json({ success: true, foods: foodLogs });
  } catch (error) {
    console.error('Error fetching food logs:', error);
    res.status(500).json({ error: 'Failed to fetch food logs' });
  }
});

// Add new food logs
router.post('/', async (req, res) => {
  try {
    const { foods, email } = req.body;
    
    if (!foods || !foods.length || !email) {
      return res.status(400).json({ error: 'Foods and email are required' });
    }

    // Check if there's an entry for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let foodLog = await FoodLog.findOne({
      userId: email,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (foodLog) {
      // Add new foods to existing log
      foodLog.foods.push(...foods);
      await foodLog.save();
    } else {
      // Create new log for today
      foodLog = new FoodLog({
        userId: email,
        foods: foods,
        date: new Date()
      });
      await foodLog.save();
    }

    res.json({ success: true, message: 'Foods logged successfully', foodLog });
  } catch (error) {
    console.error('Error saving food logs:', error);
    res.status(500).json({ error: 'Failed to save food logs' });
  }
});

// Delete a food log
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await FoodLog.findByIdAndDelete(id);
    res.json({ success: true, message: 'Food log deleted successfully' });
  } catch (error) {
    console.error('Error deleting food log:', error);
    res.status(500).json({ error: 'Failed to delete food log' });
  }
});

module.exports = router;
