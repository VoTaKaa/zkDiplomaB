const mongoose = require("mongoose");

const verifierSchema = new mongoose.Schema({
  wallet_address: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  role: { type: String, default: "VERIFIER", enum: ["VERIFIER"] },
});

module.exports = mongoose.model("Verifiers", verifierSchema);
