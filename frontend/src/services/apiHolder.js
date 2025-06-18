import axios from "axios";
const URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

export const getUserInfo = async () => {
  try {
    const response = await axios.get(`${URL}/holders/get-details`, {
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

export const getDiplomaInfo = async (wallet_address) => {
  try {
    const response = await axios.get(
      `${URL}/holder/${wallet_address}/diplomas`
    );
    return response.data;
  } catch (error) {
    return {
      message: error.response.data.message,
      status: "ERROR",
    };
  }
};

export const generateProof = async (wallet_address, diploma_id) => {
  try {
    const response = await axios.post(
      `${URL}/holder/${wallet_address}/diplomas/${diploma_id}/proof`,
      {}
    );
    return response.data;
  } catch (error) {
    return {
      message: error.response?.data?.message || "Error generating proof",
      status: "ERROR",
    };
  }
};

export const sendProof = async (data) => {
  try {
    const response = await axios.post(`${URL}/holder/proof`, data);
    return response.data;
  } catch (error) {
    return {
      message: error.response?.data?.message || "Error sending proof",
      status: "ERROR",
    };
  }
};

export const sendProof2Verifier = async (verifer_did, data) => {
  try {
    console.log(data);
    const response = await axios.post(
      `${URL}/holders/verifiers/proofs/${verifer_did}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      message: error.response.data.message,
      status: "ERROR",
    };
  }
};
