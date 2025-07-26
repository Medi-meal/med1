// Server configuration with default values
module.exports = {
  // MongoDB URI - defaults to local MongoDB
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/medimeal',
  
  // Gemini API Key - you'll need to get this from Google AI Studio
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'your_gemini_api_key_here',
  
  // Server Port
  PORT: process.env.PORT || 5000,
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '772559724147-utfpmphmr81s84n2eao0fnl7likdp79r.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret_here',
  
  // Session Secret
  SESSION_SECRET: process.env.SESSION_SECRET || 'medimeal_session_secret_2024',
  
  // Client URL for CORS
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
}; 