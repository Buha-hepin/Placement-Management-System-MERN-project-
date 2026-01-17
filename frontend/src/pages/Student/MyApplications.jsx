import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, ChevronDown, ChevronUp, Clock, TrendingUp } from 'lucide-react';
import { getStudentApplications } from '../../services/api.js';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    if (studentId) {
      fetchApplications();
    }
  }, [studentId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getStudentApplications(studentId);
      setApplications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      alert('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = filterStatus === 'All' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✕';
      case 'pending':
        return '⏳';
      default:
        return '•';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track all your job applications and their status</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Briefcase className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              </div>
              <Briefcase className="text-red-500" size={32} />
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-500">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg font-medium">No applications yet</p>
              <p className="text-gray-400 text-sm mt-2">Start applying to jobs to see them here</p>
            </div>
          ) : (
            filteredApplications.map(application => (
              <div
                key={application._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                {/* Main Card */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === application._id ? null : application._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{application.jobTitle}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)} {application.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-blue-600 font-semibold mb-3">{application.companyName}</p>

                      {/* Quick Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={16} />
                          <span>{application.location}</span>
                        </div>
                        {application.salary && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign size={16} />
                            <span>{application.salary}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase size={16} />
                          <span>{application.jobType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span>{new Date(application.postedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expand Button */}
                    <button className="ml-4 text-gray-400 hover:text-gray-600">
                      {expandedId === application._id ? (
                        <ChevronUp size={24} />
                      ) : (
                        <ChevronDown size={24} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === application._id && (
                  <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="space-y-4">
                      {/* Job Description */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">About the Role</h4>
                        <p className="text-gray-600 text-sm">{application.jobDescription}</p>
                      </div>

                      {/* Requirements */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Requirements</h4>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                          {application.requirements && application.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Skills */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.skills && application.skills.map(skill => (
                            <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Application Timeline */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Application Details</h4>
                        <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Applied on:</span>
                            <span className="font-medium text-gray-900">{new Date(application.postedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Deadline:</span>
                            <span className="font-medium text-gray-900">{new Date(application.applicationDeadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Min CGPA Required:</span>
                            <span className="font-medium text-gray-900">{application.minCGPA}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-medium ${application.status === 'approved' ? 'text-green-600' : application.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                              {application.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}