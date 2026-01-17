import React, { useState, useEffect } from 'react';
import { Edit2, FileText, Upload, Download, X, Check } from 'lucide-react'; 
import { getStudentProfile, updateStudentProfile, updateStudentSkills, uploadResume } from '../../services/api.js';

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    branch: '',
    cgpa: '',
    phone: '',
    skills: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Get stored student ID from localStorage
  const studentId = localStorage.getItem('studentId');

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
    }
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const response = await getStudentProfile(studentId);
      if (response?.data) {
        const data = response.data;
        setProfileData(data);
        setFormData({
          fullname: data.fullname || '',
          email: data.email || '',
          branch: data.branch || '',
          cgpa: data.cgpa || '',
          phone: data.phone || '',
          skills: data.skills || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateStudentProfile(studentId, formData);
      await updateStudentSkills(studentId, formData.skills);
      await fetchStudentProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingResume(true);
      const formDataFile = new FormData();
      formDataFile.append('resume', file);
      await uploadResume(studentId, formDataFile);
      await fetchStudentProfile();
      alert('Resume uploaded successfully');
    } catch (error) {
      console.error('Failed to upload resume:', error);
      alert('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  if (!profileData) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Loading profile...</div>;
  }

  const initials = profileData.fullname
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'S';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-600"></div>
        
        <div className="px-6 pb-6">
          {/* Avatar & Header */}
          <div className="relative flex justify-between items-end -mt-6 mb-8">
            <div className="flex items-end gap-8"> 
              <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg z-10">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 border border-gray-200">{initials}</div>
              </div>
              {!isEditing ? (
                <div className="mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.fullname}</h2>
                  <p className="text-blue-600 font-medium">B.Tech - {profileData.branch}</p>
                </div>
              ) : (
                <div className="mb-1 flex-1">
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="w-full text-2xl font-bold text-gray-900 border-b-2 border-blue-500 outline-none"
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full text-blue-600 font-medium border-b-2 border-blue-500 outline-none"
                    placeholder="Branch"
                  />
                </div>
              )}
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition shadow-sm"
              >
                <Edit2 size={16}/> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  <Check size={16}/> Save
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    fetchStudentProfile();
                  }}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition shadow-sm"
                >
                  <X size={16}/> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Academic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 border-b pb-2">Academic Details</h3>
              {!isEditing ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-500">Enrollment No.</p><p className="font-semibold text-gray-800">{profileData.enrollmentNo}</p></div>
                  <div><p className="text-gray-500">Current CGPA</p><p className="font-semibold text-green-600 bg-green-50 inline-block px-2 rounded">{profileData.cgpa || 'N/A'}</p></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-500">Enrollment No.</p><p className="font-semibold text-gray-800">{profileData.enrollmentNo}</p></div>
                  <div><p className="text-gray-500">Current CGPA</p>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleInputChange}
                      className="w-full border-b-2 border-blue-500 outline-none font-semibold"
                      placeholder="CGPA"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Contact Info */}
            <div className="space-y-4">
               <h3 className="font-bold text-gray-900 border-b pb-2">Contact Info</h3>
               {!isEditing ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-dashed border-gray-100 pb-2"><span className="text-gray-500">Email</span><span className="font-medium text-gray-800">{profileData.email}</span></div>
                  <div className="flex justify-between border-b border-dashed border-gray-100 pb-2"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-800">{profileData.phone || 'N/A'}</span></div>
                </div>
               ) : (
                <div className="space-y-3 text-sm">
                  <div><span className="text-gray-500 block mb-1">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border-b-2 border-blue-500 outline-none font-medium"
                      placeholder="Email"
                    />
                  </div>
                  <div><span className="text-gray-500 block mb-1">Phone</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border-b-2 border-blue-500 outline-none font-medium"
                      placeholder="Phone"
                    />
                  </div>
                </div>
               )}
            </div>
          </div>

          {/* Skills & Resume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Resume UI */}
             <div>
               <h3 className="font-bold text-gray-900 border-b pb-2 mb-3">Resume</h3>
               {profileData.resumeUrl ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg text-red-600"><FileText size={20}/></div>
                    <div><p className="text-sm font-semibold text-gray-800">Resume</p></div>
                  </div>
                  <a href={profileData.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><Download size={18}/></a>
                </div>
               ) : (
                <p className="text-gray-500 text-sm">No resume uploaded</p>
               )}
               {isEditing && (
                <label className="mt-3 block">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    className="hidden"
                  />
                  <span className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition cursor-pointer">
                    <Upload size={16}/> {uploadingResume ? 'Uploading...' : 'Upload Resume'}
                  </span>
                </label>
               )}
             </div>
             {/* Skills UI */}
             <div>
                <h3 className="font-bold text-gray-900 border-b pb-2 mb-3">Skills</h3>
                {!isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.length > 0 ? (
                      formData.skills.map(s => (
                        <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">{s}</span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No skills added</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        className="flex-1 border border-gray-300 px-2 py-1 rounded outline-none focus:border-blue-500"
                        placeholder="Add skill"
                      />
                      <button
                        onClick={handleAddSkill}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded font-medium transition"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map(s => (
                        <div key={s} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                          {s}
                          <button
                            onClick={() => handleRemoveSkill(s)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X size={12}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;