import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  // Initialize state from localStorage
  const [account, setAccount] = useState(() => {
    return localStorage.getItem("wallet_account") || "";
  });
  const [isConnected, setIsConnected] = useState(() => {
    return localStorage.getItem("wallet_connected") === "true";
  });
  const [role, setRole] = useState(() => {
    return localStorage.getItem("wallet_role") || "";
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (account) {
      localStorage.setItem("wallet_account", account);
    } else {
      localStorage.removeItem("wallet_account");
    }
  }, [account]);

  useEffect(() => {
    localStorage.setItem("wallet_connected", isConnected.toString());
  }, [isConnected]);

  useEffect(() => {
    if (role) {
      localStorage.setItem("wallet_role", role);
    } else {
      localStorage.removeItem("wallet_role");
    }
  }, [role]);

  // Callback functions for MetaMask events
  const handleAccountsChanged = useCallback(
    (accounts) => {
      console.log("Accounts changed:", accounts);
      if (accounts.length === 0) {
        // User disconnected
        setAccount("");
        setIsConnected(false);
        setRole("");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } else if (accounts[0] !== account) {
        // User switched accounts - need to re-authenticate
        setAccount(accounts[0]);
        setIsConnected(true);
        // Clear role until re-authentication
        setRole("");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/logout";
      }
    },
    [account]
  );

  const handleChainChanged = useCallback((chainId) => {
    console.log("Chain changed to:", chainId);
    // Optionally reload the page or show notification
    // For now, just log the change
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log("MetaMask disconnected");
    setAccount("");
    setIsConnected(false);
    setRole("");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }, []);

  // Listen for MetaMask events
  useEffect(() => {
    if (window.ethereum) {
      // Add event listeners
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("disconnect", handleDisconnect);

      // Cleanup event listeners
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
          window.ethereum.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [handleAccountsChanged, handleChainChanged, handleDisconnect]);

  // // Check initial connection state
  // useEffect(() => {
  //   const checkInitialConnection = async () => {
  //     // Only check if we have stored state that claims to be connected
  //     if (window.ethereum && isConnected && account) {
  //       try {
  //         // Use eth_accounts instead of eth_requestAccounts to avoid popup
  //         const accounts = await window.ethereum.request({
  //           method: "eth_accounts",
  //         });

  //         if (
  //           accounts.length === 0 ||
  //           accounts[0].toLowerCase() !== account.toLowerCase()
  //         ) {
  //           // MetaMask state doesn't match our stored state
  //           console.log("MetaMask state mismatch, clearing stored state");
  //           setAccount("");
  //           setIsConnected(false);
  //           setRole("");
  //         }
  //       } catch (error) {
  //         console.error("Error checking MetaMask connection:", error);
  //         // Clear state if there's an error
  //         setAccount("");
  //         setIsConnected(false);
  //         setRole("");
  //       }
  //     }
  //   };

  //   // Add a small delay to avoid race conditions with login component
  //   const timeoutId = setTimeout(() => {
  //     checkInitialConnection();
  //   }, 100);

  //   return () => clearTimeout(timeoutId);
  // }, []); // Only run once on mount

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error(
          "MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask để sử dụng tính năng này."
        );
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error(
          "Không tìm thấy tài khoản. Vui lòng kết nối với MetaMask."
        );
      }

      // Set account and connected state
      setAccount(accounts[0]);
      setIsConnected(true);

      return accounts[0]; // Return the account for immediate use
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      throw error;
    }
  };

  const disconnectWallet = useCallback(() => {
    setAccount("");
    setIsConnected(false);
    setRole("");
    // Clear localStorage tokens when disconnecting
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("wallet_account");
    localStorage.removeItem("wallet_connected");
    localStorage.removeItem("wallet_role");
  }, []);

  const setWalletAccount = useCallback((walletAddress) => {
    if (walletAddress && typeof walletAddress === "string") {
      setAccount(walletAddress);
      setIsConnected(true);
    }
  }, []);

  const setUserRole = useCallback((userRole) => {
    if (userRole && typeof userRole === "string") {
      setRole(userRole);
    }
  }, []);

  // Validation function to check if wallet state is valid
  const isWalletStateValid = useCallback(() => {
    return (
      account &&
      isConnected &&
      account.startsWith("0x") &&
      account.length === 42
    );
  }, [account, isConnected]);

  const contextValue = {
    account,
    isConnected,
    role,
    connectWallet,
    disconnectWallet,
    setWalletAccount,
    setUserRole,
    setAccount,
    setIsConnected,
    setRole,
    isWalletStateValid,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet phải được sử dụng trong WalletProvider");
  }
  return context;
};
