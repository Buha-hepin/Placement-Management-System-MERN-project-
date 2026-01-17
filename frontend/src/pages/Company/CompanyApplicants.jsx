import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiDownload, FiArrowLeft } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplicants, getCompanyJobs, updateApplicantStatus } from '../../services/api.js';

// CompanyApplicants: list applicants for a selected job; update statuses
export default function CompanyApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [companyJobs, setCompanyJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicants(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchCompanyJobs = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      if (!companyId) return;
      
      const response = await getCompanyJobs(companyId);
      setCompanyJobs(response.data || []);
      
      // If no job selected, select first approved job
      if (!selectedJobId && response.data && response.data.length > 0) {
        const firstApprovedJob = response.data.find(j => j.status === 'approved');
        if (firstApprovedJob) {
          setSelectedJobId(firstApprovedJob._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchApplicants = async (jId) => {
    try {
      setLoading(true);
      const response = await getJobApplicants(jId);
      setApplicants(response.data.applicants || []);
      setJobTitle(response.data.jobTitle || '');
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const u = app.student || {};
    return (
      u.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.branch || '')?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicantStatus(selectedJobId, applicationId, newStatus);
      setApplicants(prev => prev.map(a => a._id === applicationId ? { ...a, status: newStatus } : a));
    } catch (e) {
      alert('Failed to update status: ' + (e.message || '')); 
    }
  };

  return (
    <div className="animate-fade-in">
       {/* Header */}
       <header className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <h2 className="text-xl md:text-2xl font-bold text-gray-800">Candidate Applications 👥</h2>
             {jobTitle && <p className="text-sm text-gray-500 mt-1">For: {jobTitle}</p>}
           </div>
           <div className="flex items-center gap-4">
             {/* Job Selector */}
             <select 
               value={selectedJobId} 
               onChange={(e) => setSelectedJobId(e.target.value)}
               className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
             >
               <option value="">Select a job</option>
               {companyJobs.filter(j => j.status === 'approved').map(job => (
                 <option key={job._id} value={job._id}>{job.jobTitle}</option>
               ))}
             </select>
             <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
               <span className="font-bold text-blue-700">{filteredApplicants.length} Total</span>
             </div>
           </div>
         </div>
       </header>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">Loading applicants...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-lg text-gray-800">Recent Applications</h3>
            <div className="relative w-full md:w-auto">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search student..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>

          {/* Scrollable Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-900 font-semibold">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplicants.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {app.student?.fullname} <br/><span className="text-xs text-gray-400 font-normal">{app.student?.email}</span>
                    </td>
                    <td className="px-6 py-4">{app.student?.branch || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold">
                        {app.student?.cgpa || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {app.student?.skills && app.student.skills.length > 0 ? (
                          app.student.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">No skills listed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="px-3 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none bg-gray-100"
                      >
                        <option value="pending">Pending</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="selected">Selected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button 
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" 
                        title="View Profile"
                        onClick={() => alert(`View profile: ${app.student?.fullname}`)}
                      >
                        <FiEye />
                      </button>
                      {app.student?.resumeUrl && (
                        <a 
                          href={app.student.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg" 
                          title="View Resume"
                        >
                          <FiDownload />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredApplicants.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {applicants.length === 0 ? 'No applicants yet for this job.' : 'No matching applicants found.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}