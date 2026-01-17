import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Search, Filter, ChevronRight } from 'lucide-react';
import { getAllApprovedJobs, applyForJob, getStudentApplications } from '../../services/api.js';

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: 'All'
  });

  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    fetchJobs();
    if (studentId) {
      fetchAppliedJobs();
    }
  }, [page, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getAllApprovedJobs(
        page,
        10,
        filters.search,
        filters.location,
        filters.jobType === 'All' ? '' : filters.jobType
      );
      setJobs(response.data.jobs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      alert('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await getStudentApplications(studentId);
      setAppliedJobs(response.data.map(job => job._id));
    } catch (error) {
      console.error('Failed to fetch applied jobs:', error);
    }
  };

  const handleApplyJob = async (jobId) => {
    if (!studentId) {
      alert('Please login first');
      return;
    }

    try {
      setLoading(true);
      await applyForJob(jobId, studentId);
      setAppliedJobs([...appliedJobs, jobId]);
      alert('Applied successfully!');
    } catch (error) {
      console.error('Failed to apply:', error);
      alert(error.message || 'Failed to apply for job');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const isJobApplied = (jobId) => appliedJobs.includes(jobId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Listings</h1>
          <p className="text-gray-600">Browse and apply to exciting job opportunities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4 lg:block">
                <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="lg:hidden text-gray-500">✕</button>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Job title or company"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="City or region"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                  <select
                    name="jobType"
                    value={filters.jobType}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>All</option>
                    <option>Full-time</option>
                    <option>Internship</option>
                    <option>Part-time</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm mb-4"
            >
              <Filter size={18} /> Filters
            </button>

            {/* Jobs List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <p className="text-gray-500 text-lg">No jobs found</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                jobs.map(job => (
                  <div
                    key={job._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{job.jobTitle}</h3>
                        <p className="text-blue-600 font-semibold">{job.companyName}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                        {job.jobType}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.jobDescription}</p>

                    {/* Job Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-gray-500" />
                        <span className="text-gray-700">{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign size={16} className="text-gray-500" />
                          <span className="text-gray-700">{job.salary}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase size={16} className="text-gray-500" />
                        <span className="text-gray-700">Min CGPA: {job.minCGPA}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-gray-500" />
                        <span className="text-gray-700">{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedJob(selectedJob === job._id ? null : job._id)}
                        className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition font-semibold"
                      >
                        <ChevronRight size={18} />
                        View Details
                      </button>
                      <button
                        onClick={() => handleApplyJob(job._id)}
                        disabled={isJobApplied(job._id) || loading}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                          isJobApplied(job._id)
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isJobApplied(job._id) ? '✓ Applied' : 'Apply Now'}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {selectedJob === job._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-2">About the Role</h4>
                        <p className="text-gray-600 text-sm mb-4">{job.jobDescription}</p>
                        
                        <h4 className="font-bold text-gray-900 mb-2">Requirements</h4>
                        <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mb-4">
                          {job.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>

                        <h4 className="font-bold text-gray-900 mb-2">All Skills Required</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map(skill => (
                            <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg ${
                      page === p
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}