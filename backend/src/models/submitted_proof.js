const mongoose = require("mongoose");

const submittedProofSchema = new mongoose.Schema({
  wallet_address_verifier: { type: String, required: true },
  wallet_address_holder: { type: String, required: true },
  proof: { type: mongoose.Schema.Types.Mixed, required: true },
  root: { type: String, required: true },
  verified: { type: Boolean, default: false },
  tx_hash: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SubmittedProof", submittedProofSchema);
