// Determine API base URL: use env var if set, else auto-detect local backend, else empty (proxy mode)
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }

  // In development on LAN: auto-detect local backend on same IP
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname;
    // If accessed via LAN IP (not localhost), try backend on same IP
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:8000`;
    }
  }

  // Otherwise use empty string (proxy will handle /api routes)
  return '';
};

export const API_BASE_URL = getApiBaseUrl();