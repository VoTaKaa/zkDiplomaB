import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.js";
import { Helmet } from "react-helmet";
import Swal from "sweetalert2";
import { createDiplomas, updateTxs } from "../../services/apiIssuer.js";
import diplomaSamples from "../../assets/diploma_samples.json";
import { addRoot } from "../../services/blockchain.service.js";
import { ethers } from "ethers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPlus,
  faDownload,
  faUpload,
  faCopy,
  faGraduationCap,
  faCalendarAlt,
  faUser,
  faSchool,
} from "@fortawesome/free-solid-svg-icons";
import AOS from "aos";
import "aos/dist/aos.css";

function formatDateToDDMMYYYY(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

const formatDate = (dateObj) => {
  const { day, month, year } = dateObj;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const shortenDID = (did) => {
  if (!did) return "";
  return `${did.slice(0, 22)}...${did.slice(-22)}`;
};

const handleCopy = (value) => {
  navigator.clipboard.writeText(value);
  alert("Copied to clipboard!");
};

// Mock data for Diplomas
const mockDiplomas = [
  {
    id: 1,
    first_name: "Tan Khoa",
    last_name: "Vo",
    holder_did: "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
    major: "Software Engineering",
    faculty: "Faculty of Information Technology",
    study_type: "Full-time",
    course_duration: "2020-2024",
    graduation_year: 2024,
    classification: "Good",
    gpa: 8.25,
    issue_date: "2024-06-15",
    certificate_number: "CB00624/20KH2/2021",
    student_id: "20520555",
    signature: "0x1234...abcd",
    created_at: "2024-06-15T10:30:00Z",
  },
  {
    id: 2,
    first_name: "Van An",
    last_name: "Nguyen",
    holder_did: "did:ethr:0xabcdef1234567890abcdef1234567890abcdef12",
    major: "Software Engineering",
    faculty: "Faculty of Information Technology",
    study_type: "Full-time",
    course_duration: "2020-2024",
    graduation_year: 2024,
    classification: "Excellent",
    gpa: 9.0,
    issue_date: "2024-06-15",
    certificate_number: "CB00625/20KH2/2021",
    student_id: "20520556",
    signature: "0xabcd...5678",
    created_at: "2024-06-15T14:20:00Z",
  },
];

export default function ShowDiplomas() {
  const [activeTab, setActiveTab] = useState("tab1");
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState(mockDiplomas);
  const [totalDiplomas, setTotalDiplomas] = useState(2);
  const [uploadedDiplomas, setUploadedDiplomas] = useState([]);

  const [selectedDiploma, setSelectedDiploma] = useState(null);
  const [showDiplomaModal, setShowDiplomaModal] = useState(false);

  const [registedDIDStatus, setRegistedDIDStatus] = useState("true");

  // Get encrypted data from session storage for API calls
  const persistRootRaw = sessionStorage.getItem("persist:root");
  const persistRoot = JSON.parse(persistRootRaw || "{}");

  const [Diplomas, setDiplomas] = useState([]);

  const changeTab = (e) => {
    setActiveTab(e);
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    console.log("File selected:", file);

    if (!file) {
      console.log("No file selected");
      return;
    }

    if (file.type !== "application/json") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please upload a valid .json file.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        console.log("Reading file:", file.name, "size:", file.size, "bytes");
        const data = JSON.parse(event.target.result);
        console.log("Parsed JSON data:", data);

        // Handle both formats: direct array or {samples: [...]}
        let Diplomas = Array.isArray(data) ? data : data.samples || [];

        if (Diplomas.length === 0) {
          Swal.fire({
            icon: "warning",
            title: "No Data",
            text: "No Diploma data found in the uploaded file.",
          });
          return;
        }

        setDiplomas(Diplomas);

        // Validate and process each Diploma
        const processedDiplomas = Diplomas.map((Diploma, index) => {
          // Check required fields
          const requiredFields = [
            "first_name",
            "last_name",
            "major",
            "graduation_year",
          ];
          const missingFields = requiredFields.filter(
            (field) => !Diploma[field]
          );

          if (missingFields.length > 0) {
            console.warn(`Diploma ${index + 1} missing fields:`, missingFields);
          }

          return {
            ...Diploma,
            // Ensure all required fields have default values
            first_name: Diploma.first_name || "Unknown",
            last_name: Diploma.last_name || "Student",
            major: Diploma.major || "Unknown Major",
            graduation_year:
              Diploma.graduation_year || new Date().getFullYear(),
            classification: Diploma.classification || "Good",
            gpa: Diploma.gpa || 0,
            study_type: Diploma.study_type || "Full-time",
            certificate_number:
              Diploma.certificate_number || `CERT${Date.now()}${index}`,
            issue_date:
              Diploma.issue_date || new Date().toISOString().split("T")[0],
            student_id: Diploma.student_id || `STU${Date.now()}${index}`,
            course_duration: Diploma.course_duration || "4 years",
            faculty: "Faculty of Information Technology", // Default faculty
          };
        });

        console.log("Processed Diplomas:", processedDiplomas);
        setUploadedDiplomas(processedDiplomas);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Uploaded ${Diplomas.length} Diplomas successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("JSON parse error:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Invalid JSON file format.",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setUploadedDiplomas([]);
    // Reset file input to allow uploading the same file again
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
    console.log("Cleared uploaded Diplomas and reset file input");
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await createDiplomas(Diplomas);
      console.log("Response:", response);
      if (response?.success) {
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

        const responseAddRoot = await addRoot({
          root: response.data.merkleData.root,
        });
        console.log("ResponseAddRoot:", responseAddRoot);
        if (responseAddRoot?.success) {
          const responseUpdateTxs = await updateTxs(
            response.data.merkleData.root,
            responseAddRoot.txHash
          );
          console.log("Response:", responseUpdateTxs);
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Diplomas added successfully",
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to add root",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
          showConfirmButton: true,
          timer: 4000,
        });
      }
    } catch (error) {
      console.error("Error submitting Diplomas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const json = JSON.stringify(diplomaSamples, null, 2);
    const blob = new Blob([json], { type: "application/json" });

    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "diploma_template.json";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const viewDiplomaDetails = (Diploma) => {
    setSelectedDiploma(Diploma);
    setShowDiplomaModal(true);
  };

  return (
    <div className="flex h-screen font-adminFont">
      <PageHeader />
      <main className="main-content w-full mt-[64px] overflow-y-auto h-[calc(100%-64px)]">
        <Helmet>
          <title>Diploma Management</title>
        </Helmet>

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Diploma Management
              </h1>
              <p className="text-gray-600">
                Issue and manage digital Diplomas and certificates
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => changeTab("tab1")}
                    className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "tab1"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-2" />
                    View Diplomas ({totalDiplomas})
                  </button>
                  <button
                    onClick={() => changeTab("tab2")}
                    className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "tab2"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Issue Diplomas
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "tab1" && (
                  <div data-aos="fade-up">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Graduate Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Diploma Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Issue Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((Diploma) => (
                            <tr key={Diploma.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {Diploma.first_name} {Diploma.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500 font-mono">
                                    {shortenDID(Diploma.holder_did)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {Diploma.major}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {Diploma.faculty}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {Diploma.study_type} •{" "}
                                    {Diploma.course_duration}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatDateToDDMMYYYY(Diploma.issue_date)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Graduated: {Diploma.graduation_year}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => viewDiplomaDetails(Diploma)}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "tab2" && (
                  <div data-aos="fade-up" className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Download Template
                      </button>
                      <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                        <FontAwesomeIcon icon={faUpload} className="mr-2" />
                        Upload JSON File
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {uploadedDiplomas.length > 0 && (
                      <div className="bg-white rounded-lg border">
                        <div className="p-4 border-b">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">
                              Uploaded Diplomas ({uploadedDiplomas.length})
                            </h3>
                            <div className="flex gap-2">
                              <button
                                onClick={handleClear}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                              >
                                Clear All
                              </button>
                              <button
                                onClick={handleSubmit}
                                disabled={
                                  isLoading || registedDIDStatus !== "true"
                                }
                                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                              >
                                {isLoading
                                  ? "Processing..."
                                  : "Submit Diplomas"}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">
                                  No
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">
                                  Name
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">
                                  Student ID
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">
                                  Major
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">
                                  Classification
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">
                                  GPA
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">
                                  Graduation Year
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">
                                  Certificate No
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">
                                  Issue Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {uploadedDiplomas.map((Diploma, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2">{index + 1}</td>
                                  <td className="px-3 py-2 font-medium">
                                    {Diploma.first_name} {Diploma.last_name}
                                  </td>
                                  <td className="px-3 py-2">
                                    {Diploma.student_id}
                                  </td>
                                  <td className="px-3 py-2">{Diploma.major}</td>
                                  <td className="px-3 py-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        Diploma.classification === "Excellent"
                                          ? "bg-green-100 text-green-800"
                                          : Diploma.classification ===
                                            "Very Good"
                                          ? "bg-blue-100 text-blue-800"
                                          : Diploma.classification === "Good"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {Diploma.classification}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">{Diploma.gpa}</td>
                                  <td className="px-3 py-2">
                                    {Diploma.graduation_year}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-xs">
                                    {Diploma.certificate_number}
                                  </td>
                                  <td className="px-3 py-2">
                                    {Diploma.issue_date}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {registedDIDStatus !== "true" && (
                          <div className="p-4 bg-red-50 border-t">
                            <p className="text-sm text-red-600">
                              Please register your DID before issuing Diplomas.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Diploma Details Modal */}
        {showDiplomaModal && selectedDiploma && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="mr-2 text-blue-600"
                />
                Diploma Certificate Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="font-medium text-gray-700 flex items-center">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="mr-2 text-gray-500"
                      />
                      Graduate Name:
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedDiploma.first_name} {selectedDiploma.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Major:</label>
                    <p className="text-gray-900 mt-1">
                      {selectedDiploma.major}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700 flex items-center">
                      <FontAwesomeIcon
                        icon={faSchool}
                        className="mr-2 text-gray-500"
                      />
                      Faculty:
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedDiploma.faculty}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">
                      Student ID:
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedDiploma.student_id}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">
                      Study Type:
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedDiploma.study_type}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="font-medium text-gray-700">
                      Course Duration:
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedDiploma.course_duration}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">
                      Graduation Year:
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedDiploma.graduation_year}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">
                      Classification:
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedDiploma.classification}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">GPA:</label>
                    <p className="text-gray-900 mt-1">{selectedDiploma.gpa}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700 flex items-center">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="mr-2 text-gray-500"
                      />
                      Issue Date:
                    </label>
                    <p className="text-gray-900 mt-1">
                      {formatDateToDDMMYYYY(selectedDiploma.issue_date)}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">
                      Certificate Number:
                    </label>
                    <p className="text-gray-900 mt-1">
                      {selectedDiploma.certificate_number}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="font-medium text-gray-700">DID:</label>
                  <div className="flex items-center mt-1">
                    <p className="text-gray-900 font-mono break-all">
                      {selectedDiploma.holder_did}
                    </p>
                    <button
                      onClick={() => handleCopy(selectedDiploma.holder_did)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-700">
                    Digital Signature:
                  </label>
                  <div className="flex items-center mt-1">
                    <p className="text-gray-900 font-mono break-all">
                      {selectedDiploma.signature}
                    </p>
                    <button
                      onClick={() => handleCopy(selectedDiploma.signature)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDiplomaModal(false)}
                className="mt-6 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-lg font-medium">
                Processing...
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
