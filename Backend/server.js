const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./configDb/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();


// Body parser
app.use(express.json());

// Logger middleware
const logger = require('./middleware/logger');
app.use(logger);

// Mount routers
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});