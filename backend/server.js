const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ 
  origin: ['http://localhost:5173', 'https://spendlens-khaki.vercel.app'],
  credentials: true 
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/anomalies', require('./routes/anomalies'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => 
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
  })
  .catch(err => console.error('DB Error:', err));