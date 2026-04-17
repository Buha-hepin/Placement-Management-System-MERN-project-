import React, { useEffect, useState } from 'react';
import { FiGlobe, FiMapPin, FiMail } from 'react-icons/fi';
import companyimage from './1.jpg';
import { getCompanyProfile, updateCompanyProfile } from '../../services/api.js';

const defaultCompanyProfile = {
  companyName: '',
  email: '',
  location: '',
  about: '',
};

const isValidMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || '').trim());

const resolveCompanyId = () => {
  const direct = String(sessionStorage.getItem('companyId') || '').trim();
  if (isValidMongoId(direct)) return direct;

  try {
    const cached = JSON.parse(sessionStorage.getItem('companyData') || '{}');
    const cachedId = String(cached?._id || '').trim();
    if (isValidMongoId(cachedId)) return cachedId;
  } catch {
    // ignore malformed JSON
  }

  return '';
};

export default function CompanyProfile() {
  const [companyProfile, setCompanyProfile] = useState(defaultCompanyProfile);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const storedCompanyId = resolveCompanyId();
    const storedCompanyData = sessionStorage.getItem('companyData');

    if (storedCompanyData) {
      try {
        const parsedCompanyData = JSON.parse(storedCompanyData);
        setCompanyProfile((prev) => ({
          ...prev,
          ...parsedCompanyData,
          about: parsedCompanyData.about || parsedCompanyData.description || '',
        }));
      } catch (error) {
        console.error('Error parsing stored company data:', error);
      }
    }

    const fetchCompanyDetails = async () => {
      if (!storedCompanyId) {
          console.error('Company ID not found in sessionStorage');
        return;
      }

      try {
        const result = await getCompanyProfile(storedCompanyId);
        if (result?.data) {
          const nextProfile = {
            ...defaultCompanyProfile,
            ...result.data,
            about: result.data.about || result.data.description || '',
          };
          setCompanyProfile(nextProfile);
          sessionStorage.setItem('companyId', result.data._id || storedCompanyId);
          sessionStorage.setItem('userId', result.data._id || storedCompanyId);
          sessionStorage.setItem('role', 'company');
          sessionStorage.setItem('userRole', 'company');
          sessionStorage.setItem('companyData', JSON.stringify(result.data));
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
      }
    };

    fetchCompanyDetails();
  }, []);

  const handleProfileChange = (e) => setCompanyProfile({ ...companyProfile, [e.target.name]: e.target.value });

  const editprofile = async () => {
    try {
      const companyId = resolveCompanyId();

      if (!companyId) {
        window.appAlert('Company session not found. Please login again.');
        return;
      }

      setIsSaving(true);
      const response = await updateCompanyProfile(companyId, {
        companyName: companyProfile.companyName,
        email: companyProfile.email,
        location: companyProfile.location,
        about: companyProfile.about,
      });

      if (response?.data) {
        const updatedProfile = {
          ...defaultCompanyProfile,
          ...response.data,
          about: response.data.about || response.data.description || '',
        };
        setCompanyProfile(updatedProfile);
        sessionStorage.setItem('companyId', response.data._id || companyId);
        sessionStorage.setItem('userId', response.data._id || companyId);
        sessionStorage.setItem('role', 'company');
        sessionStorage.setItem('userRole', 'company');
        sessionStorage.setItem('companyData', JSON.stringify(response.data));
      }

      window.appAlert('Company profile updated successfully!');

    } catch (error) {
      console.error('Error updating company profile:', error);
      window.appAlert(error.message || 'Failed to update company profile');
    } finally {
      setIsSaving(false);
    }
  };

  const leter = companyProfile.companyName
  const first =leter?.charAt(0).toUpperCase();

  return (
    <div className="animate-fade-in flex flex-col justify-center items-center ">
       <header className="mb-8 w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
         <h2 className="text-xl md:text-2xl font-bold text-gray-800">Company Profile 🏢</h2>
      </header>

      <div className="max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-44 overflow-hidden items-end ">
          <img src={companyimage} alt="" />
        </div>
        <div className="px-4 md:px-8 pb-8">
          <div className="relative flex flex-col md:flex-row justify-between items-end md:items-end -mt-10 mb-8 gap-4">
            <div className="flex items-end gap-4 md:gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white p-1 rounded-xl shadow-lg flex items-center justify-center text-3xl font-bold text-blue-600">{first}</div>
              <div className="mb-1">
                <h2 className="text-xl md:text-2xl pb-5 font-bold text-gray-900">{companyProfile.companyName}</h2>
                
              </div>
            </div>
            <button onClick={editprofile} disabled={isSaving} className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">{isSaving ? 'Saving...' : 'Save Changes'}</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
                <InputGroup label="Company Name" name="companyName" value={companyProfile.companyName} onChange={handleProfileChange}/>              
                <InputGroup label="Headquarters Location" name="location" value={companyProfile.location} onChange={handleProfileChange} icon={<FiMapPin />} />
                <InputGroup label="Contact Email" name="email" value={companyProfile.email} onChange={handleProfileChange} icon={<FiMail />} />
            </div>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">About Company</label>
                  <textarea name="about" value={companyProfile.about || ''} onChange={handleProfileChange} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"></textarea>
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
      <input type="text" name={name} value={value || ''} onChange={onChange} className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm ${icon ? 'pl-10' : ''}`} />
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{icon}</span>}
    </div>
  </div>
);