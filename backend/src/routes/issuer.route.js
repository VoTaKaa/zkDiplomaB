const express = require("express");
const {
  createDiplomasController,
  getMerkleTreeController,
  getAllMerkleTreesController,
  getMerkleTreeByBatchIdController,
  updateMerkleTreeTxHashController,
} = require("../controllers/isssuer.controller.js");

const router = express.Router();

router.post("/create-diplomas", createDiplomasController);

// Merkle tree routes
router.get("/merkle-trees", getAllMerkleTreesController);
router.get("/merkle-tree/root/:root", getMerkleTreeController);
router.get("/merkle-tree/batch/:batchId", getMerkleTreeByBatchIdController);
router.put("/merkle-tree/tx-hash", updateMerkleTreeTxHashController);

module.exports = router;
