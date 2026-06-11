const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const router = express.Router();

// Z-score anomaly detection per category
router.get('/', auth, async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.user.userId;

    // Get last 6 months of data for baseline
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const allTxns = await Transaction.find({
      userId,
      date: { $gte: sixMonthsAgo }
    });

    // Group spending by month+category
    const grouped = {};
    allTxns.forEach(t => {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      const cat = t.category;
      if (!grouped[cat]) grouped[cat] = {};
      if (!grouped[cat][key]) grouped[cat][key] = 0;
      grouped[cat][key] += t.amount;
    });

    const alerts = [];

    // For each category, compute mean and std dev, check current month
    Object.keys(grouped).forEach(category => {
      const monthlySpend = Object.entries(grouped[category]);
      const currentMonthSpend = grouped[category][month] || 0;

      // Need at least 2 past months for meaningful stats
      const pastMonths = monthlySpend.filter(([m]) => m !== month);
      if (pastMonths.length < 2) return;

      const values = pastMonths.map(([, v]) => v);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev === 0) return;

      const zScore = (currentMonthSpend - mean) / stdDev;

      // Flag if z-score > 1.5 (spending significantly above normal)
      if (zScore > 1.5 && currentMonthSpend > 0) {
        const multiplier = (currentMonthSpend / mean).toFixed(1);
        alerts.push({
          category,
          currentSpend: Math.round(currentMonthSpend),
          avgSpend: Math.round(mean),
          zScore: zScore.toFixed(2),
          multiplier,
          message: `You spent ${multiplier}x your usual amount on ${category} this month`,
          severity: zScore > 3 ? 'high' : 'medium',
        });
      }
    });

    alerts.sort((a, b) => b.zScore - a.zScore);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;