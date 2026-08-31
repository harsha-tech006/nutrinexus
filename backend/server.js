require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');

// Initialize express app
const app = express();

// Connect to MongoDB using the config helper
connectDB();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable Cross-Origin Resource Sharing (CORS)
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in the allowed list
    const isAllowed = allowedOrigins.some(o => o.trim() === origin);
    if (isAllowed) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Import Routes
const otpAuthRoutes = require('./routes/otpAuth');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');

// Register Routes
app.use('/api/auth/otp', otpAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

// Global Error Handler for CORS or other middleware errors
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Express API server running on port: ${PORT}`);
  console.log(`📡 CORS configured for origins: ${allowedOrigins.join(', ')}`);
  console.log(`===================================================`);
});
