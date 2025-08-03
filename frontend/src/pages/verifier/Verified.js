import React, { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader.js";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faWallet,
  faCalendarAlt,
  faFileAlt,
  faKey,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  getSubmittedProofs,
  updateSubmittedProof,
} from "../../services/apiVerifier.js";
import {
  verifyProof,
  checkRootValidity,
} from "../../services/blockchain.service.js";
import Swal from "sweetalert2";
import { ethers, AbiCoder } from "ethers";

const Verified = () => {
  const [proofs, setProofs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifyingProofId, setVerifyingProofId] = useState(null);
  const [rootStatuses, setRootStatuses] = useState({});

  useEffect(() => {
    const fetchProofs = async () => {
      try {
        setIsLoading(true);
        const walletAddress = localStorage.getItem("wallet_account");
        const result = await getSubmittedProofs(walletAddress);
        console.log(result);
        if (!result.success) {
          throw new Error(result.message || "Failed to fetch proofs");
        }

        setProofs(result.data);

        // Check root validity for each proof
        const statuses = {};
        for (const proof of result.data) {
          const rootStatus = await checkRootValidity(proof.root);
          statuses[proof._id] = rootStatus;
        }
        setRootStatuses(statuses);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProofs();
  }, []);

  const handleVerify = async (proof) => {
    try {
      setVerifyingProofId(proof._id);

      if (!window.ethereum) {
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "Vui lòng cài đặt MetaMask để tiếp tục",
        });
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      const targetChainId = process.env.REACT_APP_CHAIN_ID;
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
                  chainName: process.env.REACT_APP_CHAIN_NAME,
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: [process.env.REACT_APP_RPC_URL],
                  blockExplorerUrls: [process.env.REACT_APP_BLOCK_EXPLORER],
                },
              ],
            });
          } else {
            return Swal.fire({
              icon: "error",
              title: "Error",
              text: "Please switch to the correct network in MetaMask",
            });
          }
        }
      }

      const balance = await provider.getBalance(await signer.getAddress());
      if (balance === 0n) {
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "Your account does not have enough tokens to perform transactions",
        });
      }

      const result = await verifyProof({
        proof: proof.proof,
        root: proof.root,
      });
      console.log(result);

      if (result.success) {
        const responseUpdateSubmittedProof = await updateSubmittedProof(
          proof._id,
          result.txHash
        );
        console.log(
          "ResponseUpdateSubmittedProof:",
          responseUpdateSubmittedProof
        );

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Verification successful!",
          showConfirmButton: false,
          timer: 1500,
        });

        // Refresh the proofs list
        const walletAddress = localStorage.getItem("wallet_account");
        const updatedResult = await getSubmittedProofs(walletAddress);
        if (updatedResult.success) {
          setProofs(updatedResult.data);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Verification failed",
      });
    } finally {
      setVerifyingProofId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const truncateProof = (proof) => {
    if (!proof) return "";
    return `${proof.slice(0, 20)}...${proof.slice(-20)}`;
  };

  return (
    <div className="flex h-screen bg-gray-50 font-adminFont">
      <PageHeader />
      <main className="main-content w-full mt-[64px] overflow-y-auto h-[calc(100%-64px)]">
        <Helmet>
          <title>Submitted Proofs</title>
        </Helmet>

        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="sm:flex sm:items-center mb-8">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Submitted Proofs
                </h1>
                <p className="mt-2 text-sm text-gray-700">
                  A list of all proofs that have been submitted to you for
                  verification.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="text-blue-600 text-4xl animate-spin"
                />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                {error}
              </div>
            ) : proofs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                No proofs have been submitted yet.
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {proofs
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )
                  .map((proof) => (
                    <div
                      key={proof._id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-blue-600">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="mr-2"
                            />
                            <span className="font-medium">Proof Details</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className="mr-1"
                            />
                            {formatDate(proof.created_at)}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 block">
                              From Holder
                            </label>
                            <div className="flex items-center text-sm">
                              <FontAwesomeIcon
                                icon={faWallet}
                                className="text-gray-400 mr-2"
                              />
                              <span className="font-mono">
                                {proof.wallet_address_holder}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-gray-500 block">
                              Proof
                            </label>
                            <div className="flex items-center text-sm">
                              <FontAwesomeIcon
                                icon={faFileAlt}
                                className="text-gray-400 mr-2"
                              />
                              <span className="font-mono">
                                {truncateProof(proof.proof)}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-gray-500 block">
                              Root Status
                            </label>
                            <div className="flex items-center text-sm">
                              {rootStatuses[proof._id] ? (
                                rootStatuses[proof._id].isValid ? (
                                  <div className="flex items-center text-green-600">
                                    <FontAwesomeIcon
                                      icon={faCircleCheck}
                                      className="mr-2"
                                    />
                                    <span>Root valid</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-red-600">
                                    <FontAwesomeIcon
                                      icon={faCircleXmark}
                                      className="mr-2"
                                    />
                                    <span>Root invalid</span>
                                  </div>
                                )
                              ) : (
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  className="text-gray-400 animate-spin"
                                />
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-gray-500 block">
                              Root
                            </label>
                            <div className="flex items-center text-sm">
                              <FontAwesomeIcon
                                icon={faKey}
                                className="text-gray-400 mr-2"
                              />
                              <span className="font-mono text-xs">
                                {proof.root}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-gray-500 block">
                              Verified
                            </label>
                            <div className="flex items-center text-sm">
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className={`mr-2 ${
                                  proof.verified
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              />
                              <span className="font-mono text-xs">
                                {proof.verified ? "Yes" : "No"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => handleVerify(proof)}
                              disabled={
                                verifyingProofId === proof._id ||
                                !rootStatuses[proof._id]?.isValid ||
                                proof.verified === true
                              }
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {verifyingProofId === proof._id ? (
                                <>
                                  <FontAwesomeIcon
                                    icon={faSpinner}
                                    className="animate-spin mr-2"
                                  />
                                  Verifying...
                                </>
                              ) : (
                                <>Verify</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Verified;
