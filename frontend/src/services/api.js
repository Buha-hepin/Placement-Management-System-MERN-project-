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
  } catch (err) {
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

  
  // Store user role in localStorage id store by the login.jsx(51)
  localStorage.setItem('userRole', payload.role);
  
 
  let data;
  try {
    data = await res.json();
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
export async function getAllApprovedJobs(page = 1, limit = 10, search = "", location = "", jobType = "") {
  const url = `${BASE_URL}/api/v1/jobs/browse?page=${page}&limit=${limit}&search=${search}&location=${location}&jobType=${jobType}`;

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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
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
export async function getJobApplicants(jobId) {
  const url = `${BASE_URL}/api/v1/jobs/${jobId}/applicants`;

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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    if (!res.ok) throw new Error(res.statusText || 'Request failed');
    return null;
  }

  if (!res.ok) {
    const message = data?.message || data?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}