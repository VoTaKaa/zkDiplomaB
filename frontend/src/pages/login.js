import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ZuniLogo from "../assets/ZUNI.svg";
import UIT from "../assets/UIT.svg";
import BackgroundImage from "../assets/bgImage.jpg";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { updateUser } from "../redux/slices/userSlice.js";
import Swal from "sweetalert2";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext.js";
import { login } from "../services/apiAuth.js";
import { Helmet } from "react-helmet";

function Login() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [hasAttemptedAutoCheck, setHasAttemptedAutoCheck] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const navigate = useNavigate();
  const {
    account,
    isConnected,
    role,
    disconnectWallet,
    setAccount,
    setIsConnected,
    setRole,
  } = useWallet();

  const handleMetaMaskLogin = async () => {
    try {
      console.log("Starting MetaMask login process...");

      if (!window.ethereum) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask to continue."
        );
      }

      // Request account access
      console.log("Requesting MetaMask accounts...");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please connect to MetaMask.");
      }

      // Get the currently selected account
      const currentAccount = accounts[0];
      console.log("Account selected:", currentAccount);

      // Get provider and check network
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Kiểm tra và chuyển đổi mạng nếu cần
      const requiredChainId = process.env.REACT_APP_CHAIN_ID || "0xaa36a7"; // Sepolia
      const currentChainId = "0x" + network.chainId.toString(16);

      console.log("Current network:", network.name, currentChainId);
      console.log("Required network:", requiredChainId);

      if (currentChainId !== requiredChainId) {
        try {
          // Yêu cầu chuyển đổi mạng
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: requiredChainId }],
          });
        } catch (switchError) {
          // Nếu mạng chưa được thêm vào MetaMask, thêm mạng mới
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: requiredChainId,
                    chainName: process.env.REACT_APP_CHAIN_NAME || "Sepolia",
                    rpcUrls: [
                      process.env.REACT_APP_RPC_URL ||
                        "https://ethereum-sepolia-rpc.publicnode.com",
                    ],
                    blockExplorerUrls: [
                      process.env.REACT_APP_BLOCK_EXPLORER ||
                        "https://sepolia.etherscan.io/",
                    ],
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                  },
                ],
              });
            } catch (addError) {
              throw new Error("Không thể thêm mạng Sepolia vào MetaMask");
            }
          } else {
            throw new Error("Vui lòng chuyển đổi MetaMask sang mạng Sepolia");
          }
        }
      }

      const signer = await provider.getSigner();

      // Create message to sign
      const message = "Sign this message to authenticate with zkDiploma";

      // Sign message
      console.log("Signing message...");
      const signature = await signer.signMessage(message);

      // Send to backend
      console.log("Sending login request to backend...");
      const response = await login(currentAccount.toLowerCase(), signature);
      console.log("Login response:", response);

      if (response.success || response.status === "SUCCESS") {
        // Update wallet context with correct data
        setAccount(currentAccount);
        setIsConnected(true);

        // Set user role if available
        if (response.data?.role) {
          setRole(response.data.role);
        }

        // Update Redux store with user data
        if (response.data) {
          dispatch(
            updateUser({
              id: response.data.id,
              wallet_address: currentAccount,
              role: response.data.role,
              ...response.data,
            })
          );
        }

        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Đăng nhập thành công với MetaMask",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          // Navigate based on role
          if (response.data?.role === "ISSUER") {
            navigate("/home-issuer");
          } else if (response.data?.role === "HOLDER") {
            navigate("/degree-holder");
          } else if (response.data?.role === "VERIFIER") {
            navigate("/submited-proofs");
          } else {
            navigate("/login");
          }
        });
      } else {
        throw new Error(response.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("MetaMask login error:", error);

      // Clear wallet state on error
      setAccount("");
      setIsConnected(false);
      setRole("");

      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.message || "Không thể đăng nhập với MetaMask",
      });
    }
  };

  const handleConnect = async () => {
    const now = Date.now();
    console.log(
      "handleConnect called, loading:",
      loading,
      "time since last:",
      now - lastClickTime
    );

    // Debounce: ignore clicks within 1 second
    if (now - lastClickTime < 1000) {
      console.log("Click ignored due to debouncing");
      return;
    }

    if (loading) {
      console.log("Already loading, skipping...");
      return;
    }

    setLastClickTime(now);

    try {
      console.log("Setting loading to true...");
      setLoading(true);
      await handleMetaMaskLogin();
    } catch (error) {
      console.error("Connect error:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.message || "Không thể kết nối với MetaMask",
      });
    } finally {
      console.log("Setting loading to false...");
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setHasAttemptedAutoCheck(false); // Reset flag for future connections
    // Clear any stored tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    Swal.fire({
      icon: "info",
      title: "Đã ngắt kết nối",
      text: "Wallet đã được ngắt kết nối",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // Reset auto-check flag when connection state changes
  useEffect(() => {
    if (!isConnected || !account) {
      setHasAttemptedAutoCheck(false);
    }
  }, [isConnected, account]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("access_token");

      if (token && isConnected && account && role) {
        try {
          // Decode token to check if it's still valid
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            // Token is still valid, navigate to appropriate page
            if (role === "ISSUER") {
              navigate("/home-issuer");
            } else if (role === "HOLDER") {
              navigate("/degree-holder");
            } else if (role === "VERIFIER") {
              navigate("/submited-proofs");
            }
          } else {
            // Token expired, clear everything
            handleDisconnect();
          }
        } catch (error) {
          console.error("Token validation error:", error);
          handleDisconnect();
        }
      }
    };

    // Only check authentication if all required data is available
    // and don't run if we're currently loading or have already checked
    const token = localStorage.getItem("access_token");
    if (
      !loading &&
      !hasAttemptedAutoCheck &&
      token &&
      isConnected &&
      account &&
      role
    ) {
      setHasAttemptedAutoCheck(true);
      checkAuthentication();
    }
  }, [isConnected, account, role, navigate, loading, hasAttemptedAutoCheck]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Helmet>
        <title>Login</title>
      </Helmet>
      {/* Left side */}
      <div
        className="w-full md:w-[40%] flex flex-col justify-center items-center px-6 py-12 bg-white z-10"
        data-aos="fade-right"
      >
        <div className="max-w-md w-full text-center">
          <img
            src={ZuniLogo}
            alt="icon"
            className="w-24 h-24 mx-auto mb-6 hover:scale-110 transition duration-300"
          />
          <h2 className="text-2xl font-bold mb-2 text-[#014AC6]">
            Welcome to zkDiploma!
          </h2>
          <p className="mb-6 text-gray-600">
            Connect your MetaMask wallet to continue
          </p>

          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-[#014AC6] text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                    alt="MetaMask"
                    className="w-6 h-6"
                  />
                  <span>Connect with MetaMask</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-2">Account connected:</p>
                <p className="font-mono text-sm break-all text-gray-800">
                  {account}
                </p>
                {role && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {role}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Disconnect wallet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="hidden md:block md:w-[60%] relative" data-aos="fade-left">
        <img
          src={BackgroundImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <img src={UIT} alt="UIT Logo" className="w-32 h-32" />
        </div>
      </div>
    </div>
  );
}

export default Login;
