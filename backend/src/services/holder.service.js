const Holder = require("../models/holder.model.js");
const Diploma = require("../models/diploma.model.js");
const ProcessedDiploma = require("../models/processed_diploma.model.js");
const SubmittedProof = require("../models/submitted_proof.js");
const Verifier = require("../models/verifier.model.js");
const MerkleTree = require("../models/merkle_tree.model.js");
const { generateProof } = require("../utils/utils.js");

/**
 * Lấy thông tin các diploma dựa trên wallet_address
 * @param {string} wallet_address - Địa chỉ ví của holder
 * @returns {Promise<Object>} - Thông tin holder và danh sách diploma
 */
const getDiplomasByWalletAddress = async (wallet_address) => {
  try {
    // Lấy tất cả diploma của holder
    const diplomas = await Diploma.find({
      wallet_address: wallet_address.toLowerCase(),
    });

    return {
      diplomas: diplomas.map((diploma) => ({
        id: diploma._id,
        last_name: diploma.last_name,
        first_name: diploma.first_name,
        date_of_birth: diploma.date_of_birth,
        place_of_birth: diploma.place_of_birth,
        gender: diploma.gender,
        ethnicity: diploma.ethnicity,
        nationality: diploma.nationality,
        course_duration: diploma.course_duration,
        graduation_year: diploma.graduation_year,
        major: diploma.major,
        classification: diploma.classification,
        gpa: diploma.gpa,
        study_type: diploma.study_type,
        certificate_number: diploma.certificate_number,
        old_certificate_number: diploma.old_certificate_number,
        decision_number: diploma.decision_number,
        book_number: diploma.book_number,
        issue_date: diploma.issue_date,
        institution_code: diploma.institution_code,
        student_id: diploma.student_id,
        wallet_address: diploma.wallet_address,
      })),
    };
  } catch (error) {
    throw error;
  }
};

const generateProofOfHoldership = async (wallet_address, diploma_id) => {
  try {
    // Kiểm tra diploma có thuộc về holder không
    const diploma = await Diploma.findOne({
      _id: diploma_id,
      wallet_address,
    });
    if (!diploma) {
      throw new Error(
        "Diploma not found or does not belong to this wallet address"
      );
    }

    // Lấy thông tin processed diploma
    const processedDiploma = await ProcessedDiploma.findOne({
      diploma_id: diploma_id,
    });
    if (!processedDiploma) {
      throw new Error("Processed diploma not found");
    }

    // Lấy thông tin merkle tree và proof
    const merkleTree = await MerkleTree.findOne({
      root: processedDiploma.root,
      leaves: { $in: [processedDiploma.leafHash] },
    });
    if (!merkleTree) {
      throw new Error("Merkle tree not found");
    }

    // Tìm proof tương ứng với leaf hash của diploma
    const proof = merkleTree.proofs.find(
      (p) => p.leaf === processedDiploma.leafHash
    );
    if (!proof) {
      throw new Error("Proof not found for this diploma");
    }

    const data = {
      nameHash: processedDiploma.nameHash,
      majorCode: processedDiploma.majorCode,
      studentId: processedDiploma.studentId,
      issueDate: processedDiploma.issueDate,
      root: merkleTree.root,
      pathIndices: proof.pathIndices,
      siblings: proof.siblings,
    };

    const finalProof = await generateProof(data);

    // Format dữ liệu theo yêu cầu
    return {
      proof: finalProof,
      root: merkleTree.root,
    };
  } catch (error) {
    throw error;
  }
};

const submitProofOfHoldership = async (
  wallet_address_verifier,
  wallet_address_holder,
  proof,
  root
) => {
  try {
    const verifier = await Verifier.findOne({
      wallet_address: wallet_address_verifier.toLowerCase(),
    });
    if (!verifier) {
      await Verifier.create({
        wallet_address: wallet_address_verifier.toLowerCase(),
      });
    }
    const submittedProof = await SubmittedProof.create({
      wallet_address_verifier: wallet_address_verifier.toLowerCase(),
      wallet_address_holder: wallet_address_holder.toLowerCase(),
      proof,
      root,
    });

    return submittedProof;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getDiplomasByWalletAddress,
  generateProofOfHoldership,
  submitProofOfHoldership,
};
