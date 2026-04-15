import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAdminSession = async () => {
      const storedRole = String(localStorage.getItem('role') || '').toLowerCase();
      if (storedRole !== 'admin') {
        if (isMounted) {
          setIsAuthorized(false);
          setIsChecking(false);
        }
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard`, {
          method: 'GET',
          credentials: 'include'
        });

        if (!isMounted) return;

        if (res.ok) {
          setIsAuthorized(true);
        } else {
          localStorage.removeItem('role');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          setIsAuthorized(false);
        }
      } catch (_error) {
        if (!isMounted) return;
        setIsAuthorized(false);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    verifyAdminSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isChecking) {
    return <div className="p-6 text-sm text-gray-600">Checking admin session...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
