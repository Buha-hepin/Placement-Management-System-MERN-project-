import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api.js';

function Login() {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    enrollmentNo: "",
    email: "",
    password: "",
    Location: "",
    companyName: ""
  });

  const navigate = useNavigate();

  useEffect(() => setShowPassword(false), [role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let dataToSend = { role };
      if (role === 'student') {
        dataToSend = { ...dataToSend, enrollmentNo: formData.enrollmentNo, password: formData.password };
      } else if (role === 'company') {
        dataToSend = { ...dataToSend, email: formData.email, password: formData.password };
      } else {
        dataToSend = { ...dataToSend, email: formData.email, password: formData.password };
      }

      const response = await loginUser(dataToSend);
      console.log('Login success', response);

      // Store user data in localStorage
      if (role === 'student' && response.data._id) {
        localStorage.setItem('studentId', response.data._id);
        localStorage.setItem('studentData', JSON.stringify(response.data));
      } else if (role === 'company' && response.data._id) {
        localStorage.setItem('companyId', response.data._id);
        localStorage.setItem('companyData', JSON.stringify(response.data));
      }

      // Navigate based on role
      if (role === 'student') navigate('/Student');
      else if (role === 'company') navigate('/Company/Dashboard');
      else navigate('/Admin/AdminDashboard');
    } catch (err) {
      console.error('Login error', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full px-4 py-3 rounded-lg bg-gray-100 border-gray-300 focus:outline-none focus:ring-2 focus: ring-purple-300 transition";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side */}
      <div className="w-full p-5 flex lg:w-1/2 bg-gradient-to-tr from-cyan-800 to-blue-700 items-center justify-center">
        <div className="text-center text-white px-8">
          <h1 className="text-3xl font-extrabold mb-4">Let's build a career!</h1>
          <p className="text-lg">Unlock opportunities, connect with top companies, and grow your career.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sign in</h2>

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

            {/* STUDENT */}
            {role === "student" && (
              <>
                <input
                  className={inputStyle}
                  placeholder="Enrollment No."
                  name="enrollmentNo"
                  value={formData.enrollmentNo}
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

            {/* COMPANY */}
            {role === "company" && (
              <>
                <input
                  className={inputStyle}
                  placeholder="Email"
                  name="email"
                  value={formData.email}
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
              {loading ? 'Signing in...' : `Sign in as ${role}`}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-4">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-800 font-medium hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Login