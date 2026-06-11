import React, { useState, useEffect } from "react";
import { FiLogIn } from "react-icons/fi";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { setUserToken } from "../redux/actions";
import { useDispatch } from "react-redux";
import CustomButton from "../components/CustomButton";
import axiosWrapper from "../utils/AxiosWrapper";

const USER_TYPES = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
  ALUMNI: "Alumni",
};

const LoginForm = ({ selected, onSubmit, formData, setFormData }) => (
  <form
    className="w-full p-8 bg-dark-800 border border-dark-700 rounded-3xl shadow-2xl animate-scale-in"
    onSubmit={onSubmit}
  >
    <div className="mb-6">
      <label
        className="block text-gray-300 text-sm font-semibold mb-3"
        htmlFor="email"
      >
        {selected} Email
      </label>
      <input
        type="email"
        id="email"
        required
        className="w-full px-5 py-3 text-sm bg-dark-700 border-2 border-dark-600 rounded-xl focus:outline-none input-glow text-white placeholder-gray-500 transition-all duration-300 hover:border-dark-500"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder={`Enter your ${selected.toLowerCase()} email`}
      />
    </div>
    <div className="mb-6">
      <label
        className="block text-gray-300 text-sm font-semibold mb-3"
        htmlFor="password"
      >
        Password
      </label>
      <input
        type="password"
        id="password"
        required
        className="w-full px-5 py-3 text-sm bg-dark-700 border-2 border-dark-600 rounded-xl focus:outline-none input-glow text-white placeholder-gray-500 transition-all duration-300 hover:border-dark-500"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Enter your password"
      />
    </div>
    <div className="flex items-center justify-between mb-6">
      <Link
        className="text-sm text-primary-400 hover:text-accent-400 font-medium transition-colors duration-300 hover:underline"
        to="/forget-password"
      >
        Forgot Password?
      </Link>
    </div>
    <button
      type="submit"
      className="w-full btn-gradient flex justify-center items-center gap-3 group"
    >
      <span>Login</span>
      <FiLogIn className="text-xl group-hover:translate-x-1 transition-transform duration-300" />
    </button>
  </form>
);

const UserTypeSelector = ({ selected, onSelect }) => (
  <div className="flex justify-center gap-4 mb-10 animate-slide-down">
    {Object.values(USER_TYPES).map((type) => (
      <button
        key={type}
        onClick={() => onSelect(type)}
        className={`px-8 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 transform ${
          selected === type
            ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-xl scale-110"
            : "bg-dark-800 border border-dark-700 text-gray-300 hover:scale-105 hover:bg-dark-700"
        }`}
      >
        {type}
      </button>
    ))}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [selected, setSelected] = useState(USER_TYPES.STUDENT);

  const handleUserTypeSelect = (type) => {
    const userType = type.toLowerCase();
    setSelected(type);
    setSearchParams({ type: userType });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await axiosWrapper.post(
        `/${selected.toLowerCase()}/login`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { token } = response.data.data;
      localStorage.setItem("userToken", token);
      localStorage.setItem("userType", selected);
      dispatch(setUserToken(token));
      navigate(`/${selected.toLowerCase()}`);
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      navigate(`/${localStorage.getItem("userType").toLowerCase()}`);
    }
  }, [navigate]);

  useEffect(() => {
    if (type) {
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
      setSelected(capitalizedType);
    }
  }, [type]);

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20"></div>
      </div>
      
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 px-6 py-2.5 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center gap-2 z-10"
      >
        <span>←</span> Back to Home
      </Link>
      
      <div className="relative w-full max-w-2xl lg:w-1/2 px-6 py-12 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-3 animate-slide-down">
            {selected} Login
          </h1>
          <p className="text-gray-400 text-lg">Welcome back! Please login to continue</p>
        </div>
        
        <UserTypeSelector selected={selected} onSelect={handleUserTypeSelect} />
        <LoginForm
          selected={selected}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};

export default Login;
