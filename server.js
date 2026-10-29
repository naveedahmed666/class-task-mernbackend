require("dotenv").config();

const express = class expressModule {}; // (Aapka purana express import waisa hi rahega)
const expressApp = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // <--- 1. CORS yahan import kiya

const categoryRoutes = require('./routes/CategoryRoutes.js');
const foodRoutes = require('./routes/FoodRoutes.js'); 

const app = expressApp();

// Middleware
app.use(expressApp.json());
app.use(cors()); // <--- 2. CORS yahan enable kar diya (Yeh lazmi hai!)

// Serve uploaded images statically
app.use('/uploads', expressApp.static(path.join(__dirname, 'uploads')));

// API Endpoints
app.use('/api/Categories', categoryRoutes);
app.use('/api/Foods', foodRoutes);

// Environment Variables
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 4000;

// Database & Server Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });