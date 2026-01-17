import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react'; 

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  // Sidebar Menu Items
  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/students', name: 'Manage Students', icon: <Users size={20} /> },
    { path: '/admin/companies', name: 'Manage Companies', icon: <Building2 size={20} /> },
    // { path: '/admin/jobs', name: 'Job Openings', icon: <Briefcase size={20} /> }, 
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* --- SIDEBAR (Blue Theme Applied ✅) --- */}
      <aside className={`bg-gradient-to-tr from-cyan-700 to-blue-700 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/20">
          {isSidebarOpen ? (
            <span className="text-xl font-bold text-white tracking-wider">TPO ADMIN</span>
          ) : (
            <span className="text-xl font-bold text-white">TPO</span>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/20 rounded text-blue-100">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 space-y-2 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div>{item.icon}</div>
                {isSidebarOpen && <span className="font-medium whitespace-nowrap">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/20">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-200 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto h-screen">
        
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {menuItems.find(i => i.path === location.pathname)?.name || 'Admin Panel'}
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-700">Admin Head</p>
              <p className="text-xs text-gray-500">Training & Placement Dept.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md border-2 border-blue-100">
              A
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-8">
           <Outlet /> 
        </div>

      </main>

    </div>
  ); // 👈 Ye missing tha shayad
};

export default AdminLayout;