import { ethers, AbiCoder } from "ethers";
import axios from "axios";
const URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Utility function to check and switch network
const ensureCorrectNetwork = async (provider) => {
  const network = await provider.getNetwork();
  const requiredChainId = parseInt(
    process.env.REACT_APP_CHAIN_ID || "0xaa36a7",
    16
  );

  if (network.chainId !== BigInt(requiredChainId)) {
    const chainName = process.env.REACT_APP_CHAIN_NAME || "Sepolia";
    throw new Error(
      `Vui lòng chuyển MetaMask sang mạng ${chainName} (Chain ID: ${
        process.env.REACT_APP_CHAIN_ID || "0xaa36a7"
      })`
    );
  }
};

// Export function to get network info for UI
export const getNetworkInfo = () => {
  return {
    chainId: process.env.REACT_APP_CHAIN_ID || "0xaa36a7",
    chainName: process.env.REACT_APP_CHAIN_NAME || "Sepolia",
    rpcUrl:
      process.env.REACT_APP_RPC_URL ||
      "https://ethereum-sepolia-rpc.publicnode.com",
    blockExplorer:
      process.env.REACT_APP_BLOCK_EXPLORER || "https://sepolia.etherscan.io/",
    contractAddress: process.env.REACT_APP_DIPLOMA_MANAGER_ADDRESS,
  };
};

const contractDiplomaABI = [
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
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "a",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2][2]",
        name: "b",
        type: "uint256[2][2]",
      },
      {
        internalType: "uint256[2]",
        name: "c",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[1]",
        name: "input",
        type: "uint256[1]",
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
];

// Hàm chuyển đổi BigInt sang hex
export const bigIntToHex = (bigIntValue) => {
  // Convert BigInt to hex string with 0x prefix
  return "0x" + BigInt(bigIntValue).toString(16);
};

// Hàm chuyển đổi hex sang BigInt
export const hexToBigInt = (hexValue) => {
  return BigInt(hexValue);
};

export const addRoot = async ({ root }) => {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask chưa được cài đặt");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    await ensureCorrectNetwork(provider);
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
    await ensureCorrectNetwork(provider);
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

    const a = [proof[0][0].toString(), proof[0][1].toString()];
    const b = [
      [proof[1][0][0].toString(), proof[1][0][1].toString()],
      [proof[1][1][0].toString(), proof[1][1][1].toString()],
    ];
    const c = [proof[2][0].toString(), proof[2][1].toString()];
    const input = [root.toString()];

    console.log("a:", a);
    console.log("b:", b);
    console.log("c:", c);
    console.log("input:", input);

    // Proceed with verification
    const tx = await contract.verifyDiploma(a, b, c, input);
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
    await ensureCorrectNetwork(provider);
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
    console.log("VALID ROOT", root, isValid);

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
