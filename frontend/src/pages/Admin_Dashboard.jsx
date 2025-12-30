import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- ICONS (SVG) ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const LayoutDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
const Users = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const Building2 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
);
const LogOut = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);
const UploadCloud = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
);
const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Profile Dropdown Logic
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if(file) alert(`File ${file.name} ready for cross-checking!`);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-tr from-cyan-700 to-blue-700 text-white transform transition-transform duration-300 ease-in-out 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}
      >
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/80 hover:text-white">
            <XIcon />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <button onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "dashboard" ? "bg-white/20 text-white shadow-lg" : "text-blue-100 hover:bg-white/10"}`}>
            <LayoutDashboard /> <span>Dashboard</span>
          </button>
          <button onClick={() => { setActiveTab("students"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "students" ? "bg-white/20 text-white shadow-lg" : "text-blue-100 hover:bg-white/10"}`}>
            <Users /> <span>Students</span>
          </button>
          <button onClick={() => { setActiveTab("companies"); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === "companies" ? "bg-white/20 text-white shadow-lg" : "text-blue-100 hover:bg-white/10"}`}>
            <Building2 /> <span>Companies</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/20">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-200 hover:bg-red-500/20 transition">
            <LogOut /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-white  shadow-lg px-6 py-4 flex justify-between items-center relative z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <MenuIcon />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'Placement Overview'}
              {activeTab === 'students' && 'Manage Students'}
              {activeTab === 'companies' && 'Manage Companies'}
            </h1>
          </div>

          {/* --- ADMIN PROFILE DROPDOWN (Click to see details) --- */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition"
            >
              <div className="text-right hidden sm:block">
                <p className="text-lg font-bold text-gray-800">Principal Admin</p>
                <p className="text-sm text-gray-500">admin@ldrp.ac.in</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                <UserIcon />
              </div>
              <ChevronDown />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in z-50">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800">Admin Details</p>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Role</p>
                    <p className="text-sm font-medium text-gray-700">Placement Coordinator</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Department</p>
                    <p className="text-sm font-medium text-gray-700">IT / Computer Dept</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Last Login</p>
                    <p className="text-sm font-medium text-gray-700">Today, 10:30 AM</p>
                  </div>
                </div>
                <div className="p-2 bg-gray-50 border-t border-gray-100">
                  <button onClick={handleLogout} className="w-full py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* --- EXCEL UPLOAD SECTION --- */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-blue-900">Placement Data Verification</h2>
                  <p className="text-blue-700 text-sm">Upload Excel sheet to cross-check student eligibility & placement status.</p>
                </div>
                <label className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition cursor-pointer">
                  <UploadCloud />
                  <span>Upload Excel File</span>
                  <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                </label>
              </div>

              {/* --- STATS GRID (Updated as requested) --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Total Students */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                    <Users />
                  </div>
                  <p className="text-gray-500 text-sm mb-1">Total Students</p>
                  <h3 className="text-3xl font-bold text-gray-800">1,250</h3>
                </div>

                {/* 2. Eligible Students */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                    <Users />
                  </div>
                  <p className="text-gray-500 text-sm mb-1">Eligible Students</p>
                  <h3 className="text-3xl font-bold text-gray-800">980</h3>
                  <p className="text-xs text-green-600 mt-1">↑ 78% of Total</p>
                </div>

                {/* 3. Placed Students */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-4">
                    <Users />
                  </div>
                  <p className="text-gray-500 text-sm mb-1">Placed Students</p>
                  <h3 className="text-3xl font-bold text-gray-800">750</h3>
                  <p className="text-xs text-green-600 mt-1">↑ 60% Placed</p>
                </div>

                 {/* 4. Companies Onboarded */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
                    <Building2 />
                  </div>
                  <p className="text-gray-500 text-sm mb-1">Companies Hiring</p>
                  <h3 className="text-3xl font-bold text-gray-800">45</h3>
                  <p className="text-xs text-gray-400 mt-1">Active Drives</p>
                </div>
              </div>

              {/* RECENT DATA TABLE */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Recent Placements</h3>
                  <button className="text-sm text-blue-600 hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                      <tr>
                        <th className="px-6 py-3">Student Name</th>
                        <th className="px-6 py-3">Branch</th>
                        <th className="px-6 py-3">Placed At (Company)</th>
                        <th className="px-6 py-3">Package</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: "Rahul Patel", branch: "IT", company: "Google India", pkg: "12 LPA", status: "Placed" },
                        { name: "Amit Shah", branch: "CE", company: "TCS", pkg: "4.5 LPA", status: "Placed" },
                        { name: "Neha Desai", branch: "IT", company: "Infosys", pkg: "5 LPA", status: "Placed" },
                        { name: "Vikram Singh", branch: "Mech", company: "L&T", pkg: "6 LPA", status: "Placed" },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                          <td className="px-6 py-4">{row.branch}</td>
                          <td className="px-6 py-4 font-bold text-blue-700">{row.company}</td>
                          <td className="px-6 py-4 text-green-600 font-medium">{row.pkg}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* OTHER TABS Placeholder */}
          {activeTab === 'students' && <div className="p-10 text-center text-gray-500">Manage Students Section</div>}
          {activeTab === 'companies' && <div className="p-10 text-center text-gray-500">Manage Companies Section</div>}

        </main>
      </div>
    </div>
  );
}