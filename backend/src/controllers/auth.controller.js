const {
  createIssuer,
  createHolder,
  createVerifier,
  login,
} = require("../services/auth.service.js");

const createIssuerController = async (req, res) => {
  try {
    const { wallet_address } = req.body;
    const issuer = await createIssuer(wallet_address);
    res.status(201).json({
      success: true,
      message: "Issuer created successfully",
      data: issuer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createHolderController = async (req, res) => {
  try {
    const { wallet_address } = req.body;
    const holder = await createHolder(wallet_address);
    res.status(201).json({
      success: true,
      message: "Holder created successfully",
      data: holder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createVerifierController = async (req, res) => {
  try {
    const { wallet_address } = req.body;
    const verifier = await createVerifier(wallet_address);
    res.status(201).json({
      success: true,
      message: "Verifier created successfully",
      data: verifier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { wallet_address, signature } = req.body;
    const { user, role } = await login(wallet_address, signature);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, role },
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
  createIssuerController,
  createHolderController,
  createVerifierController,
  loginController,
};
