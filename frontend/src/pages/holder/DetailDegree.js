import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader.js";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faGraduationCap,
  faUser,
  faCalendarAlt,
  faMapMarkerAlt,
  faVenusMars,
  faIdCard,
  faAward,
  faBook,
  faFileAlt,
  faUniversity,
  faUserGraduate,
  faCertificate,
  faPaperPlane,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { generateProof, sendProof } from "../../services/apiHolder.js";

const InfoSection = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0">
      <FontAwesomeIcon icon={icon} className="text-blue-600 mt-1" />
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-base font-medium text-gray-900">{value || "N/A"}</p>
    </div>
  </div>
);

const DetailDegree = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { diploma } = location.state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verifierAddress, setVerifierAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [proofData, setProofData] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  useEffect(() => {
    console.log(diploma);
  }, [diploma]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSendProof = async () => {
    try {
      setIsLoading(true);
      // First generate the proof
      const proofResult = await generateProof(
        diploma.wallet_address,
        diploma.id
      );

      if (!proofResult.success) {
        throw new Error(proofResult.message || "Failed to generate proof");
      }

      setProofData(proofResult.data);

      // Then send the proof to verifier
      const sendProofData = {
        wallet_address_holder: diploma.wallet_address,
        wallet_address_verifier: verifierAddress,
        proof: proofResult.data.proof,
        root: proofResult.data.root,
      };

      const sendResult = await sendProof(sendProofData);

      if (!sendResult.success) {
        throw new Error(sendResult.message || "Failed to send proof");
      }

      alert("Proof sent successfully!");
      setIsModalOpen(false);
      setVerifierAddress("");
      setProofData(null);
    } catch (error) {
      alert(error.message || "Failed to send proof");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-adminFont">
      <PageHeader />
      <main className="main-content w-full mt-[64px] overflow-y-auto h-[calc(100%-64px)]">
        <Helmet>
          <title>Diploma Details</title>
        </Helmet>

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              <span>Back to Diplomas</span>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="text-3xl text-blue-600"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {diploma.first_name} {diploma.last_name}
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Bachelor of {diploma.major}
              </p>
            </div>

            {/* Personal Information */}
            <InfoSection title="Personal Information">
              <InfoItem
                icon={faUser}
                label="Full Name"
                value={`${diploma.first_name} ${diploma.last_name}`}
              />
              <InfoItem
                icon={faIdCard}
                label="Student ID"
                value={diploma.student_id}
              />
              <InfoItem
                icon={faCalendarAlt}
                label="Date of Birth"
                value={formatDate(diploma.date_of_birth)}
              />
              <InfoItem
                icon={faMapMarkerAlt}
                label="Place of Birth"
                value={diploma.place_of_birth}
              />
              <InfoItem
                icon={faVenusMars}
                label="Gender"
                value={diploma.gender}
              />
              <InfoItem
                icon={faUser}
                label="Ethnicity"
                value={diploma.ethnicity}
              />
            </InfoSection>

            {/* Academic Information */}
            <InfoSection title="Academic Information">
              <InfoItem
                icon={faGraduationCap}
                label="Major"
                value={diploma.major}
              />
              <InfoItem
                icon={faAward}
                label="Classification"
                value={diploma.classification}
              />
              <InfoItem icon={faBook} label="GPA" value={diploma.gpa} />
              <InfoItem
                icon={faCalendarAlt}
                label="Course Duration"
                value={diploma.course_duration}
              />
              <InfoItem
                icon={faUserGraduate}
                label="Study Type"
                value={diploma.study_type}
              />
              <InfoItem
                icon={faCalendarAlt}
                label="Graduation Year"
                value={diploma.graduation_year}
              />
            </InfoSection>

            {/* Certificate Details */}
            <InfoSection title="Certificate Details">
              <InfoItem
                icon={faCertificate}
                label="Certificate Number"
                value={diploma.certificate_number}
              />
              {diploma.old_certificate_number && (
                <InfoItem
                  icon={faCertificate}
                  label="Old Certificate Number"
                  value={diploma.old_certificate_number}
                />
              )}
              <InfoItem
                icon={faFileAlt}
                label="Decision Number"
                value={diploma.decision_number}
              />
              <InfoItem
                icon={faBook}
                label="Book Number"
                value={diploma.book_number}
              />
              <InfoItem
                icon={faCalendarAlt}
                label="Issue Date"
                value={formatDate(diploma.issue_date)}
              />
              <InfoItem
                icon={faUniversity}
                label="Institution Code"
                value={diploma.institution_code}
              />
            </InfoSection>

            {/* Send Proof Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                Send Proof
              </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Send Proof to Verifier
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verifier Wallet Address
                    </label>
                    <input
                      type="text"
                      value={verifierAddress}
                      onChange={(e) => setVerifierAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter verifier's wallet address"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setVerifierAddress("");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendProof}
                      disabled={!verifierAddress || isLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                      {isLoading ? (
                        <>
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin mr-2"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon
                            icon={faPaperPlane}
                            className="mr-2"
                          />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailDegree;
