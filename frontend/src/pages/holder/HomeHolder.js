import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUser,
  faPaperPlane,
  faArrowRight,
  faShieldAlt,
  faUserCircle,
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

export default function HomeHolder() {
  const menuItems = [
    {
      title: "My Profile",
      description:
        "View and manage your personal information and digital identity",
      icon: faUserCircle,
      to: "/info-holder",
      color: "border-l-blue-500",
    },
    {
      title: "My Degrees",
      description: "Access your digital degrees and academic credentials",
      icon: faGraduationCap,
      to: "/degrees-holder",
      color: "border-l-green-500",
    },
    {
      title: "Send Proof",
      description:
        "Generate and send cryptographic proof of your credentials to verifiers",
      icon: faPaperPlane,
      to: "/send-proof",
      color: "border-l-purple-500",
    },
  ];

  return (
    <div className="flex h-screen font-adminFont">
      <PageHeader />
      <main className="main-content w-full mt-[64px] overflow-y-auto h-[calc(100%-64px)]">
        <Helmet>
          <title>Holder Dashboard</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="text-4xl text-blue-600"
                />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Welcome to Your Digital Wallet
              </h1>
              <p className="text-lg text-gray-600">
                Manage your digital credentials and share verified proofs
                securely
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

            {/* Info Section */}
            <div className="mt-12 bg-blue-50 rounded-2xl p-8 border border-blue-100">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    className="text-blue-600 text-2xl"
                  />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  Secure & Verified
                </h3>
                <p className="text-blue-700 leading-relaxed max-w-2xl mx-auto">
                  Your digital credentials are secured using blockchain
                  technology and zero-knowledge proofs. This ensures your
                  academic achievements are tamper-proof and can be verified
                  instantly while maintaining your privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
