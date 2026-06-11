const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ['food', 'transport', 'rent', 'shopping', 'health', 'entertainment', 'utilities', 'other'],
    default: 'other'
  },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);