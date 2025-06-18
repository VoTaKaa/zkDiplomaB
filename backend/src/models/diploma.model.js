const mongoose = require("mongoose");

const diplomaSchema = new mongoose.Schema(
  {
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    date_of_birth: {
      type: Date,
      required: true,
    },
    place_of_birth: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    ethnicity: {
      type: String,
      required: true,
      trim: true,
    },
    nationality: {
      type: String,
      required: true,
      trim: true,
    },
    course_duration: {
      type: String,
      required: true,
      trim: true,
    },
    graduation_year: {
      type: Number,
      required: true,
    },
    major: {
      type: String,
      required: true,
      trim: true,
    },
    classification: {
      type: String,
      required: true,
      trim: true,
    },
    gpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    study_type: {
      type: String,
      required: true,
      trim: true,
    },
    certificate_number: {
      type: String,
      required: true,
      trim: true,
    },
    old_certificate_number: {
      type: String,
      default: null,
      trim: true,
    },
    decision_number: {
      type: String,
      required: true,
      trim: true,
    },
    book_number: {
      type: String,
      required: true,
      trim: true,
    },
    issue_date: {
      type: Date,
      required: true,
    },
    institution_code: {
      type: String,
      required: true,
      trim: true,
    },
    student_id: {
      type: String,
      required: true,
      trim: true,
    },
    wallet_address: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Diploma", diplomaSchema);
