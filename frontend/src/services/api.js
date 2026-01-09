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
