// API service layer: wraps fetch calls with consistent error handling
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function registerUser(payload) {
  const url = `${BASE_URL}/api/v1/users/register`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    // include credentials only if you rely on cookies for auth
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function requestStudentRegistrationOtp(enrollmentNo) {
  const url = `${BASE_URL}/api/v1/users/student-registration/request-otp`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enrollmentNo }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function verifyStudentRegistrationOtp(enrollmentNo, otp) {
  const url = `${BASE_URL}/api/v1/users/student-registration/verify-otp`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enrollmentNo, otp }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function completeStudentRegistration(payload) {
  const url = `${BASE_URL}/api/v1/users/student-registration/complete`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function loginUser(payload) {
  console.log('loginUser payload:', payload);
  const url = `${BASE_URL}/api/v1/users/login`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include'
  });
 
  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function logoutUser() {
  const url = `${BASE_URL}/api/v1/users/logout`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function verifyEmail(email, otp) {
  const url = `${BASE_URL}/api/v1/users/verify-email`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function verifyRegistrationOtp(enrollmentNo, otp) {
  const url = `${BASE_URL}/api/v1/users/verify-registration-otp`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enrollmentNo, otp }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function forgotPassword(email, role) {
  const url = `${BASE_URL}/api/v1/users/forgot-password`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, role }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function resetPassword(email, otp, newPassword, role) {
  const url = `${BASE_URL}/api/v1/users/reset-password`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp, newPassword, role }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Student Profile APIs
export async function getStudentProfile(studentId) {
  const url = `${BASE_URL}/api/v1/users/student/${studentId}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function updateStudentProfile(studentId, payload) {
  const url = `${BASE_URL}/api/v1/users/student/${studentId}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function updateStudentSkills(studentId, skills) {
  const url = `${BASE_URL}/api/v1/users/student/${studentId}/skills`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ skills }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function uploadResume(studentId, formData) {
  const url = `${BASE_URL}/api/v1/users/student/${studentId}/resume`;

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function getPlacementMaterials() {
  const url = `${BASE_URL}/api/v1/materials`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function uploadPlacementMaterial(formData) {
  const url = `${BASE_URL}/api/v1/materials/upload`;

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function deletePlacementMaterial(materialId) {
  const url = `${BASE_URL}/api/v1/materials/${materialId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function getStudentMasterRecords(page = 1, limit = 20, search = '') {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: String(search || '')
  });
  const url = `${BASE_URL}/api/v1/admin/students/master?${query.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function bulkUploadStudentMaster(records) {
  const url = `${BASE_URL}/api/v1/admin/students/master/bulk`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function deleteStudentMasterRecord(recordId) {
  const url = `${BASE_URL}/api/v1/admin/students/master/${recordId}`;
  const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
  let data;
  try { data = await res.json(); } catch { if (!res.ok) throw new Error(res.statusText || 'Request failed'); return null; }
  if (!res.ok) { throw new Error(data?.message || data?.error || res.statusText || 'Request failed'); }
  return data;
}

export async function uploadStudentMasterCsv(formData) {
  const url = `${BASE_URL}/api/v1/admin/students/master/upload-csv`;

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Job APIs
export async function getAllApprovedJobs(page = 1, limit = 10, search = "", location = "", jobType = "", studentId = "") {
  const url = `${BASE_URL}/api/v1/jobs/browse?page=${page}&limit=${limit}&search=${search}&location=${location}&jobType=${jobType}&studentId=${studentId}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function getJobDetails(jobId) {
  const url = `${BASE_URL}/api/v1/jobs/${jobId}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function applyForJob(jobId, studentId) {
  const url = `${BASE_URL}/api/v1/jobs/${jobId}/apply`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ studentId }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function setJobInterest(jobId, studentId, interest) {
  const url = `${BASE_URL}/api/v1/jobs/${jobId}/interest`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ studentId, interest }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function getCompanyPublicProfile(companyId) {
  const url = `${BASE_URL}/api/v1/companies/${companyId}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function getCompanyProfile(companyId) {
  const url = `${BASE_URL}/api/v1/companies/${companyId}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function updateCompanyProfile(companyId, payload) {
  const url = `${BASE_URL}/api/v1/companies/${companyId}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function getStudentApplications(studentId) {
  const url = `${BASE_URL}/api/v1/jobs/student/${studentId}/applications`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Withdraw a student application
export async function withdrawApplication(studentId, applicationId) {
  const url = `${BASE_URL}/api/v1/jobs/student/${studentId}/applications/${applicationId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Get jobs posted by company
export async function getCompanyJobs(companyId) {
  const url = `${BASE_URL}/api/v1/companies/${companyId}/jobs`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Delete a job posted by a company
export async function deleteCompanyJob(companyId, jobId) {
  const url = `${BASE_URL}/api/v1/jobs/${jobId}/delete`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Get applicants for a specific job
export async function getJobApplicants(jobId, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/api/v1/jobs/${jobId}/applicants${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Update applicant status (company)
export async function updateApplicantStatus(jobId, applicationId, status) {
  const url = `${BASE_URL}/api/v1/jobs/${jobId}/applicants/${applicationId}/status`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function updateApplicantsBulkStatus(jobId, applicationIds, status) {
  const url = `${BASE_URL}/api/v1/jobs/${jobId}/applicants/bulk-status`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ applicationIds, status }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Create/Post Job (Company)
export async function createJob(jobData) {
  const url = `${BASE_URL}/api/v1/jobs/create`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobData),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Edit an existing job
export async function editJob(companyId, jobId, jobData) {
  const url = `${BASE_URL}/api/v1/companies/${companyId}/jobs/${jobId}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobData),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Admin APIs
export async function getAdminDashboard() {
  const url = `${BASE_URL}/api/v1/admin/dashboard`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function getAllStudents(page = 1, limit = 10, search = "") {
  const url = `${BASE_URL}/api/v1/admin/students?page=${page}&limit=${limit}&search=${search}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export async function getAcademicMismatchStudents(page = 1, limit = 20, search = "") {
  const url = `${BASE_URL}/api/v1/admin/students/mismatches?page=${page}&limit=${limit}&search=${search}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export async function getStudentAcademicDetails(studentId) {
  const url = `${BASE_URL}/api/v1/admin/students/${studentId}/academics`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export async function updateStudentOfficialAcademics(studentId, adminAcademicRecords) {
  const url = `${BASE_URL}/api/v1/admin/students/${studentId}/official-academics`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminAcademicRecords }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export async function bulkUploadOfficialAcademics(records) {
  const url = `${BASE_URL}/api/v1/admin/students/official-academics/bulk`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export async function getAllCompanies(page = 1, limit = 10, search = "") {
  const url = `${BASE_URL}/api/v1/admin/companies?page=${page}&limit=${limit}&search=${search}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export async function deleteStudent(studentId) {
  const url = `${BASE_URL}/api/v1/admin/students/${studentId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export async function deleteCompany(companyId) {
  const url = `${BASE_URL}/api/v1/admin/companies/${companyId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// ==================== APTITUDE TEST APIs ====================

// Create aptitude test (company uploads PDF)
export async function createAptitudeTest(companyId, formData) {
  const url = `${BASE_URL}/api/v1/tests/company/${companyId}/create`;

  const res = await fetch(url, {
    method: 'POST',
    body: formData, // Already FormData with PDF file
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Get all tests created by a company
export async function getCompanyTests(companyId) {
  const url = `${BASE_URL}/api/v1/tests/company/${companyId}/tests`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Get test details
export async function getTestDetails(testId) {
  const url = `${BASE_URL}/api/v1/tests/${testId}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Get available tests for a student (tests for applied jobs + open tests)
export async function getStudentAvailableTests(studentId) {
  const url = `${BASE_URL}/api/v1/tests/student/${studentId}/available`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Start taking a test
export async function startTest(testId, studentId) {
  const url = `${BASE_URL}/api/v1/tests/${testId}/start`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Save answer to a question (gets automatically saved)
export async function saveAnswer(attemptId, questionIndex, answer, tabSwitches = 0) {
  const url = `${BASE_URL}/api/v1/tests/attempt/${attemptId}/save-answer`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionIndex, answer, tabSwitches }),
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Submit test
export async function submitTest(attemptId) {
  const url = `${BASE_URL}/api/v1/tests/attempt/${attemptId}/submit`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Get test results
export async function getTestResults(attemptId) {
  const url = `${BASE_URL}/api/v1/tests/attempt/${attemptId}/results`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Get test analytics (for company dashboard)
export async function getTestAnalytics(testId) {
  const url = `${BASE_URL}/api/v1/tests/${testId}/analytics`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

// Get student's test attempts
export async function getStudentTestAttempts(studentId) {
  const url = `${BASE_URL}/api/v1/tests/student/${studentId}/attempts`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

