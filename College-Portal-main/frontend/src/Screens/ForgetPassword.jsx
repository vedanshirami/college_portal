import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axiosWrapper from "../utils/AxiosWrapper";
import CustomButton from "../components/CustomButton";

const USER_TYPES = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
};

const UserTypeSelector = ({ selected, onSelect }) => (
  <div className="flex justify-center gap-4 mb-8">
    {Object.values(USER_TYPES).map((type) => (
      <button
        key={type}
        onClick={() => onSelect(type)}
        className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
          selected === type
            ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg"
            : "bg-dark-700 text-slate-200 hover:bg-dark-600 border border-dark-600"
        }`}
      >
        {type}
      </button>
    ))}
  </div>
);

const ForgetPassword = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem("userToken");
  const [selected, setSelected] = useState(USER_TYPES.STUDENT);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (userToken) {
      navigate(`/${localStorage.getItem("userType")}`);
    }
  }, [userToken, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    toast.loading("Sending reset mail...");
    if (email === "") {
      toast.dismiss();
      toast.error("Please enter your email");
      return;
    }
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      const resp = await axiosWrapper.post(
        `/${selected.toLowerCase()}/forget-password`,
        { email },
        {
          headers: headers,
        }
      );

      if (resp.data.success) {
        toast.dismiss();
        toast.success(resp.data.message);
      } else {
        toast.dismiss();
        toast.error(resp.data.message);
      }
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error(error.response?.data?.message || "Error sending reset mail");
    } finally {
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20"></div>
      </div>

      <div className="relative w-full max-w-[40%] px-6 py-12 animate-fade-in">
        <h1 className="text-5xl font-bold gradient-text text-center mb-6 animate-scale-in">
          {selected} Forget Password
        </h1>
        <UserTypeSelector selected={selected} onSelect={setSelected} />
        <form
          className="w-full p-8 bg-dark-800 border border-dark-700 rounded-3xl shadow-2xl animate-slide-down"
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
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              className="w-full px-5 py-3 text-sm bg-dark-700 border-2 border-dark-600 rounded-xl focus:outline-none input-glow text-white placeholder-gray-500 transition-all duration-300 hover:border-dark-500"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="w-full btn-gradient flex justify-center items-center gap-3"
          >
            Send Reset Link
          </button>
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-primary-400 hover:text-accent-400 font-medium transition-colors duration-300 hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};

export default ForgetPassword;
