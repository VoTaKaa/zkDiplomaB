const {
  getSubmittedProofs,
  updateSubmittedProof,
} = require("../services/verifier.service.js");

const getSubmittedProofsController = async (req, res) => {
  try {
    const { wallet_address } = req.params;
    const submittedProofs = await getSubmittedProofs(wallet_address);
    res.status(200).json({
      success: true,
      data: submittedProofs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSubmittedProofController = async (req, res) => {
  try {
    const { submittedProofId, txHash } = req.body;
    const submittedProof = await updateSubmittedProof(submittedProofId, txHash);
    res.status(200).json({
      success: true,
      message: "Submitted proof updated successfully",
      data: submittedProof,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSubmittedProofsController,
  updateSubmittedProofController,
};
