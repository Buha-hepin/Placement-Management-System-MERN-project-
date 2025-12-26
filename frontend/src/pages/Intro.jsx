import React from 'react'
import { NavLink } from 'react-router-dom';

const Sparkles = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l1.9 4.5L18 8l-4 1.5L12 14l-2-4.5L6 8l4.1-1.5L12 2z" />
    <path d="M5 14l2 2 4-4 4 4 2-2" />
  </svg>
);

const ArrowRight = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
);

export default function LoginRegister() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Left Content */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
            <Sparkles size={16} />
            Next-Gen Platform
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Build Your Career<br />
            <span className="text-blue-600">Smarter & Faster <br /> <p className="text-blue-600 ">By LDRP-ITR</p> </span>
          </h1>

          <p className="text-gray-600 text-lg">
            A modern placement and hiring ecosystem connecting students,
            companies, and administrators on a single intelligent platform. 
          </p>

          <div className="flex gap-4">
            <NavLink
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" >
              Get Started
              <ArrowRight size={18} />
            </NavLink>
            <button className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Card */}
        <div className="relative">
          <div className="absolute -top-6 -left-6 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-40"></div>

          <div className="relative bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Platform Highlights
            </h3>

            <ul className="space-y-4">
              {[
                "Smart Student Profiles",
                "Company Hiring Dashboard",
                "Admin Control Panel",
                "Secure & Scalable",
                "Real-time Notifications",
                "Compamy profiles"
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition"
                >
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-gray-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}