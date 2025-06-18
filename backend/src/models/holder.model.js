const mongoose = require("mongoose");

const holderSchema = new mongoose.Schema({
  wallet_address: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  role: { type: String, default: "HOLDER", enum: ["HOLDER"] },
});

module.exports = mongoose.model("Holders", holderSchema);
