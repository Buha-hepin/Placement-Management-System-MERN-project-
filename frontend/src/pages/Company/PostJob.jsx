import React, { useState } from 'react';
import { FiSave, FiSend, FiMapPin, FiDollarSign, FiBell } from 'react-icons/fi';

export default function PostJob() {
  const [jobDetails, setJobDetails] = useState({
    companyName: 'Google India', role: '', description: '', salary: '', location: '', type: 'Full Time', deadline: ''
  });
  
  const [isPublishToggleOn, setIsPublishToggleOn] = useState(false); 
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleInputChange = (e) => setJobDetails({ ...jobDetails, [e.target.name]: e.target.value });
  
  const handlePublishSubmit = () => {
    // Yahan Backend API call aayega
    setShowPublishModal(false); 
    alert("✅ Job Published Successfully!");
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
              <InputGroup label="Job Role / Title" name="role" value={jobDetails.role} onChange={handleInputChange} placeholder="e.g. Senior Software Engineer" />
              <InputGroup label="Location" name="location" value={jobDetails.location} onChange={handleInputChange} placeholder="e.g. Bangalore" icon={<FiMapPin />} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
               <InputGroup label="Salary Package" name="salary" value={jobDetails.salary} onChange={handleInputChange} placeholder="e.g. 18 - 24 LPA" icon={<FiDollarSign />} />
               <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {['Full Time', 'Internship', 'Contract'].map((type) => (
                      <button key={type} onClick={() => setJobDetails({...jobDetails, type: type})} className={`py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all border ${jobDetails.type === type ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}>{type}</button>
                    ))}
                  </div>
               </div>
            </div>
            <textarea name="description" value={jobDetails.description} onChange={handleInputChange} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Job Description..."></textarea>
          </section>
          
          <div className="flex flex-col md:flex-row gap-4">
             <button className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2">
               <FiSave /> Save as Draft
             </button>
             <button onClick={() => {setShowPublishModal(true); setAlertMessage(`Opening: ${jobDetails.role} at ${jobDetails.companyName}`);}} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
               <FiSend /> Publish Now
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
               <button onClick={() => setShowPublishModal(false)} className="flex-1 py-2.5 border rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
               <button onClick={handlePublishSubmit} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const InputGroup = ({ label, name, value, onChange, placeholder, icon }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm ${icon ? 'pl-10' : ''}`} />
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{icon}</span>}
    </div>
  </div>
);