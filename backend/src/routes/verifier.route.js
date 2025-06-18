const express = require("express");
const {
  getSubmittedProofsController,
  updateSubmittedProofController,
} = require("../controllers/verifier.controller.js");

const router = express.Router();

router.get("/submitted-proofs/:wallet_address", getSubmittedProofsController);
router.put("/update-submitted-proof", updateSubmittedProofController);

module.exports = router;
