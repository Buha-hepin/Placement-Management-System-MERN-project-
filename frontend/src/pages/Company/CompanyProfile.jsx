import React, { useState } from 'react';
import { FiGlobe, FiMapPin, FiMail } from 'react-icons/fi';

export default function CompanyProfile() {
  const [companyProfile, setCompanyProfile] = useState({
    name: 'Google India', website: 'https://careers.google.com', location: 'Bangalore, India', email: 'hr@google.com', founded: '1998', size: '10,000+ Employees',
    about: 'Google is an American multinational technology company.'
  });

  const handleProfileChange = (e) => setCompanyProfile({ ...companyProfile, [e.target.name]: e.target.value });

  return (
    <div className="animate-fade-in">
       <header className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
         <h2 className="text-xl md:text-2xl font-bold text-gray-800">Company Profile 🏢</h2>
      </header>

      <div className="max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900"></div>
        <div className="px-4 md:px-8 pb-8">
          <div className="relative flex flex-col md:flex-row justify-between items-end md:items-end -mt-10 mb-8 gap-4">
            <div className="flex items-end gap-4 md:gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white p-1 rounded-xl shadow-lg flex items-center justify-center text-3xl font-bold text-blue-600">G</div>
              <div className="mb-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{companyProfile.name}</h2>
                <a href={companyProfile.website} className="text-blue-600 text-sm hover:underline flex items-center gap-1"><FiGlobe/> {companyProfile.website}</a>
              </div>
            </div>
            <button onClick={() => alert("Changes Saved!")} className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700">Save Changes</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <InputGroup label="Company Name" name="name" value={companyProfile.name} onChange={handleProfileChange} />
              <InputGroup label="Headquarters Location" name="location" value={companyProfile.location} onChange={handleProfileChange} icon={<FiMapPin />} />
              <InputGroup label="Contact Email" name="email" value={companyProfile.email} onChange={handleProfileChange} icon={<FiMail />} />
            </div>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">About Company</label>
                  <textarea name="about" value={companyProfile.about} onChange={handleProfileChange} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"></textarea>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InputGroup = ({ label, name, value, onChange, icon }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <input type="text" name={name} value={value} onChange={onChange} className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm ${icon ? 'pl-10' : ''}`} />
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{icon}</span>}
    </div>
  </div>
);