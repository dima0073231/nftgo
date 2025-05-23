const mongoose = require("mongoose");
const { Schema } = mongoose;

const promocodeSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  reward: { type: Number, required: true }, 
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Promocode", promocodeSchema);