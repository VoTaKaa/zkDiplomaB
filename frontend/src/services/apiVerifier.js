import axios from "axios";
const URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

export const checkVerifier = async (verifier_did) => {
  try {
    const response = await axios.get(`${URL}/verifiers/check/${verifier_did}`);
    return response.data;
  } catch (error) {
    return {
      message: error.response.data.message,
      status: "ERROR",
    };
  }
};

export const getVerifierInfo = async () => {
  try {
    const response = await axios.get(`${URL}/verifiers/get-details`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error) {
    return {
      message: error.response.data.message,
      status: "ERROR",
    };
  }
};

export const getAllSummittedPoofs = async () => {
  try {
    const response = await axios.get(`${URL}/verifiers/proofs`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
    return response.data;
  } catch (error) {
    return {
      message: error.response.data.message,
      status: "ERROR",
    };
  }
};

export const getSubmittedProofs = async (wallet_address) => {
  try {
    console.log(wallet_address);
    const response = await axios.get(
      `${URL}/verifier/submitted-proofs/${wallet_address}`
    );
    return response.data;
  } catch (error) {
    return {
      message:
        error.response?.data?.message || "Error fetching submitted proofs",
      status: "ERROR",
    };
  }
};

export const updateSubmittedProof = async (proofId, txHash) => {
  try {
    const response = await axios.put(`${URL}/verifier/update-submitted-proof`, {
      submittedProofId: proofId,
      txHash: txHash,
    });
    return response.data;
  } catch (error) {
    return {
      message: error.response.data.message,
      status: "ERROR",
    };
  }
};
