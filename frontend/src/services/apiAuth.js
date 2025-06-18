import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ethers } from "ethers";

const URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const login = async (wallet_address, signature) => {
  try {
    console.log("Sending request to:", `${URL}/auth/login`);
    console.log("Request data:", { wallet_address, signature });

    const response = await axios.post(`${URL}/auth/login`, {
      wallet_address,
      signature,
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error.response || error);
    return {
      message: error.response?.data?.message || error.message,
      status: "ERROR",
    };
  }
};

export const connectMetaMask = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask chưa được cài đặt");
    }

    // Yêu cầu kết nối tài khoản
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const address = accounts[0];

    // Kiểm tra và chuyển mạng nếu cần
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const targetChainId = "0x13882"; // Polygon Amoy Testnet

    if (chainId !== targetChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: targetChainId,
                chainName: "Polygon Amoy Testnet",
                nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
                rpcUrls: ["https://rpc-amoy.polygon.technology"],
                blockExplorerUrls: ["https://amoy.polygonscan.com/"],
              },
            ],
          });
        } else {
          throw new Error(
            "Vui lòng chuyển mạng MetaMask sang Polygon Amoy Testnet"
          );
        }
      }
    }

    // Lấy provider và signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Tạo message để ký
    const message = "Sign this message to authenticate with our application";

    // Ký message
    const signature = await signer.signMessage(message);

    const response = await axios.post(`${URL}/auth/login-with-metamask`, {
      address,
      signature,
    });

    return response.data;
  } catch (error) {
    console.error("MetaMask connection error:", error);
    return {
      message: error.message || "Lỗi kết nối MetaMask",
      status: "ERROR",
    };
  }
};

export const signupStudents = async (data) => {
  try {
    const response = await axios.post(`${URL}/auth/holders`, data, {
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

export const refreshTokenn = async (refreshToken) => {
  try {
    console.log("refreshToken", refreshToken);
    const response = await fetch(`${URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    const data = await response.json();
    return data.data.access_token; // Trả về accessToken mới
  } catch (error) {
    console.error("Error in refreshToken:", error);
    throw error;
  }
};

export const ensureValidToken = async (dispatch, resetUser, refreshToken) => {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    dispatch(resetUser());
    throw new Error("Access token not found.");
  }

  const decoded = jwtDecode(accessToken);
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    // Access token hết hạn, làm mới token
    const data = await refreshTokenn(refreshToken);
    console.log("data2", data);
    localStorage.setItem("access_token", data);
    return data;
  }

  return accessToken; // Trả về accessToken hợp lệ
};

const roleEndpoints = {
  issuers: "issuers",
  verifiers: "verifiers",
  holders: "holders",
};

export const getUserDetails = async (userId, token, role) => {
  try {
    const endpoint = roleEndpoints[role];

    if (!endpoint) {
      throw new Error(`Unsupported role: ${role}`);
    }

    const response = await fetch(`${URL}/${endpoint}/get-details/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getUserDetails:", error);
    throw error;
  }
};
