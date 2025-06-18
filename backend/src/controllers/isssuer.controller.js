const {
  createDiplomasService,
  getMerkleTreeService,
  getAllMerkleTreesService,
  getMerkleTreeByBatchIdService,
  updateMerkleTreeTxHashService,
} = require("../services/issuer.service.js");

const createDiplomasController = async (req, res) => {
  try {
    const { diplomas } = req.body;
    const merkleTree = await createDiplomasService(diplomas);
    res.status(200).json({
      success: true,
      message: "Merkle tree created successfully",
      data: merkleTree,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.message,
    });
  }
};

const getMerkleTreeController = async (req, res) => {
  try {
    const { root } = req.params;
    const merkleTree = await getMerkleTreeService(root);
    res.status(200).json({
      success: true,
      message: "Merkle tree retrieved successfully",
      data: merkleTree,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllMerkleTreesController = async (req, res) => {
  try {
    const merkleTrees = await getAllMerkleTreesService();
    res.status(200).json({
      success: true,
      message: "Merkle trees retrieved successfully",
      data: merkleTrees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getMerkleTreeByBatchIdController = async (req, res) => {
  try {
    const { batchId } = req.params;
    const merkleTree = await getMerkleTreeByBatchIdService(batchId);
    res.status(200).json({
      success: true,
      message: "Merkle tree retrieved successfully",
      data: merkleTree,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const updateMerkleTreeTxHashController = async (req, res) => {
  try {
    const { root, txHash } = req.body;
    const merkleTree = await updateMerkleTreeTxHashService(root, txHash);
    res.status(200).json({
      success: true,
      message: "Merkle tree tx hash updated successfully",
      data: merkleTree,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createDiplomasController,
  getMerkleTreeController,
  getAllMerkleTreesController,
  getMerkleTreeByBatchIdController,
  updateMerkleTreeTxHashController,
};
