const mongoose = require("mongoose");

const issuerSchema = new mongoose.Schema({
  wallet_address: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  role: { type: String, default: "ISSUER", enum: ["ISSUER"] },
});

module.exports = mongoose.model("Issuers", issuerSchema);
