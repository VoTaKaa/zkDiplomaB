import { ethers } from "ethers";
import axios from "axios";
const URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const contractDiplomaABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_root",
        type: "uint256",
      },
    ],
    name: "addRoot",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_verifier",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "root",
        type: "uint256",
      },
    ],
    name: "DiplomaVerified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "root",
        type: "uint256",
      },
    ],
    name: "RootAdded",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "proofs",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "input",
        type: "uint256",
      },
    ],
    name: "verifyDiploma",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_root",
        type: "uint256",
      },
    ],
    name: "isValidRoot",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "validRoots",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "verifier",
    outputs: [
      {
        internalType: "contract Groth16Verifier",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const addRoot = async ({ root }) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask chưa được cài đặt");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddress = process.env.REACT_APP_DIPLOMA_MANAGER_ADDRESS;

    if (!contractAddress) {
      throw new Error("Địa chỉ contract không hợp lệ");
    }

    const contract = new ethers.Contract(
      contractAddress,
      contractDiplomaABI,
      signer
    );
    console.log(contract);

    const tx = await contract.addRoot(root);
    console.log(tx.hash);

    if (tx) {
      return {
        success: true,
        txHash: tx.hash,
        message: `Thêm root thành công`,
      };
    } else {
      return {
        success: false,
        message: "Không thể thêm root",
      };
    }
  } catch (error) {
    console.error("Lỗi khi thêm root!!");
  }
};

export const verifyProof = async ({ proof, root }) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask chưa được cài đặt");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddress = process.env.REACT_APP_DIPLOMA_MANAGER_ADDRESS;

    if (!contractAddress) {
      throw new Error("Địa chỉ contract không hợp lệ");
    }

    const contract = new ethers.Contract(
      contractAddress,
      contractDiplomaABI,
      signer
    );

    // Check if root is valid first
    const isValid = await contract.isValidRoot(root);
    if (!isValid) {
      return {
        success: false,
        message: "Root không hợp lệ",
      };
    }

    // Proceed with verification
    const tx = await contract.verifyDiploma(proof, root);
    const receipt = await tx.wait();

    // Check for DiplomaVerified event
    const verifiedEvent = receipt.logs.find(
      (log) => log.eventName === "DiplomaVerified"
    );

    if (verifiedEvent) {
      return {
        success: true,
        txHash: tx.hash,
        message: `Xác thực thành công`,
      };
    } else {
      return {
        success: false,
        message: "Xác thực thất bại",
      };
    }
  } catch (error) {
    console.error("Lỗi khi xác thực:", error);
    return {
      success: false,
      message: error.message || "Lỗi khi xác thực",
    };
  }
};

export const checkRootValidity = async (root) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask chưa được cài đặt");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contractAddress = process.env.REACT_APP_DIPLOMA_MANAGER_ADDRESS;

    if (!contractAddress) {
      throw new Error("Địa chỉ contract không hợp lệ");
    }

    const contract = new ethers.Contract(
      contractAddress,
      contractDiplomaABI,
      provider
    );

    const isValid = await contract.isValidRoot(root);
    return {
      success: true,
      isValid,
      message: isValid ? "Root hợp lệ" : "Root không hợp lệ",
    };
  } catch (error) {
    console.error("Lỗi khi kiểm tra root:", error);
    return {
      success: false,
      isValid: false,
      message: error.message || "Lỗi khi kiểm tra root",
    };
  }
};
