import React, { useState, useEffect } from 'react';
import { FiTrash2, FiSend, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getCompanyJobs } from '../../services/api.js';

// CompanyDashboard: shows all jobs posted by logged-in company with counts
export default function CompanyDashboard() {
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  const fetchCompanyJobs = async () => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem('companyId');
      
      if (!companyId) {
        setError('Please login as company first');
        return;
      }

      const response = await getCompanyJobs(companyId);
      setPostedJobs(response.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = (id) => {
    if(window.confirm("Are you sure?")) {
      // TODO: API call to delete job
      setPostedJobs(postedJobs.filter(job => job._id !== id));
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center h-64">
        <p className="text-gray-500">Loading jobs...</p>
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
    <div className="animate-fade-in">
      <header className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
         <h2 className="text-xl md:text-2xl font-bold text-gray-800">Manage Jobs 💼</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postedJobs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No jobs posted yet!</p>
            <Link to="/company/post-job" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
              Post Your First Job
            </Link>
          </div>
        ) : (
          postedJobs.map((job) => (
            <div key={job._id} className={`bg-white p-6 rounded-2xl shadow-sm border transition group ${job.status === 'pending' ? 'border-dashed border-yellow-300 bg-yellow-50' : job.status === 'approved' ? 'border-gray-100' : 'border-red-200 bg-red-50'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  job.status === 'approved' ? 'bg-green-100 text-green-700' : 
                  job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {job.status}
                </span>
                <button onClick={() => handleDeleteJob(job._id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"><FiTrash2 /></button>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">{job.jobTitle}</h3>
              <p className="text-sm text-gray-500 mb-2">{job.jobType} • {job.salary || 'Not specified'}</p>
              <p className="text-xs text-gray-400 mb-4">{job.location}</p>
              
              {job.status === 'pending' ? (
                <div className="text-xs text-yellow-600 mt-2">⏳ Awaiting admin approval</div>
              ) : job.status === 'approved' ? (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm">
                  <span className="font-bold text-gray-900">{job.applicants?.length || 0} Applicants</span>
                  <Link to={`/company/applicants/${job._id}`} className="text-blue-600 hover:underline">View</Link>
                </div>
              ) : (
                <div className="text-xs text-red-600 mt-2">❌ Rejected by admin</div>
              )}
            </div>
          ))
        )}

        {/* Add New Job Card Button */}
        <Link to="/company/post-job" className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition h-auto min-h-[200px]">
          <FiPlus className="text-3xl mb-2" />
          <span className="font-bold">Post New Job</span>
        </Link>
      </div>
    </div>
  );
}