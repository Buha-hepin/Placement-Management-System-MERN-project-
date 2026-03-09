import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../services/api.js';

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [role, setRole] = useState(location.state?.role || "student");
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email.trim() || !otp.trim() || !newPassword || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword(email.trim(), otp.trim(), newPassword, role);
      setSuccess(response.message || "Password reset successfully!");
      
      // Wait 2 seconds then redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side */}
      <div className="w-full p-5 flex lg:w-1/2 bg-gradient-to-tr from-cyan-800 to-blue-700 items-center justify-center">
        <div className="text-center text-white px-8">
          <h1 className="text-3xl font-extrabold mb-4">Set New Password</h1>
          <p className="text-lg">Enter the OTP sent to your email and create a new password.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Reset Password</h2>

          {/* Role Selector */}
          <div className="flex justify-center gap-3 mb-6">
            {["student", "company"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  role === r ? "bg-blue-700 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">OTP (6-digit code)</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-gray-700 mb-2">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 pr-14 rounded-lg bg-gray-100 border-2 border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-10 text-sm text-gray-600 font-medium"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border-2 border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-2xl disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-4">
            Remember your password?{' '}
            <a href="/login" className="text-blue-800 font-medium hover:underline">
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
