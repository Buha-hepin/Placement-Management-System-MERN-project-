import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/api.js';

function ForgotPassword() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    try {
      const response = await forgotPassword(email.trim(), role);
      setSuccess(response.message || "Password reset OTP sent to your email!");
      
      // Wait 2 seconds then redirect to reset password page
      setTimeout(() => {
        navigate('/reset-password', { state: { email: email.trim(), role } });
      }, 2000);
    } catch (err) {
      console.error('Forgot password error', err);
      setError(err.message || 'Failed to send reset OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side */}
      <div className="w-full p-5 flex lg:w-1/2 bg-gradient-to-tr from-cyan-800 to-blue-700 items-center justify-center">
        <div className="text-center text-white px-8">
          <h1 className="text-3xl font-extrabold mb-4">Reset Your Password</h1>
          <p className="text-lg">Enter your email and we'll send you a code to reset your password.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Forgot Password</h2>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-2xl disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
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

export default ForgotPassword;
