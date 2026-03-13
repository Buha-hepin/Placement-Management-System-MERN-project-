 import React from 'react'
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { registerUser, verifyEmail } from '../services/api.js';

function Register() {
 const [role, setRole] = useState("student");
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [enrollmentError, setEnrollmentError] = useState("");
 const [showOTPVerification, setShowOTPVerification] = useState(false);
 const [otp, setOtp] = useState("");
 const [registeredEmail, setRegisteredEmail] = useState("");
 const [formData, setFormData] = useState({
   enrollmentNo: "",
   fullName: "",
   email: "",
   password: "",
   companyName: "",
   username: "",
    Location: ""
 });

  const navigate = useNavigate();

 useEffect(() => setShowPassword(false), [role]);

  const validateEnrollmentNumber = (value) => {
    
    const enrollmentRegex = /^\d{2}BE[A-Z]{2}\d{5}$/;
    if (!value) {
      setEnrollmentError("");
      return true;
    }
    if (!enrollmentRegex.test(value.trim().toUpperCase())) {
      setEnrollmentError("Invalid format. Use: YYBEBRANCHTTT## (e.g., 23BEIT30055)");
      return false;
    }
    setEnrollmentError("");
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation for enrollment number
    if (name === "enrollmentNo") {
      validateEnrollmentNumber(value);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!otp || otp.length !== 6) {
        setError("OTP must be 6 digits");
        setLoading(false);
        return;
      }

      const response = await verifyEmail(registeredEmail, otp);
      console.log("Email verified:", response);
      alert("✅ Email verified successfully! You can now login.");
      navigate('/login');
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Student-specific validation
      if (role === "student") {
        if (!formData.enrollmentNo?.trim()) {
          setError("Enrollment number is required");
          setLoading(false);
          return;
        }
        if (!validateEnrollmentNumber(formData.enrollmentNo)) {
          setError("Please fix enrollment number format");
          setLoading(false);
          return;
        }
        if (!formData.fullName?.trim()) {
          setError("Full name is required");
          setLoading(false);
          return;
        }
        if (!formData.email?.trim()) {
          setError("Email is required");
          setLoading(false);
          return;
        }
        if (!formData.password || formData.password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
      }

      let dataToSend = {
        role,
      };

      if (role === "student") {
        dataToSend = {
          ...dataToSend,
          enrollmentNo: formData.enrollmentNo.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          branch: "",
          skills: [],
          resumeUrl: "",  
        };
      } else if (role === "company") {
        dataToSend = {
          ...dataToSend,
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password,
          Location: formData.Location,
          jobPostings: [],
          about: " write the about section",
        };
      }

      const response = await registerUser(dataToSend);
      console.log("Registration successful:", response);
      
      // For student, show OTP verification screen
      if (role === "student") {
        setRegisteredEmail(formData.email);
        setShowOTPVerification(true);
        setError("");
        alert("✅ Registration successful! Check your email for the 6-digit OTP.");
      } else {
        const createdCompany = response?.data;
        if (createdCompany?._id) {
          localStorage.setItem('userId', createdCompany._id);
          localStorage.setItem('companyId', createdCompany._id);
          localStorage.setItem('role', 'company');
          localStorage.setItem('userRole', 'company');
          localStorage.setItem('companyData', JSON.stringify(createdCompany));
        }

        alert("Registration successful! Complete your company profile.");
        setFormData({
          enrollmentNo: "",
          fullName: "",
          email: "",
          password: "",
          companyName: "",
          username: "",
          Location: ""
        });
        navigate('/company/profile');
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full px-4 py-3 rounded-lg bg-gray-100 border-gray-300 focus:outline-none focus:ring-2 focus: ring-purple-300 transition";
  const gradientStyle ="bg-gradient-to-tr from-cyan-700 to-blue-700"

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side */}
      <div className="w-full p-5 flex lg:w-1/2 bg-gradient-to-tr from-cyan-800 to-blue-700 items-center justify-center">
        <div className="text-center text-white px-8">
          <h1 className="text-3xl font-extrabold mb-4">Let's build a career!</h1>
          <p className="text-lg">
            Unlock opportunities, connect with top companies, and grow your career.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          
          {/* OTP Verification Screen */}
          {showOTPVerification ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                ✉️ Verify Email
              </h2>
              
              <form onSubmit={handleVerifyOTP} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Email: {registeredEmail}
                  </label>
                  <p className="text-xs text-gray-500 mb-4">We sent a 6-digit OTP to your email. Enter it below.</p>
                  
                  <input 
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowOTPVerification(false);
                    setOtp("");
                    setError("");
                  }}
                  className="w-full py-2 text-blue-600 font-medium hover:text-blue-700"
                >
                  Back to Registration
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Create Account
              </h2>

          {/* Role Selector */}
          <div className="flex justify-center gap-3 mb-6">
            {["student", "company"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  role === r
                    ? "bg-blue-700 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
            {/* STUDENT */}
            {role === "student" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2"> Enrollment No.</label>
                  <input 
                    className={`${inputStyle} border-2 ${enrollmentError ? 'border-red-400' : 'border-blue-300'} focus:border-blue-500 uppercase`}
                    placeholder="e.g. 23BEIT30055"
                    name="enrollmentNo"
                    value={formData.enrollmentNo}
                    onChange={handleInputChange}
                    required
                  />
                  {enrollmentError && <p className="text-xs text-red-600 mt-1">❌ {enrollmentError}</p>}
                  {!enrollmentError && formData.enrollmentNo && <p className="text-xs text-green-600 mt-1">✅ Valid format</p>}
                </div>
                <input 
                  className={inputStyle} 
                  placeholder="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
                <input 
                  className={inputStyle} 
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inputStyle} pr-14`}
                    placeholder="Password (min 6 characters)"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 font-medium"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </>
            )}

            {/* COMPANY */}
            {role === "company" && (
              <>
                <input 
                  className={inputStyle} 
                  placeholder="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                />
                <input 
                  className={inputStyle} 
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <input 
                  className={inputStyle} 
                  placeholder="Location"
                  name="Location"
                  value={formData.Location}
                  onChange={handleInputChange}
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inputStyle} pr-14`}
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 font-medium"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </>
            )}

            

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-2xl disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : `Register as ${role}`}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-blue-800 font-medium hover:underline">
              Login
            </a>
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default Register