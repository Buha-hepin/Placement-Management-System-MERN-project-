import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Briefcase, MapPin } from 'lucide-react';

export default function ApproveJobs() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rejectingJobId, setRejectingJobId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const limit = 10;

  useEffect(() => {
    fetchPendingJobs();
  }, [page, search]);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/jobs/pending?page=${page}&limit=${limit}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data.jobs);
        setTotalCount(data.data.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      window.appAlert('Failed to fetch pending jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    if (!(await window.appConfirm('Approve this job posting?'))) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/jobs/${jobId}/approve`,
        { method: 'PUT', credentials: 'include' }
      );
      const data = await response.json();

      if (data.success) {
        window.appAlert('Job approved successfully!');
        fetchPendingJobs();
      }
    } catch (error) {
      console.error('Failed to approve job:', error);
      window.appAlert('Failed to approve job');
    }
  };

  const handleReject = async (jobId) => {
    if (!rejectReason.trim()) {
      window.appAlert('Please enter a rejection reason');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/jobs/${jobId}/reject`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rejectionReason: rejectReason }),
          credentials: 'include'
        }
      );
      const data = await response.json();

      if (data.success) {
        window.appAlert('Job rejected successfully');
        setRejectingJobId(null);
        setRejectReason('');
        fetchPendingJobs();
      }
    } catch (error) {
      console.error('Failed to reject job:', error);
      window.appAlert('Failed to reject job');
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Briefcase className="text-indigo-600" /> Approve Jobs
        </h1>
        <p className="text-gray-600 mt-2">Review and approve pending job postings</p>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-yellow-800 font-semibold">Pending Approvals</p>
          <p className="text-3xl font-bold text-yellow-900 mt-1">{totalCount}</p>
        </div>
        <div className="text-5xl text-yellow-300">⏳</div>
      </div>

      {/* Pending Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-500">Loading pending jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">No pending jobs!</p>
            <p className="text-gray-500 mt-2">All jobs have been reviewed.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                      {job.companyId?.companyName?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{job.jobTitle}</h3>
                      <p className="text-indigo-600 font-semibold">{job.companyId?.companyName || 'Company'}</p>
                    </div>
                  </div>

                  {/* Job Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={18} className="text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400 font-semibold">₹</span>
                      <span>{job.salary} LPA</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-sm">📋 {job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-sm">📅 Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{job.jobDescription}</p>

                  {/* Skills & Requirements */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills?.map((skill, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 md:w-48">
                  <button
                    onClick={() => handleApprove(job._id)}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button
                    onClick={() => setRejectingJobId(job._id)}
                    className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2 border border-red-200"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>

              {/* Reject Modal */}
              {rejectingJobId === job._id && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <label className="block text-sm font-semibold text-red-800 mb-2">
                    Rejection Reason:
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full p-3 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    rows="3"
                  />
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => {
                        setRejectingJobId(null);
                        setRejectReason('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(job._id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white rounded-2xl p-6 border border-gray-100">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
