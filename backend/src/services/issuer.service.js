const { buildPoseidon } = require("circomlibjs");
const { prepareDiplomaData, createMerkleTree } = require("../utils/utils.js");
const Diploma = require("../models/diploma.model.js");
const ProcessedDiploma = require("../models/processed_diploma.model.js");
const MerkleTree = require("../models/merkle_tree.model.js");

const createDiplomasService = async (diplomas) => {
  const processedData = await prepareDiplomaData(diplomas);
  const merkleData = await createMerkleTree(processedData);

  const merkleTree = await MerkleTree.findOne({ root: merkleData.root });
  if (merkleTree) {
    throw new Error("Merkle tree already exists");
  }

  const insertedDiplomas = await Diploma.insertMany(
    diplomas.map((data) => ({
      ...data,
      wallet_address: data.wallet_address.toLowerCase(),
    }))
  );

  // Save Merkle tree data to database
  const savedMerkleTree = await MerkleTree.create({
    root: merkleData.root,
    leaves: merkleData.leaves,
    proofs: merkleData.proofs,
    diploma_batch_id: `batch_${Date.now()}`, // Generate a unique batch ID
  });

  const processedDiplomas = await ProcessedDiploma.insertMany(
    processedData.map((data, index) => ({
      diploma_id: insertedDiplomas[index]._id,
      root: merkleData.root,
      nameHash: data.nameHash,
      majorCode: data.majorCode,
      studentId: data.studentId,
      issueDate: data.issueDate,
      leafHash: data.leafHash,
    }))
  );

  return {
    merkleData,
    insertedDiplomas,
    processedDiplomas,
    savedMerkleTree,
  };
};

const getMerkleTreeService = async (root) => {
  const merkleTree = await MerkleTree.findOne({ root });
  if (!merkleTree) {
    throw new Error("Merkle tree not found");
  }
  return merkleTree;
};

const getAllMerkleTreesService = async () => {
  const merkleTrees = await MerkleTree.find().sort({ createdAt: -1 });
  return merkleTrees;
};

const getMerkleTreeByBatchIdService = async (batchId) => {
  const merkleTree = await MerkleTree.findOne({ diploma_batch_id: batchId });
  if (!merkleTree) {
    throw new Error("Merkle tree not found for the given batch ID");
  }
  return merkleTree;
};

const updateMerkleTreeTxHashService = async (root, txHash) => {
  const merkleTree = await MerkleTree.findOneAndUpdate(
    { root },
    { tx_hash: txHash },
    { new: true }
  );
  return merkleTree;
};

module.exports = {
  createDiplomasService,
  getMerkleTreeService,
  getAllMerkleTreesService,
  getMerkleTreeByBatchIdService,
  updateMerkleTreeTxHashService,
};
