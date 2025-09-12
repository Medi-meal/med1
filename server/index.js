const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const config = require('./config');

const User = require('./models/User');
const UserInput = require('./models/UserInput');
const FoodLog = require('./models/FoodLog');

// Import SQL agent route
const sqlAgentRoute = require('./routes/sqlAgent');

const app = express();
app.use(cors());
app.use(express.json());

// Mount SQL agent route
app.use('/api', sqlAgentRoute);

mongoose.connect(config.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err); // <--- Add this line to see errors in your terminal
    res.status(500).json({ message: 'Server error' });
  }
});
// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.post('/api/gemini-recommend', async (req, res) => {
  const { age, medication, disease, gender, foodType, bmi } = req.body;

  const prompt = `
    Given the following user details:
    - Age: ${age}
    - Gender: ${gender}
    - BMI: ${bmi || 'not provided'}
    - Medication: ${medication}
    - Disease: ${disease}
    - Food preference: ${foodType}
    Suggest meal plans for Breakfast, Lunch, and Dinner.
    For each meal, provide:
      - "recommended": an array of objects with "food" and "quantity"
      - "not_recommended": an array of food names to avoid
    Respond ONLY with a valid JSON object with the following structure:
    {
      "breakfast": {
        "recommended": [{"food": "...", "quantity": "..."}],
        "not_recommended": ["...", "..."]
      },
      "lunch": { ... },
      "dinner": { ... }
    }
    Do not include any explanation or extra text.
  `;

  let attempts = 0;
  while (attempts < 3) {
    try {
      const geminiRes = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + config.GEMINI_API_KEY,
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );

      const text = geminiRes.data.candidates[0].content.parts[0].text;
      console.log('Gemini raw response:', text); // Debug log
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        result = match ? JSON.parse(match[0]) : {};
      }
      // Add fallback for missing meals
      ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        if (!result[meal]) {
          result[meal] = { recommended: [], not_recommended: [] };
        }
      });
      return res.json(result);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error && err.response.data.error.message && err.response.data.error.message.toLowerCase().includes('overloaded')) {
        attempts++;
        await sleep(1500); // wait 1.5 seconds before retry
        continue;
      }
      const errorDetails = err.response?.data || err.message;
      console.error('Gemini API error:', errorDetails);
      return res.status(500).json({ message: 'Gemini API error', error: errorDetails });
    }
  }
  res.status(503).json({ message: 'Gemini model is overloaded. Please try again in a moment.' });
});

app.post('/api/gemini-flash-test', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = 'Explain how AI works in a few words';
  try {
    const flashRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        }
      }
    );
    res.json(flashRes.data);
  } catch (err) {
    const errorDetails = err.response?.data || err.message;
    console.error('Gemini Flash API error:', errorDetails);
    res.status(500).json({ message: 'Gemini Flash API error', error: errorDetails });
  }
});

app.post('/api/gemini-food-check', async (req, res) => {
  const { disease, medication, food } = req.body;
  if (!food) return res.status(400).json({ warning: 'No food provided.' });
  const prompt = `Given the user has ${disease || 'no specific disease'} and is taking ${medication || 'no medication'}, is ${food} safe to eat? Respond with a short warning if not safe, or say it is safe.`;
  try {
    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    const text = geminiRes.data.candidates[0].content.parts[0].text;
    res.json({ warning: text.trim() });
  } catch (err) {
    const errorDetails = err.response?.data || err.message;
    console.error('Gemini food check error:', errorDetails);
    res.status(500).json({ warning: 'Could not check food safety.' });
  }
});

function recommendationsToText(recommendations) {
  if (!recommendations || typeof recommendations !== 'object') return '';
  const rec = recommendations.recommended && recommendations.recommended.length
    ? `Recommended: ${recommendations.recommended.join(', ')}`
    : '';
  const notRec = recommendations.not_recommended && recommendations.not_recommended.length
    ? `Not Recommended: ${recommendations.not_recommended.join(', ')}`
    : '';
  return [rec, notRec].filter(Boolean).join('\n');
}

// Save user input and recommendations
app.post('/api/user-input', async (req, res) => {
  const { email, input, recommendations } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  // Convert recommendations object to text summary
  const recommendationsText = recommendationsToText(recommendations);
  try {
    const newInput = await UserInput.create({ email, input, recommendations: recommendationsText });
    res.json({ message: 'Saved', data: newInput });
  } catch (err) {
    res.status(500).json({ message: 'Error saving input' });
  }
});

// Get all user input history (returns text summary)
app.get('/api/user-input/history', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email required' });
  try {
    const history = await UserInput.find({ email }).sort({ createdAt: -1 });
    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching input history' });
  }
});

// Get user input
app.get('/api/user-input', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email required' });
  try {
    const found = await UserInput.findOne({ email });
    res.json({ input: found ? found.input : null });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching input' });
  }
});

// Google Login Route
app.post('/api/google-login', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'No token provided' });
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name } = payload;
    if (!email) return res.status(400).json({ message: 'No email in Google account' });
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, password: '' });
      await user.save();
    }
    res.json({ email, name });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});


app.post('/api/food-analysis', async (req, res) => {
  const { food, userProfile } = req.body;

  const prompt = `
    Analyze the safety of "${food}" for a user with the following profile:
    - Medications: ${userProfile?.medications || 'none specified'}
    - Health conditions: ${userProfile?.conditions || 'none specified'}
    - Age: ${userProfile?.age || 'not specified'}
    
    Provide analysis in this JSON format:
    {
      "status": "safe|caution|avoid",
      "recommendation": "Brief recommendation text",
      "warnings": ["warning1", "warning2"],
      "interactions": ["interaction1", "interaction2"],
      "benefits": ["benefit1", "benefit2"]
    }
    
    Focus on drug-food interactions and health considerations.
    Respond ONLY with valid JSON, no extra text.
  `;

  try {
    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const text = geminiRes.data.candidates[0].content.parts[0].text;
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      // Fallback response if JSON parsing fails
      result = {
        status: 'caution',
        recommendation: `Consider consulting your healthcare provider about "${food}" in relation to your current medications and health conditions.`,
        warnings: ['Analysis temporarily unavailable'],
        interactions: [],
        benefits: []
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Food analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze food. Please try again later.' 
    });
  }
});

// Food Logger Routes
app.get('/api/food-logger', async (req, res) => {
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
app.post('/api/food-logger', async (req, res) => {
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

// Add recommended food to actual meals
app.post('/api/add-recommended-food', async (req, res) => {
  try {
    const { email, food, mealType, nutritionData } = req.body;
    
    if (!email || !food || !mealType) {
      return res.status(400).json({ error: 'Email, food, and mealType are required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find or create today's food log
    let foodLog = await FoodLog.findOne({
      userId: email,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    const newFood = {
      food: food,
      mealType: mealType,
      calories: nutritionData?.calories || 0,
      protein: nutritionData?.protein || 0,
      carbs: nutritionData?.carbs || 0,
      fat: nutritionData?.fat || 0,
      fiber: nutritionData?.fiber || 0,
      isRecommended: true,
      source: 'recommendation',
      timestamp: new Date()
    };

    if (foodLog) {
      foodLog.foods.push(newFood);
      await foodLog.save();
    } else {
      foodLog = new FoodLog({
        userId: email,
        foods: [newFood],
        date: new Date()
      });
      await foodLog.save();
    }

    // Update the user's recommendations to mark this food as taken
    const userInput = await UserInput.findOne({ email });
    if (userInput && userInput.recommendations && userInput.recommendations[mealType]) {
      const foodIndex = userInput.recommendations[mealType].foods.findIndex(f => f.name === food);
      if (foodIndex !== -1) {
        userInput.recommendations[mealType].foods[foodIndex].isTaken = true;
        userInput.recommendations[mealType].foods[foodIndex].takenAt = new Date();
        await userInput.save();
      }
    }

    res.json({ 
      success: true, 
      message: 'Recommended food added to meals successfully',
      foodLog 
    });
  } catch (error) {
    console.error('Error adding recommended food:', error);
    res.status(500).json({ error: 'Failed to add recommended food' });
  }
});

// Get synchronized meal data (recommendations + actual intake)
app.get('/api/meal-sync', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's food log
    const foodLog = await FoodLog.findOne({
      userId: email,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Get current recommendations
    const userInput = await UserInput.findOne({ email });
    
    const syncData = {
      recommendations: userInput?.recommendations || {},
      actualIntake: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      },
      totals: {
        calories: foodLog?.totalCalories || 0,
        protein: foodLog?.totalProtein || 0,
        carbs: foodLog?.totalCarbs || 0,
        fat: foodLog?.totalFat || 0,
        fiber: foodLog?.totalFiber || 0
      }
    };

    // Organize actual intake by meal type
    if (foodLog && foodLog.foods) {
      foodLog.foods.forEach(food => {
        if (syncData.actualIntake[food.mealType]) {
          syncData.actualIntake[food.mealType].push(food);
        }
      });
    }

    res.json({ success: true, data: syncData });
  } catch (error) {
    console.error('Error fetching meal sync data:', error);
    res.status(500).json({ error: 'Failed to fetch meal sync data' });
  }
});

// Update recommendation status
app.put('/api/update-recommendation-status', async (req, res) => {
  try {
    const { email, mealType, foodName, isTaken } = req.body;
    
    if (!email || !mealType || !foodName) {
      return res.status(400).json({ error: 'Email, mealType, and foodName are required' });
    }

    const userInput = await UserInput.findOne({ email });
    if (!userInput || !userInput.recommendations || !userInput.recommendations[mealType]) {
      return res.status(404).json({ error: 'Recommendations not found' });
    }

    const foodIndex = userInput.recommendations[mealType].foods.findIndex(f => f.name === foodName);
    if (foodIndex === -1) {
      return res.status(404).json({ error: 'Food not found in recommendations' });
    }

    userInput.recommendations[mealType].foods[foodIndex].isTaken = isTaken;
    if (isTaken) {
      userInput.recommendations[mealType].foods[foodIndex].takenAt = new Date();
    } else {
      userInput.recommendations[mealType].foods[foodIndex].takenAt = null;
    }

    await userInput.save();

    res.json({ 
      success: true, 
      message: 'Recommendation status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating recommendation status:', error);
    res.status(500).json({ error: 'Failed to update recommendation status' });
  }
});

// Bulk add multiple recommended foods
app.post('/api/add-multiple-recommended-foods', async (req, res) => {
  try {
    const { email, foods } = req.body; // foods is array of {food, mealType, nutritionData}
    
    if (!email || !foods || !Array.isArray(foods)) {
      return res.status(400).json({ error: 'Email and foods array are required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find or create today's food log
    let foodLog = await FoodLog.findOne({
      userId: email,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    const newFoods = foods.map(item => ({
      food: item.food,
      mealType: item.mealType,
      calories: item.nutritionData?.calories || 0,
      protein: item.nutritionData?.protein || 0,
      carbs: item.nutritionData?.carbs || 0,
      fat: item.nutritionData?.fat || 0,
      fiber: item.nutritionData?.fiber || 0,
      isRecommended: true,
      source: 'recommendation',
      timestamp: new Date()
    }));

    if (foodLog) {
      foodLog.foods.push(...newFoods);
      await foodLog.save();
    } else {
      foodLog = new FoodLog({
        userId: email,
        foods: newFoods,
        date: new Date()
      });
      await foodLog.save();
    }

    // Update recommendations status for all foods
    const userInput = await UserInput.findOne({ email });
    if (userInput && userInput.recommendations) {
      foods.forEach(item => {
        if (userInput.recommendations[item.mealType]) {
          const foodIndex = userInput.recommendations[item.mealType].foods.findIndex(f => f.name === item.food);
          if (foodIndex !== -1) {
            userInput.recommendations[item.mealType].foods[foodIndex].isTaken = true;
            userInput.recommendations[item.mealType].foods[foodIndex].takenAt = new Date();
          }
        }
      });
      await userInput.save();
    }

    res.json({ 
      success: true, 
      message: `${foods.length} recommended foods added to meals successfully`,
      foodLog 
    });
  } catch (error) {
    console.error('Error adding multiple recommended foods:', error);
    res.status(500).json({ error: 'Failed to add recommended foods' });
  }
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Client URL: ${config.CLIENT_URL}`);
});