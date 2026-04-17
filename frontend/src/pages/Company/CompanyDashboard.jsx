import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiUsers, FiCheckCircle, FiClock, FiTrendingUp, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getCompanyJobs, deleteCompanyJob } from '../../services/api.js';
import EditJobModal from '../../components/EditJobModal.jsx';

const isValidMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || '').trim());

const resolveCompanyId = () => {
  const direct = String(sessionStorage.getItem('companyId') || '').trim();
  if (isValidMongoId(direct)) return direct;

  try {
    const cached = JSON.parse(sessionStorage.getItem('companyData') || '{}');
    const cachedId = String(cached?._id || '').trim();
    if (isValidMongoId(cachedId)) return cachedId;
  } catch {
    // ignore malformed cached JSON
  }

  return '';
};

// CompanyDashboard: Overview with stats and recent applications
export default function CompanyDashboard() {
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const companyId = resolveCompanyId();

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      const resolvedCompanyId = resolveCompanyId();
      
      if (!resolvedCompanyId) {
        setError('Please login as company first');
        return;
      }

      sessionStorage.setItem('companyId', resolvedCompanyId);

      const response = await getCompanyJobs(resolvedCompanyId);
      setPostedJobs(response.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (jobId) => {
    if (!(await window.appConfirm('Are you sure you want to delete this job? All applications will be removed.'))) {
      return;
    }

    try {
      const resolvedCompanyId = resolveCompanyId();
      if (!resolvedCompanyId) {
        window.appAlert('Please login as company first');
        return;
      }

      sessionStorage.setItem('companyId', resolvedCompanyId);
      await deleteCompanyJob(resolvedCompanyId, jobId);
      window.appAlert('✅ Job deleted successfully');
      fetchCompanyJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      window.appAlert('Failed to delete job: ' + (err.message || ''));
    }
  };

  const handleEditSuccess = () => {
    fetchCompanyJobs();
  };


  // Calculate stats
  const totalJobs = postedJobs.length;
  const approvedJobs = postedJobs.filter(job => job.status === 'approved').length;
  const pendingJobs = postedJobs.filter(job => job.status === 'pending').length;
  const totalApplicants = postedJobs.reduce((sum, job) => sum + (job.applicants?.length || 0), 0);

  const isJobExpired = (job) => {
    if (!job?.applicationDeadline) return false;
    return new Date(job.applicationDeadline) < new Date();
  };

  // Get recent applications (flatten all applicants from all jobs)
  const recentApplications = postedJobs
    .filter(job => job.applicants && job.applicants.length > 0)
    .flatMap(job => 
      job.applicants.map(applicant => ({
        ...applicant,
        jobTitle: job.jobTitle,
        jobId: job._id
      }))
    )
    .slice(0, 5); // Show only 5 most recent

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header with Stats */}
      <header className="bg-gradient-to-r from-cyan-700 to-blue-700 p-6 rounded-2xl shadow-lg text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Manage Jobs 💼</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <p className="text-cyan-100 text-sm">Total Jobs</p>
            <p className="text-3xl font-bold">{totalJobs}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <p className="text-cyan-100 text-sm">Active</p>
            <p className="text-3xl font-bold">{approvedJobs}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <p className="text-cyan-100 text-sm">Pending</p>
            <p className="text-3xl font-bold">{pendingJobs}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <p className="text-cyan-100 text-sm">Total Applicants</p>
            <p className="text-3xl font-bold">{totalApplicants}</p>
          </div>
        </div>
      </header>

      {/* Job Cards Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Your Posted Jobs</h2>
          <Link to="/company/post-job" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            + Post New Job
          </Link>
        </div>

        {postedJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
            <FiBriefcase className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No jobs posted yet!</p>
            <Link to="/company/post-job" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postedJobs.map((job) => (
              <div key={job._id} className={`bg-white p-6 rounded-2xl shadow-sm border transition hover:shadow-md ${
                job.status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' : 
                job.status === 'approved' ? 'border-gray-200' : 
                'border-red-200 bg-red-50/30'
              }`}>
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    job.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {job.status === 'approved' ? '✓ Active' : job.status === 'pending' ? '⏳ Pending' : '✕ Rejected'}
                  </span>
                  {job.status === 'approved' && isJobExpired(job) && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Closed</span>
                  )}
                </div>

                {/* Job Info */}
                <h3 className="font-bold text-gray-800 text-lg mb-2">{job.jobTitle}</h3>
                <p className="text-sm text-gray-500 mb-1">{job.jobType}</p>
                <p className="text-sm text-gray-500 mb-1">📍 {job.location}</p>
                <p className="text-sm text-gray-600 mb-4">💰 {job.salary || 'Not specified'}</p>

                {/* Applicants Count */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 flex-wrap gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FiUsers className="text-gray-400" />
                      <span className="font-bold text-gray-900">{job.applicants?.length || 0} Applicants</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Interested: {job.interestedStudents?.length || 0} | Not Interested: {job.notInterestedStudents?.length || 0}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.status === 'approved' && (
                      <Link 
                        to={`/company/applicants/${job._id}`}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                      >
                        View Apps
                      </Link>
                    )}
                    <button
                      onClick={() => handleEditClick(job)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-xs font-medium flex items-center gap-1"
                    >
                      <FiEdit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(job._id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-medium flex items-center gap-1"
                    >
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {job.status === 'pending' && (
                  <div className="mt-3 text-xs text-yellow-600">Awaiting approval</div>
                )}

                {job.status === 'rejected' && (
                  <div className="mt-3 text-xs text-red-600">Rejected by admin</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Job Modal */}
      {showEditModal && editingJob && (
        <EditJobModal
          job={editingJob}
          companyId={companyId}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}