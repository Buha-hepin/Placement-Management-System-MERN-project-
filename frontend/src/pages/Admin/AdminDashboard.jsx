import React, { useState, useEffect } from 'react';
import { Users, Building2, CheckCircle, XCircle, Briefcase, TrendingUp, Clock } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalJobs: 0,
    pendingJobs: 0,
    approvedJobs: 0,
    rejectedJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard`, {
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Students', 
      value: stats.totalStudents, 
      color: 'bg-gradient-to-br from-blue-500 to-blue-600', 
      icon: <Users className="text-2xl" /> 
    },
    { 
      title: 'Total Companies', 
      value: stats.totalCompanies, 
      color: 'bg-gradient-to-br from-purple-500 to-purple-600', 
      icon: <Building2 className="text-2xl" /> 
    },
    { 
      title: 'Total Jobs', 
      value: stats.totalJobs, 
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600', 
      icon: <Briefcase className="text-2xl" /> 
    },
    { 
      title: 'Pending Approval', 
      value: stats.pendingJobs, 
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600', 
      icon: <Clock className="text-2xl" /> 
    },
    { 
      title: 'Approved Jobs', 
      value: stats.approvedJobs, 
      color: 'bg-gradient-to-br from-green-500 to-green-600', 
      icon: <CheckCircle className="text-2xl" /> 
    },
    { 
      title: 'Rejected Jobs', 
      value: stats.rejectedJobs, 
      color: 'bg-gradient-to-br from-red-500 to-red-600', 
      icon: <XCircle className="text-2xl" /> 
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Stats Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => (
              <div 
                key={index} 
                className={`${card.color} text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-2">{card.title}</p>
                    <h3 className="text-4xl font-bold">{card.value}</h3>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Quick Links */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer">
            <div className="flex flex-col items-center text-center gap-3">
              <Users className="text-3xl text-blue-600" />
              <a href="/admin/students" className="font-semibold text-gray-800 hover:text-blue-600">Manage Students</a>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer">
            <div className="flex flex-col items-center text-center gap-3">
              <Building2 className="text-3xl text-purple-600" />
              <a href="/admin/companies" className="font-semibold text-gray-800 hover:text-purple-600">Manage Companies</a>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer">
            <div className="flex flex-col items-center text-center gap-3">
              <CheckCircle className="text-3xl text-green-600" />
              <a href="/admin/approve-jobs" className="font-semibold text-gray-800 hover:text-green-600">Approve Jobs</a>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer">
            <div className="flex flex-col items-center text-center gap-3">
              <TrendingUp className="text-3xl text-indigo-600" />
              <span className="font-semibold text-gray-800">Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AdminDashboard;