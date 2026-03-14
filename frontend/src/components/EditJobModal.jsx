import React, { useState, useEffect } from 'react';
import { FiX, FiMapPin } from 'react-icons/fi';
import { editJob } from '../services/api.js';

export default function EditJobModal({ job, companyId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    location: '',
    salary: '',
    jobType: 'Full-time',
    skills: '',
    requirements: '',
    applicationDeadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (job) {
      setFormData({
        jobTitle: job.jobTitle || '',
        jobDescription: job.jobDescription || '',
        location: job.location || '',
        salary: job.salary || '',
        jobType: job.jobType || 'Full-time',
        skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
        requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : '',
        applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : ''
      });
    }
  }, [job]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const jobData = {
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        location: formData.location,
        salary: formData.salary,
        jobType: formData.jobType,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
        requirements: formData.requirements ? formData.requirements.split(',').map(r => r.trim()) : [],
        applicationDeadline: formData.applicationDeadline
      };

      await editJob(companyId, job._id, jobData);
      window.appAlert('✅ Job updated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating job:', err);
      setError(err.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">Edit Job</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm pl-10"
                  placeholder="e.g. Bangalore"
                />
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Salary (INR, LPA)</label>
              <div className="relative">
                <input
                  type="number"
                  name="salary"
                  min="0"
                  step="0.1"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm pl-10 pr-14"
                  placeholder="e.g. 18"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">LPA</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['Full-time', 'Internship', 'Part-time'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, jobType: type })}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                      formData.jobType === type
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Application Deadline</label>
            <input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Skills Required (comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="e.g. React, Node.js, MongoDB"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Requirements (comma-separated)</label>
            <input
              type="text"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="e.g. Bachelor's Degree, 2+ years experience"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleInputChange}
              rows="5"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Detailed job description..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Job'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
