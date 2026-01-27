import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiDownload, FiMail } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplicants, getCompanyJobs, updateApplicantStatus, notifyApplicant, updateApplicantsBulkStatus } from '../../services/api.js';

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
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [sortBy, setSortBy] = useState('appliedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [resumeUrl, setResumeUrl] = useState('');
  const [showResume, setShowResume] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('shortlisted');

  useEffect(() => {
    fetchCompanyJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicants(selectedJobId);
    }
  }, [selectedJobId, searchTerm, statusFilter, branchFilter, minCgpa, skillsFilter, sortBy, sortOrder, page, limit]);

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
      const response = await getJobApplicants(jId, {
        search: searchTerm,
        status: statusFilter,
        branch: branchFilter,
        minCgpa,
        skills: skillsFilter,
        sortBy,
        sortOrder,
        page,
        limit,
      });
      setApplicants(response.data.applicants || []);
      setJobTitle(response.data.jobTitle || '');
      setTotalCount(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicantStatus(selectedJobId, applicationId, newStatus);
      setApplicants(prev => prev.map(a => a._id === applicationId ? { ...a, status: newStatus } : a));
    } catch (e) {
      alert('Failed to update status: ' + (e.message || '')); 
    }
  };

  return (
    <div className="space-y-6">
       {/* Header */}
       <header className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <h2 className="text-xl md:text-2xl font-bold text-gray-800">Candidate Applications 👥</h2>
             {jobTitle && <p className="text-sm text-gray-500 mt-1">For: {jobTitle}</p>}
           </div>
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
         </div>
       </header>

       {/* Stats Section - TOP - HORIZONTAL ROW */}
       <div className="grid grid-cols-3 gap-4">
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
           <p className="text-gray-600 text-sm font-medium">Total</p>
           <p className="text-3xl font-bold text-gray-900 mt-2">{totalCount || applicants.length}</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
           <p className="text-gray-600 text-sm font-medium">Shortlisted</p>
           <p className="text-3xl font-bold text-blue-600 mt-2">{applicants.filter(a => a.status === 'shortlisted').length}</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
           <p className="text-gray-600 text-sm font-medium">Ratio</p>
           <p className="text-3xl font-bold text-green-600 mt-2">
             {totalCount ? Math.round((applicants.filter(a => a.status === 'shortlisted').length / totalCount) * 100) : 0}%
           </p>
         </div>
       </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">Loading applicants...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name/email/branch"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="selected">Selected</option>
              </select>
              <input type="text" value={branchFilter} onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }} placeholder="Branch (e.g., CSE)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="number" min="0" max="10" step="0.1" value={minCgpa} onChange={(e) => { setMinCgpa(e.target.value); setPage(1); }} placeholder="Min CGPA" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="text" value={skillsFilter} onChange={(e) => { setSkillsFilter(e.target.value); setPage(1); }} placeholder="Skills (comma)" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <div className="flex gap-2">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="appliedAt">Sort: Applied</option>
                  <option value="fullname">Sort: Name</option>
                  <option value="cgpa">Sort: CGPA</option>
                  <option value="status">Sort: Status</option>
                </select>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-gray-100">
              <input type="checkbox" checked={selectAll} onChange={(e)=>{
                const checked = e.target.checked; setSelectAll(checked);
                if (checked) setSelected(new Set(applicants.map(a=>a._id))); else setSelected(new Set());
              }} />
              <span className="text-sm text-gray-600">Select all on page</span>
              <select value={bulkStatus} onChange={(e)=>setBulkStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="shortlisted">Set: Shortlisted</option>
                <option value="rejected">Set: Rejected</option>
                <option value="selected">Set: Selected</option>
                <option value="pending">Set: Pending</option>
              </select>
              <button disabled={selected.size===0 || loading} onClick={async ()=>{
                try {
                  setLoading(true);
                  await updateApplicantsBulkStatus(selectedJobId, Array.from(selected), bulkStatus);
                  setApplicants(prev => prev.map(a => selected.has(a._id) ? { ...a, status: bulkStatus } : a));
                  setSelected(new Set()); setSelectAll(false);
                } catch (e) { alert('Bulk update failed: ' + (e.message || '')); } finally { setLoading(false); }
              }} className="px-3 py-2 border rounded-lg text-sm bg-blue-600 text-white disabled:opacity-50">Apply Bulk Update</button>
              <span className="text-xs text-gray-500">Selected: {selected.size}</span>
            </div>
          </div>

          {/* Table - FULL WIDTH */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 font-semibold">
                <tr>
                  <th className="px-3 py-4">Select</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applicants.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-4">
                      <input type="checkbox" checked={selected.has(app._id)} onChange={(e)=>{
                        const next = new Set(selected);
                        if (e.target.checked) next.add(app._id); else next.delete(app._id);
                        setSelected(next);
                      }} />
                    </td>
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
                        <button
                          onClick={() => { setResumeUrl(app.student.resumeUrl); setShowResume(true); }}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Preview Resume"
                        >
                          <FiDownload />
                        </button>
                      )}
                      <button
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        title="Send Email"
                        onClick={async () => {
                          try {
                            await notifyApplicant(selectedJobId, app._id, { type: 'status-update' });
                            alert('Notification queued (dev log).');
                          } catch (e) {
                            alert('Failed to send: ' + (e.message || ''));
                          }
                        }}
                      >
                        <FiMail />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {/* Pagination */}
            {totalCount > limit && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                <span className="text-sm text-gray-500">Page {page} of {Math.ceil(totalCount/limit)}</span>
                <button disabled={page>=Math.ceil(totalCount/limit)} onClick={() => setPage(p => p+1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            )}
          </div>

          {applicants.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
              {'No applicants yet for this job.'}
            </div>
          )}
          {/* Resume Preview Modal */}
          {showResume && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowResume(false)}>
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-3 border-b flex justify-between items-center">
                  <h4 className="font-bold text-gray-800 text-sm">Resume Preview</h4>
                  <button onClick={() => setShowResume(false)} className="px-3 py-1 text-sm border rounded">Close</button>
                </div>
                <div className="h-[70vh]">
                  {resumeUrl ? (
                    <iframe title="resume" src={resumeUrl} className="w-full h-full" />
                  ) : (
                    <div className="p-6 text-center text-gray-500">Resume not available</div>
                  )}
                </div>
                <div className="p-3 border-t flex justify-end gap-2">
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm bg-green-600 text-white rounded">Download</a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}