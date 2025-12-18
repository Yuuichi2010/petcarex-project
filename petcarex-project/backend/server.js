const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PetCareX API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🐾 PetCareX API Server Started 🐾   ║
  ╠════════════════════════════════════════╣
  ║   Port: ${PORT}                          ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}         ║
  ║   URL: http://localhost:${PORT}         ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = app;