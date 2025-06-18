const Issuer = require("../models/issuer.model.js");
const { ethers } = require("ethers");
const Holder = require("../models/holder.model.js");
const Verifier = require("../models/verifier.model.js");
const Diploma = require("../models/diploma.model.js");

const verifySignature = (message, signature, wallet_address) => {
  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === wallet_address.toLowerCase();
  } catch (error) {
    return false;
  }
};

const createIssuer = async (wallet_address) => {
  const existingIssuer = await Issuer.findOne({
    wallet_address: wallet_address.toLowerCase(),
  });

  if (existingIssuer) {
    throw new Error("Issuer already exists");
  }
  const issuer = await Issuer.create({
    wallet_address: wallet_address.toLowerCase(),
  });

  return issuer;
};

const createHolder = async (wallet_address) => {
  const existingHolder = await Holder.findOne({
    wallet_address: wallet_address.toLowerCase(),
  });
  if (existingHolder) {
    throw new Error("Holder already exists");
  }
  const holder = await Holder.create({
    wallet_address: wallet_address.toLowerCase(),
  });
  return holder;
};

const createVerifier = async (wallet_address) => {
  const existingVerifier = await Verifier.findOne({
    wallet_address: wallet_address.toLowerCase(),
  });
  if (existingVerifier) {
    throw new Error("Verifier already exists");
  }
  const verifier = await Verifier.create({
    wallet_address: wallet_address.toLowerCase(),
  });
  return verifier;
};

const login = async (wallet_address, signature) => {
  const message = `Sign this message to authenticate with zkDiploma`;
  if (!verifySignature(message, signature, wallet_address.toLowerCase())) {
    throw new Error("Invalid signature");
  }
  let user = await Issuer.findOne({
    wallet_address: wallet_address.toLowerCase(),
  });
  let role = "ISSUER";

  if (!user) {
    user = await Diploma.findOne({
      wallet_address: wallet_address.toLowerCase(),
    });
    role = "HOLDER";
  }

  if (!user) {
    user = await Verifier.findOne({
      wallet_address: wallet_address.toLowerCase(),
    });
    role = "VERIFIER";
  }

  if (!user) {
    await createHolder(wallet_address.toLowerCase());
    user = await Holder.findOne({
      wallet_address: wallet_address.toLowerCase(),
    });
    role = "HOLDER";
  }

  return {
    user,
    role,
  };
};

module.exports = { createIssuer, createHolder, createVerifier, login };
