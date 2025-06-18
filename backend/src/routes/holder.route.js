const express = require("express");
const {
  getDiplomasController,
  generateProofOfHoldershipController,
  submitProofOfHoldershipController,
} = require("../controllers/holder.controller.js");

const router = express.Router();

// GET /api/holder/:wallet_address/diplomas
router.get("/:wallet_address/diplomas", getDiplomasController);

// POST /api/holder/:wallet_address/diplomas/:diploma_id/proof
router.post(
  "/:wallet_address/diplomas/:diploma_id/proof",
  generateProofOfHoldershipController
);

// POST /api/holder/proof
router.post("/proof", submitProofOfHoldershipController);

module.exports = router;
