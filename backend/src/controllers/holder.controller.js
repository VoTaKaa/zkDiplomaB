const {
  getDiplomasByWalletAddress,
  generateProofOfHoldership,
  submitProofOfHoldership,
} = require("../services/holder.service.js");

/**
 * Controller để lấy thông tin các diploma của holder
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getDiplomasController = async (req, res) => {
  try {
    const { wallet_address } = req.params;

    if (!wallet_address) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    const result = await getDiplomasByWalletAddress(wallet_address);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(error.message === "Holder not found" ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

const generateProofOfHoldershipController = async (req, res) => {
  try {
    const { wallet_address, diploma_id } = req.params;

    const result = await generateProofOfHoldership(wallet_address, diploma_id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(error.message === "Holder not found" ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

const submitProofOfHoldershipController = async (req, res) => {
  try {
    const { wallet_address_verifier, wallet_address_holder, proof, root } =
      req.body;

    const result = await submitProofOfHoldership(
      wallet_address_verifier,
      wallet_address_holder,
      proof,
      root
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDiplomasController,
  generateProofOfHoldershipController,
  submitProofOfHoldershipController,
};
