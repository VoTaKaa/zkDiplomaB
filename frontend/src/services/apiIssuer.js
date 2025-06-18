import axios from "axios";
const URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

export const getIssuerInfo = async () => {
  try {
    const response = await axios.get(`${URL}/issuers/get-details`, {
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

export const createDiplomas = async (data) => {
  try {
    console.log("Data:", data);
    const response = await axios.post(`${URL}/issuer/create-diplomas`, {
      diplomas: data,
    });
    return response.data;
  } catch (error) {
    return {
      message: error.response.data.message,
      status: "ERROR",
    };
  }
};

export const getAllDegrees = async (page = 1) => {
  try {
    const response = await axios.get(`${URL}/issuers/degrees?page=${page}`, {
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

export const getAllHolder = async (page) => {
  try {
    const response = await axios.get(
      `${URL}/issuers/get-all-holder?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      message: error.response?.data?.message || "An error occurred",
      status: "ERROR",
    };
  }
};

export const updateTxs = async (root, txs) => {
  try {
    const response = await axios.put(`${URL}/issuer/merkle-tree/tx-hash`, {
      root,
      txHash: txs,
    });
    return response.data;
  } catch (error) {
    return {
      message: error.response.data.message,
      status: "ERROR",
    };
  }
};
