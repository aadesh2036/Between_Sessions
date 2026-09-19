import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export default function PractitionerProtectedRoute({ children }) {
  const location = useLocation();
  let pracToken = localStorage.getItem('bs_prac_token');
  if (!pracToken) {
    pracToken = getCookie('bs_prac_token');
    if (pracToken) localStorage.setItem('bs_prac_token', pracToken);
  }

  if (!pracToken) {
    return <Navigate to="/practitioner/login" state={{ from: location }} replace />;
  }

  return children;
}
