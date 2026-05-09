require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// MongoDB connection with caching for serverless
let cachedDb = null;
async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vadwala_dham';
  await mongoose.connect(uri);
  cachedDb = mongoose.connection;
  console.log('✅ MongoDB connected');
  return cachedDb;
}

// Connect on every request (cached after first)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use('/api/hero', require('../src/routes/hero'));
app.use('/api/announcements', require('../src/routes/announcements'));
app.use('/api/about', require('../src/routes/about'));
app.use('/api/acharyas', require('../src/routes/acharyas'));
app.use('/api/services', require('../src/routes/services'));
app.use('/api/festivals', require('../src/routes/festivals'));
app.use('/api/events', require('../src/routes/festivals'));
app.use('/api/gallery', require('../src/routes/gallery'));
app.use('/api/dhaja-chadava', require('../src/routes/dhajaChadava'));
app.use('/api/contact', require('../src/routes/contact'));
app.use('/api/donation', require('../src/routes/donation'));
app.use('/api/donations', require('../src/routes/donation'));
app.use('/api/content', require('../src/routes/content'));
app.use('/api/admin', require('../src/routes/admin'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.get('/', (_, res) => res.json({ message: 'Vadwala Dham API is running', version: '1.0.0' }));

// For local dev only
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
