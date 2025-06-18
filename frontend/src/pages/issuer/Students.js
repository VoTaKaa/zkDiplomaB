import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.js";
import { Helmet } from "react-helmet";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faEye,
  faPlus,
  faDownload,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import studentTemplate from "../../assets/dataStudent.example.json";
import AOS from "aos";
import "aos/dist/aos.css";

function formatGender(string) {
  if (string === "0") return "Nam";
  if (string === "1") return "Nữ";
}

function formatDateToDDMMYYYY(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

const shortenDID = (did) => {
  if (!did) return "";
  return `${did.slice(0, 20)}...${did.slice(-20)}`;
};

const handleCopy = (value) => {
  navigator.clipboard.writeText(value);
  alert("Copied to clipboard!");
};

// Mock data for students
const mockStudents = [
  {
    id: 1,
    student_id: "21522001",
    name: "Nguyễn Văn An",
    gender: "0",
    date_of_birth: "2003-01-15",
    place_of_birth: "Hồ Chí Minh",
    holder_did: "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    student_id: "21522002",
    name: "Trần Thị Bình",
    gender: "1",
    date_of_birth: "2003-02-20",
    place_of_birth: "Hà Nội",
    holder_did: "did:ethr:0xabcdef1234567890abcdef1234567890abcdef12",
    created_at: "2024-01-16T14:20:00Z",
  },
  {
    id: 3,
    student_id: "21522003",
    name: "Lê Minh Cường",
    gender: "0",
    date_of_birth: "2003-03-10",
    place_of_birth: "Đà Nẵng",
    holder_did: "did:ethr:0x567890abcdef1234567890abcdef1234567890ab",
    created_at: "2024-01-17T09:15:00Z",
  },
];

export default function Students() {
  const [activeTab, setActiveTab] = useState("tab1");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHolders, setTotalHolders] = useState(3);
  const [students, setStudents] = useState(mockStudents);
  const [uploadedStudents, setuploadedStudents] = useState([]);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const changeTab = (e) => {
    setActiveTab(e);
    if (e === "tab1") setPage(1);
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          setuploadedStudents(data);
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Invalid JSON file.",
          });
        }
      };
      reader.readAsText(file);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please upload a valid .json file.",
      });
    }
  };

  const handleClear = () => {
    setuploadedStudents([]);
  };

  const handleSubmit = () => {
    setShowPasswordPopup(true);
  };

  const handleDownloadTemplate = () => {
    const json = JSON.stringify(studentTemplate, null, 2);
    const blob = new Blob([json], { type: "application/json" });

    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "students_template.json";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  return (
    <div className="flex h-screen font-adminFont">
      <PageHeader />
      <main className="main-content w-full mt-[64px] overflow-y-auto h-[calc(100%-64px)]">
        <Helmet>
          <title>Student Management</title>
        </Helmet>

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Student Management
              </h1>
              <p className="text-gray-600">Manage students and their records</p>
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
                    View Students ({totalHolders})
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
                    Add Students
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
                              Student Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Personal Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              DID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {student.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {student.student_id}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatGender(student.gender)} -{" "}
                                  {formatDateToDDMMYYYY(student.date_of_birth)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {student.place_of_birth}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <span className="font-mono text-sm text-gray-600">
                                    {shortenDID(student.holder_did)}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleCopy(student.holder_did)
                                    }
                                    className="ml-2 text-blue-500 hover:text-blue-700"
                                  >
                                    <FontAwesomeIcon icon={faCopy} />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => viewStudentDetails(student)}
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
                      {uploadedStudents.length > 0 && (
                        <button
                          onClick={handleClear}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {uploadedStudents.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">
                          Uploaded Students ({uploadedStudents.length})
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {uploadedStudents.map((student, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 rounded border"
                            >
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-gray-600">
                                ID: {student.student_id} |{" "}
                                {formatGender(student.gender)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {isLoading ? "Processing..." : "Submit Students"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Student Details Modal */}
        {showStudentModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Student Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="font-medium">Name:</label>
                  <p className="text-gray-700">{selectedStudent.name}</p>
                </div>
                <div>
                  <label className="font-medium">Student ID:</label>
                  <p className="text-gray-700">{selectedStudent.student_id}</p>
                </div>
                <div>
                  <label className="font-medium">Gender:</label>
                  <p className="text-gray-700">
                    {formatGender(selectedStudent.gender)}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Date of Birth:</label>
                  <p className="text-gray-700">
                    {formatDateToDDMMYYYY(selectedStudent.date_of_birth)}
                  </p>
                </div>
                <div>
                  <label className="font-medium">Place of Birth:</label>
                  <p className="text-gray-700">
                    {selectedStudent.place_of_birth}
                  </p>
                </div>
                <div>
                  <label className="font-medium">DID:</label>
                  <p className="text-gray-700 font-mono break-all">
                    {selectedStudent.holder_did}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStudentModal(false)}
                className="mt-6 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
