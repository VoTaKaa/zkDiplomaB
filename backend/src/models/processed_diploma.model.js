const mongoose = require("mongoose");

const processedDiplomaSchema = new mongoose.Schema(
  {
    diploma_id: {
      type: String,
      required: true,
      trim: true,
    },
    root: {
      type: String,
      required: true,
      trim: true,
    },
    nameHash: {
      type: String,
      required: true,
      trim: true,
    },
    majorCode: {
      type: Number,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: String,
      required: true,
      trim: true,
    },
    leafHash: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
processedDiplomaSchema.index({ diploma_id: 1 });
processedDiplomaSchema.index({ studentId: 1 });
processedDiplomaSchema.index({ leafHash: 1 });

module.exports = mongoose.model("ProcessedDiploma", processedDiplomaSchema);
