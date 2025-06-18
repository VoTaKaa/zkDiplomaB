const SubmittedProof = require("../models/submitted_proof.js");

/**
 * Lấy thông tin các diploma dựa trên wallet_address
 * @param {string} wallet_address - Địa chỉ ví của holder
 * @returns {Promise<Object>} - Thông tin holder và danh sách diploma
 */
const getSubmittedProofs = async (wallet_address) => {
  try {
    // Lấy tất cả diploma của holder
    const submittedProofs = await SubmittedProof.find({
      wallet_address_verifier: wallet_address.toLowerCase(),
    });

    return submittedProofs;
  } catch (error) {
    throw error;
  }
};

const updateSubmittedProof = async (submittedProofId, txHash) => {
  const submittedProof = await SubmittedProof.findByIdAndUpdate(
    submittedProofId,
    { tx_hash: txHash, verified: true },
    { new: true }
  );
  return submittedProof;
};

module.exports = {
  getSubmittedProofs,
  updateSubmittedProof,
};
