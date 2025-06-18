const mongoose = require("mongoose");

const proofSchema = new mongoose.Schema(
  {
    leaf: {
      type: String,
      required: true,
      trim: true,
    },
    pathIndices: [
      {
        type: Number,
        required: true,
      },
    ],
    siblings: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
  },
  { _id: false }
);

const merkleTreeSchema = new mongoose.Schema(
  {
    root: {
      type: String,
      required: true,
      trim: true,
    },
    leaves: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    proofs: [proofSchema],
    // Optional: Link to the batch of diplomas this merkle tree represents
    diploma_batch_id: {
      type: String,
      trim: true,
    },
    tx_hash: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
merkleTreeSchema.index({ root: 1 });
merkleTreeSchema.index({ diploma_batch_id: 1 });

module.exports = mongoose.model("MerkleTree", merkleTreeSchema);
