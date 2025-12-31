import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiSettings, FiLogOut, FiPlus, FiMenu, FiX } from 'react-icons/fi';

export default function CompanyLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation(); // Pata lagane ke liye ki abhi konsa page khula hai

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-tr from-cyan-700 to-blue-700 text-white flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-xl font-bold">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Company</h1>
              <p className="text-xs text-blue-100 opacity-80">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/80"><FiX size={24} /></button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 mt-2">Main Menu</p>
          
          {/* LINKS FOR ROUTING */}
          <SidebarItem to="/company/post-job" icon={<FiPlus />} label="Post New Job" active={location.pathname === '/company/post-job'} />
          <SidebarItem to="/company/dashboard" icon={<FiBriefcase />} label="Manage Jobs" active={location.pathname === '/company/dashboard'} />
          <SidebarItem to="/company/profile" icon={<FiSettings />} label="Company Profile" active={location.pathname === '/company/profile'} /> 
          
          <p className="px-4 text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 mt-6">Analytics</p>
          <SidebarItem to="/company/applicants" icon={<FiUsers />} label="Applicants" active={location.pathname === '/company/applicants'} badge="3" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-100 hover:bg-red-500/20 transition">
            <FiLogOut /> <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="md:hidden flex items-center gap-3 mb-6">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white rounded-lg shadow-sm text-gray-700"><FiMenu size={24} /></button>
          <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        </div>
        
        {/* YAHAN CONTENT CHANGE HOGA */}
        <Outlet /> 

      </main>
    </div>
  );
}

// Helper Component for Sidebar Link
const SidebarItem = ({ icon, label, active, to, badge }) => (
  <Link to={to}>
    <button className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-white/20 text-white shadow-sm' : 'text-blue-100 hover:bg-white/10'}`}>
      <div className="flex items-center gap-3"><span className="text-lg">{icon}</span><span className="font-medium text-sm">{label}</span></div>
      {badge && <span className="bg-white text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  </Link>
);