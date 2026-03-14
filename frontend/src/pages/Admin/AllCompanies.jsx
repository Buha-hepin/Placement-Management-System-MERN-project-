import React, { useState, useEffect } from 'react';
import { Trash2, Search, Building2, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';

export default function AllCompanies() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedCompanyId, setExpandedCompanyId] = useState(null);
  const [companyJobs, setCompanyJobs] = useState({});
  const [jobsLoading, setJobsLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchCompanies();
  }, [page, search]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/companies?page=${page}&limit=${limit}&search=${search}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.data.companies);
        setTotalCount(data.data.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      window.appAlert('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (companyId) => {
    if (!(await window.appConfirm('Are you sure you want to delete this company and all its jobs?'))) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/companies/${companyId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      const data = await response.json();
      if (data.success) {
        window.appAlert('Company deleted successfully');
        fetchCompanies();
      }
    } catch (error) {
      console.error('Failed to delete company:', error);
      window.appAlert('Failed to delete company');
    }
  };

  const toggleCompanyJobs = async (companyId) => {
    if (expandedCompanyId === companyId) {
      setExpandedCompanyId(null);
      return;
    }

    setExpandedCompanyId(companyId);

    if (!companyJobs[companyId]) {
      try {
        setJobsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/v1/admin/companies/${companyId}/jobs`,
          { credentials: 'include' }
        );
        const data = await response.json();

        if (data.success) {
          setCompanyJobs(prev => ({ ...prev, [companyId]: data.data }));
        }
      } catch (error) {
        console.error('Failed to fetch company jobs:', error);
        window.appAlert('Failed to load company jobs');
      } finally {
        setJobsLoading(false);
      }
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="text-purple-600" /> Manage Companies
        </h1>
        <p className="text-gray-600 mt-2">View and manage all registered companies</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by company name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-transparent outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Companies ({totalCount})</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No companies found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4 pl-6">Company Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies.map((company) => (
                  <React.Fragment key={company._id}>
                    <tr className="hover:bg-gray-50 transition">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                            {company.companyName.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800">{company.companyName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{company.email}</td>
                      <td className="p-4 text-gray-600">{company.location || 'N/A'}</td>
                      <td className="p-4 text-gray-600 text-sm">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleCompanyJobs(company._id)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                            title="View jobs"
                          >
                            {expandedCompanyId === company._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <button
                            onClick={() => handleDelete(company._id)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                            title="Delete company"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedCompanyId === company._id && (
                      <tr>
                        <td colSpan={5} className="px-6 pb-6">
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Briefcase size={16} className="text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Jobs by {company.companyName}</span>
                            </div>

                            {jobsLoading && !companyJobs[company._id] ? (
                              <p className="text-sm text-gray-500">Loading jobs...</p>
                            ) : (companyJobs[company._id]?.length || 0) === 0 ? (
                              <p className="text-sm text-gray-500">No jobs posted yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {companyJobs[company._id].map((job) => (
                                  <div key={job._id} className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div>
                                      <p className="font-semibold text-gray-800">{job.jobTitle}</p>
                                      <p className="text-xs text-gray-500">{job.location || 'N/A'} • {job.jobType || 'N/A'}</p>
                                    </div>
                                    <div className={`mt-2 md:mt-0 text-xs font-semibold px-2 py-1 rounded-full ${job.status === 'approved' ? 'bg-green-100 text-green-700' : job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                      {job.status || 'pending'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-6 border-t border-gray-100">
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
    </div>
  );
}
