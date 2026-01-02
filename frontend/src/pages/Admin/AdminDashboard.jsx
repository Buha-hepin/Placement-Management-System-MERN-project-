import React from 'react';
import { Users, Building2, CheckCircle, XCircle, Briefcase, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  // --- DUMMY DATA ---
  const stats = [
    { title: 'Total Students', value: '120', color: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: <Users /> },
    { title: 'Total Companies', value: '15', color: 'bg-gradient-to-br from-purple-500 to-purple-600', icon: <Building2 /> },
    { title: 'Placed Students', value: '45', color: 'bg-gradient-to-br from-green-500 to-green-600', icon: <CheckCircle /> },
    { title: 'Unplaced Students', value: '75', color: 'bg-gradient-to-br from-red-500 to-red-600', icon: <XCircle /> },
  ];

  // Ye wo companies hain jinki drive ABHI chal rahi hai
  const activeDrives = [
    { id: 1, company: 'TCS', role: 'System Engineer', deadline: '2025-01-10', applicants: 120 },
    { id: 2, company: 'Wipro', role: 'React Developer', deadline: '2025-01-08', applicants: 85 },
    { id: 3, company: 'Infosys', role: 'Data Analyst', deadline: '2025-01-05', applicants: 200 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Stats Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-50 text-sm font-medium mb-1">{stat.title}</p>
                  <h3 className="text-4xl font-bold">{stat.value}</h3>
                </div>
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Recent Active Companies Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600"/> Ongoing Placement Drives
          </h3>
          <button className="text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition">
            View All Jobs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4 pl-6">Company</th>
                <th className="p-4">Role</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">Applicants</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {activeDrives.map((drive) => (
                <tr key={drive.id} className="hover:bg-gray-50 transition group cursor-default">
                  <td className="p-4 pl-6 font-bold text-gray-800 group-hover:text-blue-600">{drive.company}</td>
                  <td className="p-4 text-gray-600">{drive.role}</td>
                  <td className="p-4 text-orange-600 font-medium">{drive.deadline}</td>
                  <td className="p-4 font-semibold text-gray-700">{drive.applicants} Applied</td>
                  <td className="p-4 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      Live
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;