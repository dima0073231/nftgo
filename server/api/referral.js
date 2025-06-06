const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrerTelegramId: { type: Number, required: true },
  referredTelegramId: { type: Number, required: true, unique: true },
  amountEarned: { type: Number, default: 0 },
  friendDepositAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Referral', referralSchema);