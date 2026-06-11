const express = require('express');
const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { month } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const budgets = await Budget.find({ userId, month });

    const [year, mon] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, mon, 0, 23, 59, 59, 999));

    const spent = await Transaction.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const spentMap = {};
    spent.forEach(s => spentMap[s._id] = s.total);

    const result = budgets.map(b => ({
      ...b.toObject(),
      spent: spentMap[b.category] || 0,
      percent: Math.round(((spentMap[b.category] || 0) / b.limit) * 100),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { category, limit, month } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.userId, category, month },
      { limit },
      { upsert: true, returnDocument: 'after' }
    );
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;