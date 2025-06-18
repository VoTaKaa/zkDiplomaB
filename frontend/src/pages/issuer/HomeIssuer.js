import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader.js";
import { getIssuerInfo } from "../../services/apiIssuer.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faIdCard,
  faIdBadge,
  faUser,
  faHashtag,
  faSchool,
  faKey,
  faFingerprint,
  faGraduationCap,
  faCircleUser,
  faUsersLine,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const MenuCard = ({ title, description, icon, to, color }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(to)}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-l-4 ${color}`}
    >
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${color
              .replace("border-l-", "bg-")
              .replace("-500", "-100")}`}
          >
            <FontAwesomeIcon
              icon={icon}
              className={`text-3xl ${color
                .replace("border-l-", "text-")
                .replace("-500", "-600")}`}
            />
          </div>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-gray-400 text-xl"
          />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-base">{description}</p>
      </div>
    </div>
  );
};

export default function HomeIssuer() {
  const menuItems = [
    {
      title: "Degree Management",
      description:
        "Issue new degrees, manage existing certificates, and view degree history",
      icon: faGraduationCap,
      to: "/degrees-issuer",
      color: "border-l-purple-500",
    },
    {
      title: "Student Management",
      description:
        "Manage students, add new students, and view student records",
      icon: faUsersLine,
      to: "/students",
      color: "border-l-green-500",
    },
  ];

  return (
    <div className="flex h-screen font-adminFont">
      <PageHeader />
      <main className="main-content w-full mt-[64px] overflow-y-auto h-[calc(100%-64px)]">
        <Helmet>
          <title>Issuer Dashboard</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Welcome to Issuer Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Manage your institution's digital credentials and student
                records
              </p>
            </div>

            {/* Menu Cards - Vertical Layout */}
            <div className="space-y-8">
              {menuItems.map((item, index) => (
                <MenuCard
                  key={index}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  to={item.to}
                  color={item.color}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
