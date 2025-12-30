 import React from 'react'
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';


function Login() {
 const [role, setRole] = useState("student");
 const [showPassword, setShowPassword] = useState(false);

 useEffect(() => setShowPassword(false), [role]);

  const inputStyle =
    "w-full px-4 py-3 rounded-lg bg-gray-100 border-gray-300 focus:outline-none focus:ring-2 focus: ring-purple-300 transition";
  const gradientStyle ="bg-gradient-to-tr from-cyan-700 to-blue-700"

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-tr from-cyan-700 to-blue-700 items-center justify-center">
        <div className="text-center text-white px-8">
          <h1 className="text-5xl font-extrabold mb-4">Let's build a career!</h1>
          <p className="text-lg">
            Unlock opportunities, connect with top companies, and grow your career.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Sign in
          </h2>

          {/* Role Selector */}
          <div className="flex justify-center gap-3 mb-6">
            {["student", "company", "admin"].map((r) => (
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

          <form className="space-y-4 bg-white p-6 rounded-xl shadow-md">
            {/* STUDENT */}
            {role === "student" && (
              <>
                <input className={inputStyle} placeholder="Enrollment No." />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inputStyle} pr-14`}
                    placeholder="Password"
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
                <input className={inputStyle} placeholder="Email" />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inputStyle} pr-14`}
                    placeholder="Password"
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

            {/* ADMIN */}
            {role === "admin" && (
              <>
                <input className={inputStyle} placeholder="Email" />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inputStyle} pr-14`}
                    placeholder="Password"
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
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-2xl"
            >
              Register as {role}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-4">
            Don't have an account?{" "}
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