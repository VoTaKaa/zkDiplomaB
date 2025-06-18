import { useEffect } from "react";
import { useWallet } from "../context/WalletContext.js";

// Hook to periodically check MetaMask connection
export const useMetaMaskConnectionCheck = () => {
  const { isConnected, account, setWalletAccount, disconnectWallet } =
    useWallet();

  useEffect(() => {
    if (!isConnected || !account) return;

    const checkConnection = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length === 0) {
            // MetaMask disconnected, clear our state
            console.log("MetaMask disconnected, clearing wallet state");
            disconnectWallet();
          } else if (accounts[0].toLowerCase() !== account.toLowerCase()) {
            // Account changed
            console.log("MetaMask account changed:", accounts[0]);
            setWalletAccount(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Error checking MetaMask connection:", error);
        // If there's an error, assume disconnected
        disconnectWallet();
      }
    };

    // Check immediately
    checkConnection();

    // Set up periodic checks every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, [isConnected, account, setWalletAccount, disconnectWallet]);
};
