import React from "react";
import { FiLogOut } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import CustomButton from "./CustomButton";

const Navbar = () => {
  const router = useLocation();
  const navigate = useNavigate();

  const logouthandler = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  return (
    <div className="glass-effect shadow-2xl px-6 py-5 mb-6 sticky top-0 z-50 border-b border-white/20 backdrop-blur-xl animate-slide-down">
      <div className="max-w-7xl flex justify-between items-center mx-auto">
        <p
          className="font-bold text-2xl flex justify-center items-center cursor-pointer gradient-text hover:scale-105 transition-transform duration-300"
          onClick={() => navigate("/")}
        >
          <span className="mr-3 text-3xl">
            <RxDashboard />
          </span>
          {router.state && router.state.type} Dashboard
        </p>
        <button 
          onClick={logouthandler}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          Logout
          <span className="text-lg">
            <FiLogOut />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
