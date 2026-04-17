import React, { useState, useEffect, useRef } from 'react';
import { Edit2, FileText, Upload, Download, X, Check } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { getStudentProfile, updateStudentProfile, updateStudentSkills, uploadResume } from '../../services/api.js';

const MAX_VISIBLE_SEMESTER = 6;

const buildDefaultSemesters = () => (
  Array.from({ length: MAX_VISIBLE_SEMESTER }, (_, index) => ({
    semester: index + 1,
    spi: '',
    cpi: '',
    backlogCount: 0,
    backlogSubjects: []
  }))
);

const mergeSemesterRecords = (records = []) => {
  const base = buildDefaultSemesters();
  if (!Array.isArray(records)) return base;

  const map = new Map(records.map((r) => [Number(r.semester), r]));
  return base.map((entry) => {
    const found = map.get(entry.semester);
    if (!found) return entry;
    return {
      semester: entry.semester,
      spi: found.spi ?? '',
      cpi: found.cpi ?? '',
      backlogCount: Number(found.backlogCount || 0),
      backlogSubjects: Array.isArray(found.backlogSubjects) ? found.backlogSubjects : []
    };
  });
};

const isValidMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || '').trim());

const resolveStoredStudentId = () => {
  const direct = String(sessionStorage.getItem('studentId') || sessionStorage.getItem('userId') || '').trim();
  if (isValidMongoId(direct)) return direct;

  try {
    const cachedStudent = JSON.parse(sessionStorage.getItem('studentData') || '{}');
    const cachedId = String(cachedStudent?._id || '').trim();
    if (isValidMongoId(cachedId)) return cachedId;
  } catch {
    // Ignore malformed cached JSON.
  }

  return '';
};

const broadcastStudentProfileSync = (student) => {
  window.dispatchEvent(
    new CustomEvent('student-profile-synced', {
      detail: student || null
    })
  );
};

const StudentProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    branch: '',
    cgpa: '',
    phone: '',
    skills: [],
    semesterAcademicRecords: buildDefaultSemesters()
  });
  const [skillInput, setSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const officialJsonInputRef = useRef(null);

  const resolveResumeUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    return `${base}${url}`;
  };

  // Resolve student ID safely to avoid API calls with stale/non-Mongo IDs.
  const studentId = resolveStoredStudentId();

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
    } else {
      sessionStorage.removeItem('studentId');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('studentData');
      setLoading(false);
      setProfileError('Student session is invalid. Please login again.');
    }
  }, [studentId]);

  const fetchStudentProfile = async (targetId = studentId) => {
    if (!isValidMongoId(targetId)) {
      setProfileError('Invalid student session. Please login again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setProfileError('');
      const response = await getStudentProfile(targetId);
      if (response?.data) {
        const data = response.data;
        if (data?._id) {
          sessionStorage.setItem('studentId', data._id);
          sessionStorage.setItem('userId', data._id);
        }
        setProfileData(data);
        setFormData({
          fullname: data.fullname || '',
          email: data.email || '',
          branch: data.branch || '',
          cgpa: data.cgpa || '',
          phone: data.phone || '',
          skills: data.skills || [],
          semesterAcademicRecords: mergeSemesterRecords(data.semesterAcademicRecords || [])
        });
        broadcastStudentProfileSync(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      const message = error?.message || 'Failed to load profile';
      setProfileError(message);

      if (String(message).toLowerCase().includes('student not found')) {
        sessionStorage.removeItem('studentId');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('studentData');
      }
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
    const targetStudentId = String(profileData?._id || studentId || '').trim();
    if (!isValidMongoId(targetStudentId)) {
      window.appAlert('Invalid student session. Please login again.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await updateStudentProfile(targetStudentId, {
        fullname: formData.fullname,
        email: formData.email,
        branch: formData.branch,
        cgpa: formData.cgpa,
        phone: formData.phone,
        semesterAcademicRecords: formData.semesterAcademicRecords.map((record) => ({
          semester: record.semester,
          spi: Number(record.spi || 0),
          cpi: Number(record.cpi || 0),
          backlogCount: Number(record.backlogCount || 0),
          backlogSubjects: Array.isArray(record.backlogSubjects) ? record.backlogSubjects : []
        }))
      });
      await updateStudentSkills(targetStudentId, formData.skills);
      await fetchStudentProfile(targetStudentId);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      window.appAlert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetStudentId = String(profileData?._id || studentId || '').trim();
    if (!isValidMongoId(targetStudentId)) {
      window.appAlert('Invalid student session. Please login again.');
      navigate('/login');
      return;
    }

    try {
      setUploadingResume(true);
      const formDataFile = new FormData();
      formDataFile.append('resume', file);
      await uploadResume(targetStudentId, formDataFile);
      await fetchStudentProfile(targetStudentId);
      window.appAlert('Resume uploaded successfully');
    } catch (error) {
      console.error('Failed to upload resume:', error);
      window.appAlert(error?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSemesterRecordChange = (semester, field, value) => {
    setFormData((prev) => ({
      ...prev,
      semesterAcademicRecords: prev.semesterAcademicRecords.map((record) => {
        if (record.semester !== semester) return record;

        if (field === 'backlogSubjects') {
          const subjects = String(value || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
          return { ...record, backlogSubjects: subjects, backlogCount: subjects.length };
        }

        return { ...record, [field]: value };
      })
    }));
  };

  const handleUseAdminOfficialData = () => {
    const official = mergeSemesterRecords(profileData?.adminAcademicRecords || []);
    setFormData((prev) => ({
      ...prev,
      semesterAcademicRecords: official,
    }));

    // If present, use latest available semester CPI as current CGPA suggestion.
    const latestVisibleSemester = official.find((record) => Number(record.semester) === MAX_VISIBLE_SEMESTER);
    if (latestVisibleSemester && latestVisibleSemester.cpi !== '' && latestVisibleSemester.cpi !== undefined && latestVisibleSemester.cpi !== null) {
      setFormData((prev) => ({ ...prev, cgpa: latestVisibleSemester.cpi }));
    }
  };

  const handleImportOfficialJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const records = Array.isArray(parsed) ? parsed : parsed?.records;

      if (!Array.isArray(records) || records.length === 0) {
        throw new Error('Invalid JSON format. Expected { records: [...] }');
      }

      const currentEnrollment = String(profileData?.enrollmentNo || '').trim().toUpperCase();
      const matched = records.find(
        (item) => String(item?.enrollmentNo || '').trim().toUpperCase() === currentEnrollment
      );

      if (!matched) {
        throw new Error(`No data found for enrollment number ${currentEnrollment} in selected file.`);
      }

      const merged = mergeSemesterRecords(Array.isArray(matched.semesters) ? matched.semesters : []);
      setFormData((prev) => ({
        ...prev,
        semesterAcademicRecords: merged
      }));

      const latestVisibleSemester = merged.find((record) => Number(record.semester) === MAX_VISIBLE_SEMESTER);
      if (latestVisibleSemester && latestVisibleSemester.cpi !== '' && latestVisibleSemester.cpi !== undefined && latestVisibleSemester.cpi !== null) {
        setFormData((prev) => ({ ...prev, cgpa: latestVisibleSemester.cpi }));
      }

      window.appAlert('Official JSON data imported into semester records. Click Save to persist.');
    } catch (error) {
      console.error('Failed to import official JSON:', error);
      window.appAlert(error.message || 'Failed to import JSON file');
    } finally {
      event.target.value = '';
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Loading profile...</div>;
  }

  if (profileError) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600 font-medium">{profileError}</p>
        <button
          onClick={() => {
            if (!resolveStoredStudentId()) {
              navigate('/login');
              return;
            }
            fetchStudentProfile();
          }}
          className="mt-4 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Retry / Login
        </button>
      </div>
    );
  }

  if (!profileData) {
    return <div className="max-w-4xl mx-auto p-6 text-center">Profile not found.</div>;
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

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h3 className="font-bold text-gray-900">Semester Academic Records (Sem 1 to 6)</h3>
              <div className="flex items-center gap-2">
                {isEditing && (profileData?.adminAcademicRecords || []).length > 0 && (
                  <button
                    type="button"
                    onClick={handleUseAdminOfficialData}
                    className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    Use Admin Official Data
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => officialJsonInputRef.current?.click()}
                      className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    >
                      Import Official JSON
                    </button>
                    <input
                      ref={officialJsonInputRef}
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={handleImportOfficialJson}
                    />
                  </>
                )}
                {profileData.academicVerification?.hasMismatch ? (
                  <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700">
                    Mismatch Found in {profileData.academicVerification?.mismatchCount || 0} semester{(profileData.academicVerification?.mismatchCount || 0) === 1 ? '' : 's'}
                  </span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                    Verified / No mismatch
                  </span>
                )}
              </div>
            </div>

            {profileData.academicVerification?.hasMismatch && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                Admin has flagged differences in semester(s): {(profileData.academicVerification?.mismatchSemesters || []).join(', ') || 'N/A'}.
              </div>
            )}

            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-2 text-left">Semester</th>
                    <th className="p-2 text-left">SPI</th>
                    <th className="p-2 text-left">CPI</th>
                    <th className="p-2 text-left">Backlogs</th>
                    <th className="p-2 text-left">Backlog Subjects (comma separated)</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.semesterAcademicRecords.map((record) => (
                    <tr key={record.semester} className="border-t border-gray-100">
                      <td className="p-2 font-semibold text-gray-700">Sem {record.semester}</td>
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            value={record.spi}
                            onChange={(e) => handleSemesterRecordChange(record.semester, 'spi', e.target.value)}
                            className="w-24 border border-gray-300 rounded px-2 py-1"
                          />
                        ) : (
                          <span>{record.spi === '' ? 'N/A' : record.spi}</span>
                        )}
                      </td>
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.01"
                            value={record.cpi}
                            onChange={(e) => handleSemesterRecordChange(record.semester, 'cpi', e.target.value)}
                            className="w-24 border border-gray-300 rounded px-2 py-1"
                          />
                        ) : (
                          <span>{record.cpi === '' ? 'N/A' : record.cpi}</span>
                        )}
                      </td>
                      <td className="p-2">
                        <span className="inline-block px-2 py-1 rounded bg-amber-50 text-amber-700 font-medium">
                          {record.backlogCount || 0}
                        </span>
                      </td>
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={(record.backlogSubjects || []).join(', ')}
                            onChange={(e) => handleSemesterRecordChange(record.semester, 'backlogSubjects', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                            placeholder="e.g. Math-2, Physics"
                          />
                        ) : (
                          <span>{(record.backlogSubjects || []).length ? record.backlogSubjects.join(', ') : 'None'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <a href={resolveResumeUrl(profileData.resumeUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><Download size={18}/></a>
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