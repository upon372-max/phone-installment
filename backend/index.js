const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const phoneRoutes = require('./routes/phones');
const planRoutes = require('./routes/plans');
const paymentRoutes = require('./routes/payments');
const reminderRoutes = require('./routes/reminders');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/phones', phoneRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reminders', reminderRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Phone Installment API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});