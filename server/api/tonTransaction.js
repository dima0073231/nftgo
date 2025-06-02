const mongoose = require('mongoose');

const tonTransactionSchema = new mongoose.Schema({
  txHash: { type: String, required: true, unique: true },
  telegramId: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'pending', 'failed'], required: true },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Ton', tonTransactionSchema);
