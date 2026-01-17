import React, { useState } from 'react';
import { FiSave, FiSend, FiMapPin, FiDollarSign, FiBell } from 'react-icons/fi';
import { createJob } from '../../services/api.js';

// PostJob: form to create a job; maps UI fields to backend Job schema
export default function PostJob() {
  const [jobDetails, setJobDetails] = useState({
    companyName: '', role: '', description: '', salary: '', location: '', type: 'Full-time', deadline: '', skills: '', requirements: ''
  });
  
  const [isPublishToggleOn, setIsPublishToggleOn] = useState(false); 
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => setJobDetails({ ...jobDetails, [e.target.name]: e.target.value });
  
  const handlePublishSubmit = async () => {
    try {
      setLoading(true);
      
      // Get company ID from localStorage
      const companyId = localStorage.getItem('companyId');
      const companyData = JSON.parse(localStorage.getItem('companyData') || '{}');
      
      if (!companyId) {
        alert('Please login as company first!');
        return;
      }

      // Prepare job data matching backend expectations
      const jobData = {
        companyId: companyId,
        companyName: companyData.companyName || jobDetails.companyName,
        jobTitle: jobDetails.role,
        jobDescription: jobDetails.description,
        location: jobDetails.location,
        salary: jobDetails.salary,
        jobType: jobDetails.type,
        skills: jobDetails.skills ? jobDetails.skills.split(',').map(s => s.trim()) : [],
        requirements: jobDetails.requirements ? jobDetails.requirements.split(',').map(r => r.trim()) : [],
        applicationDeadline: jobDetails.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        minCGPA: 6.0
      };

      await createJob(jobData);
      setShowPublishModal(false);
      alert("✅ Job Published Successfully!");
      
      // Reset form
      setJobDetails({
        companyName: '', role: '', description: '', salary: '', location: '', type: 'Full-time', deadline: '', skills: '', requirements: ''
      });
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
       <header className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
         <h2 className="text-xl md:text-2xl font-bold text-gray-800">Let's Hire! 🚀</h2>
       </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputGroup label="Company Name" name="companyName" value={jobDetails.companyName} onChange={handleInputChange} placeholder="e.g. Google India" />
              <InputGroup label="Job Role / Title" name="role" value={jobDetails.role} onChange={handleInputChange} placeholder="e.g. Senior Software Engineer" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputGroup label="Location" name="location" value={jobDetails.location} onChange={handleInputChange} placeholder="e.g. Bangalore" icon={<FiMapPin />} />
              <InputGroup label="Application Deadline" name="deadline" value={jobDetails.deadline} onChange={handleInputChange} placeholder="YYYY-MM-DD" type="date" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
               <InputGroup label="Salary Package" name="salary" value={jobDetails.salary} onChange={handleInputChange} placeholder="e.g. 18 - 24 LPA" icon={<FiDollarSign />} />
               <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {[
                      { label: 'Full Time', value: 'Full-time' },
                      { label: 'Internship', value: 'Internship' },
                      { label: 'Part Time', value: 'Part-time' }
                    ].map((typeObj) => (
                      <button key={typeObj.value} onClick={() => setJobDetails({...jobDetails, type: typeObj.value})} className={`py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all border ${jobDetails.type === typeObj.value ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}>{typeObj.label}</button>
                    ))}
                  </div>
               </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills Required (comma-separated)</label>
              <input type="text" name="skills" value={jobDetails.skills} onChange={handleInputChange} placeholder="e.g. React, Node.js, MongoDB" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Requirements (comma-separated)</label>
              <input type="text" name="requirements" value={jobDetails.requirements} onChange={handleInputChange} placeholder="e.g. Bachelor's Degree, 2+ years experience" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <textarea name="description" value={jobDetails.description} onChange={handleInputChange} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Job Description..."></textarea>
          </section>
          
          <div className="flex flex-col md:flex-row gap-4">
             <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2">
               <FiSave /> Save as Draft
             </button>
             <button onClick={() => {setShowPublishModal(true); setAlertMessage(`Opening: ${jobDetails.role} at ${jobDetails.companyName || 'your company'}`);}} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
               <FiSend /> {loading ? 'Publishing...' : 'Publish Now'}
             </button>
          </div>
        </div>

        {/* Preview Card */}
        <div className="xl:col-span-1">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
             <h3 className="text-xl font-bold text-gray-900">{jobDetails.companyName}</h3>
             <p className="text-blue-600 font-semibold text-sm mb-4">{jobDetails.role || 'Job Role'}</p>
             <p className="text-xs text-gray-500 line-clamp-3 mb-4">{jobDetails.description || 'Description will appear here...'}</p>
             <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm">Apply Now</button>
           </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4"><FiBell className="text-3xl"/></div>
            <h3 className="text-xl font-bold mb-2">Publish Job?</h3>
            <textarea value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} className="w-full p-3 border rounded-xl mb-6 text-sm bg-gray-50" rows="3"></textarea>
            <div className="flex gap-3">
               <button onClick={() => setShowPublishModal(false)} disabled={loading} className="flex-1 py-2.5 border rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50">Cancel</button>
               <button onClick={handlePublishSubmit} disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">{loading ? 'Publishing...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const InputGroup = ({ label, name, value, onChange, placeholder, icon, type = "text" }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm ${icon ? 'pl-10' : ''}`} />
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{icon}</span>}
    </div>
  </div>
);