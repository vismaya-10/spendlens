const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

function autoCategory(title) {
  const t = title.toLowerCase();
  if (/zomato|swiggy|restaurant|food|cafe|pizza|hotel/.test(t)) return 'food';
  if (/uber|ola|petrol|bus|train|metro|flight/.test(t)) return 'transport';
  if (/rent|pg|hostel/.test(t)) return 'rent';
  if (/amazon|flipkart|shopping|mall|myntra/.test(t)) return 'shopping';
  if (/hospital|pharmacy|doctor|medical|health/.test(t)) return 'health';
  if (/netflix|spotify|movie|game|entertainment/.test(t)) return 'entertainment';
  if (/electricity|wifi|water|bill|recharge/.test(t)) return 'utilities';
  return 'other';
}

function getMonthRange(month) {
  const [year, mon] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, mon - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, mon, 0, 23, 59, 59, 999));
  return { start, end };
}

router.get('/', auth, async (req, res) => {
  try {
    const { month } = req.query;
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    let filter = { userId };
    if (month) {
      const { start, end } = getMonthRange(month);
      filter.date = { $gte: start, $lte: end };
    }
    const txns = await Transaction.find(filter).sort({ date: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, category, date, note } = req.body;
    const cat = category || autoCategory(title);
    const txn = await Transaction.create({
      userId: req.user.userId,
      title,
      amount,
      category: cat,
      date: date ? new Date(date) : new Date(),
      note
    });
    res.json(txn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/import', auth, upload.single('file'), async (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      if (row.title && row.amount) {
        results.push({
          userId: req.user.userId,
          title: row.title,
          amount: parseFloat(row.amount),
          category: row.category || autoCategory(row.title),
          date: row.date ? new Date(row.date) : new Date(),
          note: row.note || '',
        });
      }
    })
    .on('end', async () => {
      await Transaction.insertMany(results);
      fs.unlinkSync(req.file.path);
      res.json({ imported: results.length });
    });
});

router.get('/summary', auth, async (req, res) => {
  try {
    const { month } = req.query;
    const { start, end } = getMonthRange(month);
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    console.log('Summary range:', start, 'to', end);
    console.log('userId:', userId);

    const summary = await Transaction.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    console.log('Summary result:', summary);
    res.json(summary);
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;