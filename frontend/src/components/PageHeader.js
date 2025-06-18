import React, { useState, useEffect, useRef, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleChevronDown,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import ZuniLogo from "../assets/ZUNI.svg";
import { useWallet } from "../context/WalletContext.js";

const PageHeader = ({ setIsSidebarOpen }) => {
  const { role, account } = useWallet();
  const name = role || "TÊN NÈ";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    window.location.href = "/logout";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format wallet address to show first 6 and last 4 characters
  const formatWalletAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white fixed top-0 w-full h-16 flex justify-between items-center px-4 border-b border-gray-300 z-50">
      {/* Left: Logo + Sidebar Toggle */}
      <div className="flex items-center gap-2">
        {/* Toggle for sidebar (mobile only) */}
        <button
          className="md:hidden text-xl text-black focus:outline-none"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        >
          &#9776;
        </button>

        {/* Logo (always visible) */}
        <div className="items-center gap-2 hidden md:flex">
          <img alt="logo" src={ZuniLogo} className="h-10 w-10" />
          <h1 className="text-xl font-bold ">zkDiploma</h1>
        </div>
      </div>

      {/* Center: Logo + title for mobile only */}
      <div className="absolute left-1/2 transform -translate-x-1/2 md:hidden flex items-center gap-2">
        <img alt="logo" src={ZuniLogo} className="h-8 w-8" />
        <h1 className="text-base font-bold">zkDiploma</h1>
      </div>

      {/* Right: Wallet Address + MetaMask Logo + Dropdown */}
      <div className="flex items-center space-x-2">
        <div className="hidden md:block">
          Hello, <span className="font-bold">{name}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full border">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
            alt="MetaMask"
            className="w-6 h-6"
          />
          <span className="font-mono text-sm font-medium">
            {formatWalletAddress(account)}
          </span>
        </div>
        {/* Optional chevron icon */}
        <button
          type="button"
          className="hidden md:block text-xs hover:text-blue-600 focus:text-blue-600"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <FontAwesomeIcon icon={faCircleChevronDown} size="lg" />
        </button>
      </div>

      {/* Dropdown logout */}
      <ul
        ref={dropdownRef}
        className={`absolute top-14 right-4 bg-white shadow-md list-none w-44 rounded-2xl border-2 transition-all duration-300 ease-in-out transform z-50
          ${
            isDropdownOpen
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }
        `}
      >
        <li>
          <button
            className="p-3 text-sm hover:bg-gray-200 block w-full text-left"
            onClick={handleLogout}
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="mx-2 text-black"
            />
            Đăng xuất
          </button>
        </li>
      </ul>
    </header>
  );
};

export default PageHeader;
