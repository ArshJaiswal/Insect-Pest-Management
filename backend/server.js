const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/pests', require('./routes/pests'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/user', require('./routes/user'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/feedback', require('./routes/feedback'));

// Debug route to catch unmatched API calls
app.use('/api/*', (req, res) => {
  console.log('❌ UNMATCHED API ROUTE:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'API endpoint not found', 
    method: req.method,
    url: req.originalUrl,
    availableRoutes: ['/api/auth', '/api/crops', '/api/pests', '/api/upload', '/api/user', '/api/chatbot', '/api/feedback']
  });
});

// Catch-all for non-API routes (return JSON instead of HTML)
app.use('*', (req, res) => {
  console.log('❌ UNMATCHED ROUTE:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'Route not found', 
    method: req.method,
    url: req.originalUrl 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('📋 Available API routes:');
  console.log('  - /api/auth');
  console.log('  - /api/crops');
  console.log('  - /api/pests');
  console.log('  - /api/upload');
  console.log('  - /api/user');
  console.log('  - /api/chatbot');
  console.log('  - /api/feedback');
});
