import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Logo({ className = '', to }) {
  const { user } = useAuth();
  const location = useLocation();

  // Determine safe destination:
  // - If on login or registration pages, clicking logo returns to public landing page (/)
  // - If authenticated or inside the dashboard, clicking logo routes to appropriate home (/app or /practitioner)
  let target = to;
  if (!target) {
    if (location.pathname === '/login' || location.pathname === '/practitioner/login') {
      target = '/';
    } else if (location.pathname.startsWith('/practitioner')) {
      target = '/practitioner';
    } else if (location.pathname.startsWith('/app')) {
      target = '/app';
    } else if (user || localStorage.getItem('bs_token') || document.cookie.includes('bs_token=')) {
      target = '/app';
    } else if (localStorage.getItem('bs_prac_token') || document.cookie.includes('bs_prac_token=')) {
      target = '/practitioner';
    } else {
      target = '/';
    }
  }

  return (
    <Link className={`flex items-center gap-2.5 group ${className}`} to={target}>
      <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9 2.03 0 3.9-.67 5.4-1.8L12 13V2z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <span className="font-bold tracking-tight text-brand-ink text-base">Between<span className="text-brand-coral">Sessions</span></span>
    </Link>
  );
}
