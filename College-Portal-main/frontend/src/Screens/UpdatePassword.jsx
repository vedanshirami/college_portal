import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axiosWrapper from "../utils/AxiosWrapper";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { resetId, type } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!resetId) {
      toast.error("Invalid or expired reset link.");
      navigate("/");
    }
  }, [resetId, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!type) {
      toast.error("Invalid Reset Password Link.");
      return;
    }
    setIsLoading(true);
    toast.loading("Resetting your password...");

    try {
      const response = await axiosWrapper.post(
        `/${type}/update-password/${resetId}`,
        { password: newPassword, resetId }
      );

      toast.dismiss();
      if (response.data.success) {
        toast.success("Password reset successfully.");
        navigate("/");
      } else {
        toast.error(response.data.message || "Error resetting password.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Error resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-500/20 to-accent-500/20"></div>
      </div>

      <div className="relative w-full max-w-2xl lg:w-1/2 px-6 py-12 animate-fade-in">
        <h1 className="text-5xl font-bold gradient-text text-center mb-6 animate-scale-in">
          Update Password
        </h1>
        <form
          className="w-full p-8 bg-dark-800 border border-dark-700 rounded-3xl shadow-2xl animate-slide-down"
          onSubmit={onSubmit}
        >
          <div className="mb-6">
            <label
              className="block text-gray-300 text-sm font-semibold mb-3"
              htmlFor="newPassword"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              required
              className="w-full px-5 py-3 text-sm bg-dark-700 border-2 border-dark-600 rounded-xl focus:outline-none input-glow text-white placeholder-gray-500 transition-all duration-300 hover:border-dark-500"
              placeholder="Enter new password"
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-300 text-sm font-semibold mb-3"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              required
              className="w-full px-5 py-3 text-sm bg-dark-700 border-2 border-dark-600 rounded-xl focus:outline-none input-glow text-white placeholder-gray-500 transition-all duration-300 hover:border-dark-500"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-gradient flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
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

export default UpdatePassword;
