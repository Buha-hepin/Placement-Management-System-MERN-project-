import React, { useState } from 'react';
import { FiSend, FiMapPin, FiBell } from 'react-icons/fi';
import { createJob } from '../../services/api.js';

const isValidMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || '').trim());

const resolveCompanyId = () => {
  const direct = String(localStorage.getItem('companyId') || '').trim();
  if (isValidMongoId(direct)) return direct;

  const fallbackUserId = String(localStorage.getItem('userId') || '').trim();
  if (isValidMongoId(fallbackUserId)) return fallbackUserId;

  try {
    const cached = JSON.parse(localStorage.getItem('companyData') || '{}');
    const cachedId = String(cached?._id || '').trim();
    if (isValidMongoId(cachedId)) return cachedId;
  } catch {
    // ignore malformed cached JSON
  }

  return '';
};

// PostJob: form to create a job; maps UI fields to backend Job schema
export default function PostJob() {
  const [jobDetails, setJobDetails] = useState({
    companyName: '', role: '', description: '', salary: '', location: '', type: 'Full-time', deadline: '', skills: '', requirements: '', minCGPA: '6.0'
  });
  
  const [isPublishToggleOn, setIsPublishToggleOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => setJobDetails({ ...jobDetails, [e.target.name]: e.target.value });
  
  const handlePublishSubmit = async () => {
    try {
      setLoading(true);
      
      // Get company ID from localStorage
      const companyId = resolveCompanyId();
      const companyData = JSON.parse(localStorage.getItem('companyData') || '{}');
      
      if (!companyId) {
        window.appAlert('Please login as company first!');
        return;
      }

      localStorage.setItem('companyId', companyId);

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
        minCGPA: Number(jobDetails.minCGPA || 0)
      };

      await createJob(jobData);
      window.appAlert("✅ Job Published Successfully!");
      
      // Reset form
      setJobDetails({
        companyName: '', role: '', description: '', salary: '', location: '', type: 'Full-time', deadline: '', skills: '', requirements: '', minCGPA: '6.0'
      });
    } catch (error) {
      console.error('Error posting job:', error);
      window.appAlert('Failed to post job: ' + error.message);
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
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Package (INR, LPA)</label>
                 <div className="relative">
                   <input
                     type="number"
                     name="salary"
                     min="0"
                     step="0.1"
                     inputMode="decimal"
                     value={jobDetails.salary}
                     onChange={(e) => setJobDetails({ ...jobDetails, salary: e.target.value })}
                     placeholder="e.g. 18"
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm pl-10 pr-14"
                   />
                   <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">LPA</span>
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum CGPA</label>
                 <div className="relative">
                   <input
                     type="number"
                     name="minCGPA"
                     min="0"
                     max="10"
                     step="0.1"
                     inputMode="decimal"
                     value={jobDetails.minCGPA}
                     onChange={handleInputChange}
                     placeholder="e.g. 6.5"
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                   />
                 </div>
               </div>
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
             <button onClick={handlePublishSubmit} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
               <FiSend /> {loading ? 'Publishing...' : 'Publish Now'}
             </button>
          </div>
        </div>

        {/* Preview Card */}
        <div className="xl:col-span-1">
           <div className="sticky top-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
             <h3 className="text-xl font-bold text-gray-900 mb-1">{jobDetails.companyName || 'Company Name'}</h3>
             <p className="text-blue-600 font-semibold text-sm mb-4">{jobDetails.role || 'Job Role'}</p>
             
             <div className="space-y-3 text-xs text-gray-600 mb-4 pb-4 border-b">
               <div className="flex items-center gap-2"><FiMapPin className="text-blue-600" /> {jobDetails.location || 'Location'}</div>
               <div className="flex items-center gap-2"><span className="text-green-600 font-semibold">₹</span> {jobDetails.salary || 'Salary'}</div>
               <div className="flex items-center gap-2">🎓 Min CGPA: {jobDetails.minCGPA || '0.0'}</div>
               <div className="flex items-center gap-2">📋 {jobDetails.type || 'Job Type'}</div>
               <div className="flex items-center gap-2">📅 Deadline: {jobDetails.deadline || 'Not set'}</div>
             </div>

             <p className="text-xs text-gray-500 whitespace-pre-wrap line-clamp-4 mb-4">{jobDetails.description || 'Job description will appear here...'}</p>
             
             {jobDetails.skills && <div className="text-xs mb-2"><span className="font-semibold">Skills:</span> <p className="whitespace-pre-wrap text-gray-600">{jobDetails.skills}</p></div>}
             {jobDetails.requirements && <div className="text-xs mb-2"><span className="font-semibold">Requirements:</span> <p className="whitespace-pre-wrap text-gray-600">{jobDetails.requirements}</p></div>}
             
             <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700">Apply Now</button>
           </div>
        </div>
      </div>

      {/* Modal Popup Removed - Job publishes directly */}
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