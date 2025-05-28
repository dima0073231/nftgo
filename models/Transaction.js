const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userAddress: { type: String, required: true, lowercase: true },
    txHash: { type: String, required: true, unique: true },
    amount: { type: Number, required: true }, // в ETH
    usdValue: { type: Number }, // можно добавить конвертацию
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    blockNumber: { type: Number },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
TransactionSchema.index({ userAddress: 1 });
TransactionSchema.index({ txHash: 1 }, { unique: true });
TransactionSchema.index({ timestamp: -1 });
// Добавьте в /addbalance перед сохранением
const usdRate = await getEthToUsdRate(); // Нужно реализовать API для курса
txRecord.usdValue = parseFloat(amountInEth) * usdRate;
// В роуте /transactions/:address
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const transactions = await Transaction.find({ userAddress })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);