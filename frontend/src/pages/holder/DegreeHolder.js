import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader.js";
import { Helmet } from "react-helmet";
import { getDiplomaInfo } from "../../services/apiHolder.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faArrowRight,
  faCalendarAlt,
  faAward,
  faCertificate,
  faIdCard,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useWallet } from "../../context/WalletContext.js";

const DegreeCard = ({ diploma, index }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`detail`, { state: { diploma } });
  };

  const colors = [
    "border-l-blue-500",
    "border-l-green-500",
    "border-l-purple-500",
    "border-l-orange-500",
    "border-l-red-500",
    "border-l-teal-500",
  ];

  const bgColors = [
    "bg-blue-100",
    "bg-green-100",
    "bg-purple-100",
    "bg-orange-100",
    "bg-red-100",
    "bg-teal-100",
  ];

  const textColors = [
    "text-blue-600",
    "text-green-600",
    "text-purple-600",
    "text-orange-600",
    "text-red-600",
    "text-teal-600",
  ];

  const colorIndex = index % colors.length;

  // Format date to display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-l-4 ${colors[colorIndex]}`}
    >
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${bgColors[colorIndex]}`}
          >
            <FontAwesomeIcon
              icon={faGraduationCap}
              className={`text-3xl ${textColors[colorIndex]}`}
            />
          </div>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-gray-400 text-xl"
          />
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {diploma.first_name} {diploma.last_name}
            </h3>
            <div className="flex items-center gap-2 text-gray-600">
              <FontAwesomeIcon icon={faIdCard} className="text-sm" />
              <span className="text-sm">{diploma.student_id}</span>
            </div>
          </div>
          <div className="space-y-2 text-gray-600">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCertificate} className="text-sm" />
              <span className="text-sm">{diploma.major}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faAward} className="text-sm" />
              <span className="text-sm">
                {diploma.classification} (GPA: {diploma.gpa})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" />
              <span className="text-sm">Course: {diploma.course_duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <FontAwesomeIcon icon={faUser} className="text-xs" />
              <span>Certificate: {diploma.certificate_number}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DegreeHolder = () => {
  const [diplomaInfo, setDiplomaInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { account } = useWallet();

  useEffect(() => {
    const fetchDegreeInfo = async () => {
      const response = await getDiplomaInfo(account);
      if (response && response.success) {
        setDiplomaInfo(response.data.diplomas);
        console.log("Diploma info:", response.data.diplomas);
      } else {
        console.error("Error fetching diploma info:", response?.message);
      }
      setIsLoading(false);
    };
    fetchDegreeInfo();
  }, [account]);

  if (isLoading) {
    return (
      <div className="flex h-screen font-adminFont">
        <PageHeader />
        <main className="main-content w-full mt-[64px] overflow-y-auto h-[calc(100%-64px)]">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-adminFont">
      <PageHeader />
      <main className="main-content w-full mt-[64px] overflow-y-auto h-[calc(100%-64px)]">
        <Helmet>
          <title>My Digital Diplomas</title>
        </Helmet>

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                My Digital Diplomas
              </h1>
              <p className="text-lg text-gray-600">
                View and manage your verified academic credentials
              </p>
            </div>

            {/* Diplomas Grid */}
            {diplomaInfo && diplomaInfo.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {diplomaInfo.map((diploma, index) => (
                  <DegreeCard
                    key={diploma.id}
                    diploma={diploma}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    className="text-4xl text-gray-400"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Diplomas Found
                </h3>
                <p className="text-gray-500">
                  You don't have any diplomas issued yet. Contact your
                  institution for more information.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DegreeHolder;
