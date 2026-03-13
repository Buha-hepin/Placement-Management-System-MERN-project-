import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiMapPin, FiClock, FiSearch, FiFilter, FiChevronRight } from 'react-icons/fi';
import { getAllApprovedJobs, applyForJob, getStudentApplications, setJobInterest, getCompanyPublicProfile } from '../../services/api.js';

// JobListings: browse approved jobs with filters and apply action
export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
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
        filters.jobType === 'All' ? '' : filters.jobType,
        studentId || ''
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
      alert('Applied successfully! Notice: If you apply and miss the placement process 3 times, your account will be blocked from future applications.');
    } catch (error) {
      console.error('Failed to apply:', error);
      alert(error.message || 'Failed to apply for job');
    } finally {
      setLoading(false);
    }
  };

  const handleInterestChange = async (jobId, interest) => {
    if (!studentId) {
      alert('Please login first');
      return;
    }

    try {
      const response = await setJobInterest(jobId, studentId, interest);
      setJobs((prev) => prev.map((job) => {
        if (job._id !== jobId) return job;

        const interestedCount =
          interest === 'interested'
            ? (job.interestedCount || 0) + (job.interestStatus === 'interested' ? 0 : 1)
            : Math.max(0, (job.interestedCount || 0) - (job.interestStatus === 'interested' ? 1 : 0));

        const notInterestedCount =
          interest === 'not-interested'
            ? (job.notInterestedCount || 0) + (job.interestStatus === 'not-interested' ? 0 : 1)
            : Math.max(0, (job.notInterestedCount || 0) - (job.interestStatus === 'not-interested' ? 1 : 0));

        return {
          ...job,
          interestStatus: interest,
          interestedCount,
          notInterestedCount,
        };
      }));

      if (interest === 'interested') {
        alert('Marked as interested. You can apply now. Notice: If you apply but do not attend the placement process 3 times, your account will be blocked automatically.');
      } else {
        alert(response?.message || 'Marked as not interested.');
      }
      fetchJobs();
    } catch (error) {
      alert(error.message || 'Failed to update interest');
    }
  };

  const handleViewCompanyProfile = async (companyId) => {
    try {
      const response = await getCompanyPublicProfile(companyId);
      setSelectedCompany(response.data || null);
      setShowCompanyModal(true);
    } catch (error) {
      alert(error.message || 'Failed to load company profile');
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
  const isInterested = (job) => job?.interestStatus === 'interested';
  const isNotInterested = (job) => job?.interestStatus === 'not-interested';
  const isInterestLocked = (job) => isInterested(job) || isNotInterested(job);
  const isEligible = (job) => job?.isEligible !== false;
  const isJobExpired = (job) => {
    if (!job?.applicationDeadline) return false;
    return new Date(job.applicationDeadline) < new Date();
  };

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
              <FiFilter size={18} /> Filters
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
                        <button
                          onClick={() => handleViewCompanyProfile(job.companyId)}
                          className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          View Company Profile
                        </button>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        isJobExpired(job) ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {isJobExpired(job) ? 'Closed' : job.jobType}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.jobDescription}</p>

                    {/* Job Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <FiMapPin size={16} className="text-gray-500" />
                        <span className="text-gray-700">{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 font-semibold">₹</span>
                          <span className="text-gray-700">{job.salary} LPA</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <FiBriefcase size={16} className="text-gray-500" />
                        <span className="text-gray-700">Min CGPA: {job.minCGPA}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiClock size={16} className="text-gray-500" />
                        <span className="text-gray-700">{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {!isEligible(job) && (
                      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        <p className="font-semibold">You are not eligible for this job.</p>
                        <p className="mt-1">Reason: {(job.eligibilityReasons || []).join(' ')}</p>
                      </div>
                    )}

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
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => handleInterestChange(job._id, 'interested')}
                        disabled={loading || isJobExpired(job) || isInterestLocked(job) || !isEligible(job)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          isInterested(job)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                        } ${isJobExpired(job) || isInterestLocked(job) || !isEligible(job) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Interested
                      </button>
                      <button
                        onClick={() => handleInterestChange(job._id, 'not-interested')}
                        disabled={loading || isJobExpired(job) || isInterestLocked(job) || !isEligible(job)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          isNotInterested(job)
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                        } ${isJobExpired(job) || isInterestLocked(job) || !isEligible(job) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Not Interested
                      </button>
                      <button
                        onClick={() => setSelectedJob(selectedJob === job._id ? null : job._id)}
                        className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition font-semibold"
                      >
                        <FiChevronRight size={18} />
                        View Details
                      </button>
                      <button
                        onClick={() => handleApplyJob(job._id)}
                        disabled={isJobApplied(job._id) || loading || isJobExpired(job) || isNotInterested(job) || !isInterested(job) || !isEligible(job)}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                          isJobApplied(job._id)
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : isJobExpired(job)
                              ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                              : !isEligible(job)
                                ? 'bg-red-100 text-red-700 cursor-not-allowed'
                              : isNotInterested(job)
                                ? 'bg-red-100 text-red-700 cursor-not-allowed'
                                : !isInterested(job)
                                  ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isJobApplied(job._id)
                          ? '✓ Applied'
                          : isJobExpired(job)
                            ? 'Closed'
                            : !isEligible(job)
                              ? 'Not Eligible'
                            : isNotInterested(job)
                              ? 'Not Interested'
                              : !isInterested(job)
                                ? 'Mark Interested to Apply'
                                : 'Apply Now'}
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

                        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                          <span>Interested: <strong>{job.interestedCount || 0}</strong></span>
                          <span className="text-xs text-gray-500">{isInterestLocked(job) ? 'Choice locked' : 'Choose once to lock'}</span>
                          <span className="text-xs text-gray-500">Open company profile from top link</span>
                        </div>

                        {!isEligible(job) && (
                          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800">
                            Not eligible: {(job.eligibilityReasons || []).join(' ')}
                          </div>
                        )}

                        {isInterested(job) && !isJobApplied(job._id) && (
                          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                            Notice: If you apply and miss the placement process 3 times, your account will be blocked automatically.
                          </div>
                        )}
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

        {showCompanyModal && selectedCompany && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowCompanyModal(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Company Profile</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Name:</strong> {selectedCompany.companyName || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedCompany.email || 'N/A'}</p>
                <p><strong>Location:</strong> {selectedCompany.location || 'N/A'}</p>
                <p><strong>About:</strong> {selectedCompany.about || 'No details provided'}</p>
              </div>
              <div className="mt-6 text-right">
                <button onClick={() => setShowCompanyModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}